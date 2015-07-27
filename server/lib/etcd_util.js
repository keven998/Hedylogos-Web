EtcdClass = function() {
  // 配置信息的etcd路径
  this.settingPath = {
    mongo: {
      yunkai: {
        auth: {
          user: '/project-conf/hedylogos-web/mongo/yunkai/user',
          password: '/project-conf/hedylogos-web/mongo/yunkai/password',
          db: '/project-conf/hedylogos-web/mongo/yunkai/db'
        }
      },
      hedy: {
        auth: {
          user: '/project-conf/hedylogos-web/mongo/hedy/user',
          password: '/project-conf/hedylogos-web/mongo/hedy/password',
          db: '/project-conf/hedylogos-web/mongo/hedy/db'
        }
      },
      url: {
        array: true,//会返回数组
        path: '/backends/mongo-dev'
      }
    },
    qiniu: {
      host: '/project-conf/hedylogos-web/qiniu/host',
      bucket: '/project-conf/hedylogos-web/qiniu/bucket',
      accessKey: '/project-conf/hedylogos-web/qiniu/accessKey',
      secretKey: '/project-conf/hedylogos-web/qiniu/secretKey'
    }
  };

  // 从etcd获取数据
  this.callEtcd = function () {
    try{
      var callUrl = process.env.ETCD_URL + '/v2/keys?recursive=true';
      return HTTP.call('GET', callUrl).data.node;
    }catch(e){
      console.log("Failed in getting settings : " + callUrl);
      console.log(e);
    }
    return false;
  };

  /** 
   * 解析etcd返回的数据，并返回path对应的配置值
   * @param  {string} path   配置所对应的绝对路径，如: /project-conf/tasman/dbauth/geo/db
   * @param  {object} object 当前对应的以json格式存储的目录
   * @return {string}        对应的value值
   */
  this.getSettingValue = function (path, object) {
    // 路径完全匹配
    if (path === object.key){
      if (object.dir) {
        // 假如是数组，说明需要返回数组
        return this.getSettingArray(object.nodes);
      } else {
        return object.value;
      }
    }

    // 路径符合父目录的标准或是为空(根目录下)
    if (!object.key || object.dir && path.indexOf(object.key) > -1){
      if (object.nodes.length > 0){
        for (var i = 0;i < object.nodes.length;i++){
          var value = this.getSettingValue(path, object.nodes[i]);
          if (value){
            return value; 
          }
        }
      } else {
        if (object.node){
          // TODO 基本不会出现，是否需要？
          return this.getSettingValue(path, object.node);
        }
      } 
    }

    return false;
  };

  /**
   * 获取以hash后缀区分的一组数值
   * @param  {object} nodes [description]
   * @return {array}        [description]
   */
  this.getSettingArray = function (nodes) {
    var result = [];
    nodes.map(function (node) {
      result.push(node.value);
    });
    return result;
  };
};

Etcd = new EtcdClass();
Etcd_Data = Etcd.callEtcd();