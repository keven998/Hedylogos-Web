//使用node的crypto包
var crypto = Npm.require('crypto');

/**
 * Qiniu对象
 * @param {string} ak   accessKey
 * @param {string} sk   secretKey
 * @param {string} bk   存储图片的bucket
 * @param {string} host bucket对应的host
 */
QiniuSDK = function (ak, sk, bk, host){
  this.accessKey = ak;
  this.secretKey = sk;
  this.defaultBucket = bk;
  this.defaultHost = host;

  //默认定义returnBody：返回的信息
  this.returnBody = '{' +
    '"name": $(fname),' +
    '"size": $(fsize),' +
    '"w": $(imageInfo.width),' +
    '"h": $(imageInfo.height),' +
    '"fmt": $(imageInfo.format),' +
    '"cm": $(imageInfo.colorModel),' +
    '"hash": $(etag)' +
  '}';

  /**
   * 生成上传策略
   * @param  {object} op 上传相关参数:bucket,expires(单位:s),returnbody等
   * @return {object}    scope:上传空间(bucket);deadline:有效截至日期;returnBody:相应报文
   */
  this.genPutPolicy = function(op){
    this.putPolicy = {
      scope: op && op.bucket || this.defaultBucket,
      deadline: (op && op.expires || 3600) + Math.floor(Date.now() / 1000),
      returnBody: op && op.returnBody || this.returnBody
    };
    return this.putPolicy;
  };

  /**
   * 本地上传(表单上传) —— 获取token和key
   * @param  {object} op    上传相关参数:bucket,expires,returnbody等
   * @param  {string} host  对应的七牛的host
   * @return {object}       upToken:上传令牌;key:根据uuid生成的key,作为bucket中的唯一标识
   */
  this.getUpInfo = function(op, host){
    var flags = JSON.stringify(this.genPutPolicy(op));
    var encodedFlags = base64ToUrlSafe(new Buffer(flags).toString('base64'));
    var encoded = crypto.createHmac("sha1", this.secretKey).update(encodedFlags).digest('base64');
    var encodedSign = base64ToUrlSafe(encoded);
    // var encodedSign = base64ToUrlSafe(new Buffer(encoded).toString('base64'));说好的加密呢？
    var upToken = this.accessKey + ':' + encodedSign + ':' + encodedFlags;
    var id = uuid.v1();
    // var id2 = uuid.v4();

    return {
      upToken: upToken,
      key: id,
      url: (host || this.defaultHost) + id
    };
  };

  /**
   * 网上图片上传(fetch) —— 获取path, token, url
   * @param  {string} url   图片原本url
   * @param  {string} bk    bucket-要上传的七牛空间
   * @param  {string} host  空间对应的host
   * @return {objetc}       path:
   */
  this.getFetchInfo = function(url, bk, host){
    // 获取fetch的相关参数
    var encodedURL = getUrlsafeBase64Encode(url);//image source
    var key = crypto.createHash('md5').update(url).digest('hex');

    var bucket = bk || this.defaultBucket;
    var encodedEntryURI = getEncodedEntryURI(key, bucket);//image destination

    var path = '/fetch/' + encodedURL + '/to/' + encodedEntryURI;
    var accessToken = this.getAccessToken(path);

    //发送post请求，fetch图片
    var postUrl = 'http://iovip.qbox.me' + path;
    var options = {
      headers: {
        'Authorization': 'QBox ' + accessToken,
        'Content-Type': 'application/x-www-form-urlencoded',
      }
    };

    try{
      var result = HTTP.call('POST', postUrl, options);
      var imageInfo = this.getImageBasicInfo(key);
      return {
        key: key,
        w: imageInfo.width,
        h: imageInfo.height,
        url: (host || this.defaultHost) + key,
        hash: imageInfo.hash
      };
    }catch(e){
      console.log("Fail in fetching images from remote url to qiniu!");
      console.log(e);
      return false;
    }
  };

  /**
   * 获取图片的基本信息
   * @param  {string} key  图片在空间中的key
   * @param  {string} host 所在空间对应的host
   * @return {object}
   */
  this.getImageBasicInfo = function(key, host){
    var host = host || this.defaultHost;
    var url = host + key + '?imageInfo';
    try{
      var result = HTTP.call('GET', url);
      return result.data;
    }catch(e){
      console.log("Fail in getting this image's basic info from qiniu! Key:" + key);
      console.log(e);
      return false;
    }
  };

  /**
   * 获取文件信息
   * @param  {[type]} key  [description]
   * @param  {[type]} host [description]
   * @param  {[type]} bk   [description]
   * @return {[type]}      [description]
   */
  this.getFileInfo = function(key, host, bk){
    var bucket = bk || this.defaultBucket;
    var encodedEntryURI = getEncodedEntryURI(key, bucket);
    var host = host || this.defaultHost;
    var path = '/stat/' + encodedEntryURI;
    var url = 'http://rs.qiniu.com' + path;
    var accessToken = this.getAccessToken(path);
    var options = {
      headers: {
        'Authorization': 'QBox ' + accessToken
      }
    };

    try {
      var result = HTTP.call('GET', url, options);
      return result.data;
    } catch(e) {
      console.log("Fail in getting this file's info from qiniu! Key:" + key);
      console.log(e);
      return false;
    }
  };

  /**
   * 获取管理凭证
   * @param  {string} path 发起请求的url中的<path>或<path>?<query>部分
   * @return {string}      accessToken:管理凭证
   */
  this.getAccessToken = function(path, body){
    var signingStr = path + '\n';
    signingStr += (body) ? body : '';
    var sign = crypto.createHmac("sha1", this.secretKey).update(signingStr).digest('base64');
    var encodedSign = base64ToUrlSafe(sign);
    var accessToken = this.accessKey + ":" + encodedSign;
    return accessToken;
  };

  /**
   * 音频文件转换(fpop)
   * @param  {string} src   源资源名
   * @param  {string} bk    bucket-要上传的七牛空间
   * @return {objetc}       path:
   */
  this.convertAmrToMp3 = function(src, bk){
    // 获取post内容
    var key = encodeURI(src);
    var bucket = encodeURI(bk || this.defaultBucket);
    var persistentOps = 'avthumb/mp3';
    var fops = encodeURI(persistentOps);

    if (process.env.REMOTE_PROXY) {
      var notifyURL = encodeURI(process.env.REMOTE_PROXY + '/receiveAmrInfo');
    } else {
      var notifyURL = encodeURI('http://talk.lvxingpai.com/receiveAmrInfo');
    }

    // var pipeline = pipeline;
    // var force = force;
    var params = 'bucket=' + bucket + '&key=' + key + '&fops=' + fops + '&notifyURL=' + notifyURL;

    // 获取accessToken
    var path = '/pfop/';
    var accessToken = this.getAccessToken(path, params);

    // 准备post配置
    var postUrl = 'http://api.qiniu.com' + path;
    var options = {
      headers: {
        'Authorization': 'QBox ' + accessToken,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      content: params
    };

    // 发送post请求
    try{
      var result = HTTP.call('POST', postUrl, options);
      return result;
    }catch(e){
      console.log("Fail in converting amr to mp3!");
      console.log(e);
      return false;
    }
  };
  /**
   * 构造带有凭证的下载地址
   * @param  {string} key 资源对应的key
   * @param  {[type]} bk  资源对应的bucket
   * @return {[type]}     [description]
   */
  this.getDownloadUrl = function (key, bk) {
    var bucket = bk || this.defaultBucket;
    // var host = 'http://' + bucket + '.qiniudn.com/';
    var host = this.defaultHost;
    var downloadUrl = host + key + '?e=' + Math.round(new Date().getTime()/1000 + 24 * 60 * 60);
    var token = this.getDownloadToken(downloadUrl);
    return (downloadUrl + '&token=' + token);
  };
  /**
   * 构造下载凭证
   * @param  {string} url 包括过期时间的下载地址
   * @return {[type]}     [description]
   */
  this.getDownloadToken = function (url) {
    var sign = crypto.createHmac("sha1", this.secretKey).update(url).digest('base64');
    var encodedSign = base64ToUrlSafe(sign);
    var accessKey = ak || defaultAccessKey;
    return accessKey + ':' + encodedSign;
  };
}

function getEncodedEntryURI(key, bk){
  var entry = bk + ':' + key;
  return getUrlsafeBase64Encode(entry);
}

/**
 * 获取url安全的base64编码
 * @param  {[type]} str [description]
 * @return {[type]}     [description]
 */
function getUrlsafeBase64Encode(str){
  return base64ToUrlSafe(new Buffer(str).toString('base64'));
}

function base64ToUrlSafe(v){
  return v.replace(/\//g, '_').replace(/\+/g, '-');
}


//当前默认空间(bucket)以及对应的默认host
// var defaultBucket = "hopeleft";
// var defaultHost = "http://7xi9ns.com1.z0.glb.clouddn.com/";
// var defaultAccessKey = "TchpexGkbyuY0nMt-T1_xIpbsgN90lBg3QyD3utE";
// var defaultSecretKey = "P60odlMezH9fG8nQbDsQMukdbyanVFtNUsJJ5zt6";

var defaultBucket = Etcd.getSettingValue(Etcd.settingPath['project-conf'].qiniu.bucket, Etcd_Data['project-conf']);
var defaultHost = Etcd.getSettingValue(Etcd.settingPath['project-conf'].qiniu.host, Etcd_Data['project-conf']);
var defaultAccessKey = Etcd.getSettingValue(Etcd.settingPath['project-conf'].qiniu.accessKey, Etcd_Data['project-conf']);
var defaultSecretKey = Etcd.getSettingValue(Etcd.settingPath['project-conf'].qiniu.secretKey, Etcd_Data['project-conf']);

Qiniu = new QiniuSDK(defaultAccessKey, defaultSecretKey, defaultBucket, defaultHost);

Meteor.methods({
  /**
   * 将Amr格式文件转化成Mp3格式，并改变数据库中相应消息的状态
   * @param  {[type]} id  [description]
   * @param  {[type]} key [description]
   * @param  {[type]} bk  [description]
   * @return {[type]}     [description]
   */
  'convertAmrToMp3': function(id, key, bk){
    var result = Qiniu.convertAmrToMp3(key);
    var bk = bk || defaultBucket;
    if (result.statusCode === 200) {
      var persistentId = result.data.persistentId;
      // TODO 更新状态为1，表示正在等待中
      Message.update({
        '_id': id,
      }, {
        '$set': {
          'convertStatus': {
            'code': 1,
            'id': persistentId
          }
        }
      })
    } else {
      //
    }
    return result;
  },

  /**
   * 获取表单上传图片要用的数据
   * @return {object} uptoken,key,url等
   */
  'getPicUpToken': function(){
    var options = {
      expires: 1800
    };
    return Qiniu.getUpInfo(options);
  },
})
