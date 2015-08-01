// 私有方法的取名：使用下划线_作为名字的开头

LxpUser = function () {
  var self = this;
  self.avatarInit = false;
  self.unReadChats = {};  //未读信息
  self.chatIds = {};      //会话列表中的所有会话
  self.chatWith = {};     //当前聊天对象的信息
  self.avatars = {};      // uid -> avatarUrl
  self.friends = new ReactiveVar([], function (o, n){ return o == n;});
  self.groups = new ReactiveVar([], function (o, n){ return o == n;});
  self.chatWith = new ReactiveVar({}, function (o, n){ return o == n;});
};

_.extend(LxpUser.prototype, {
  /**
   * 初始化信息
   */
  init: function () {
    var self = this;
    Session.setDefault('chatWith', {});

    // 当前会话列表跟踪
    Tracker.autorun(function () {
      UserConversation.find({}).forEach(function (chat) {
        self.chatIds[chat.tid] = true;
      });
    });

    // 当前会话信息跟踪
    Tracker.autorun(function () {
      self.chatWith =  Session.get('chatWith');
      // 切换后，当前会话的信息直接展示，所以在unReadChats标记为false
      self.unReadChats[self.chatWith.tid] = false;
    });

    // 获取好友列表
    self.getFriendsList();

    // 绑定发送机制
    self.bindSendMsg();

  },

  /**
   * 登录接口
   */
  login: function (username, password, callback) {
    // 务必保持key不改变，meteor那边只识别 username和 password
    var loginRequest = {'user': {'username': username, 'password': password}};
    //send the login request
    Accounts.callLoginMethod({
      'methodArguments': [loginRequest],
      'userCallback': callback
    });
  },

  /**
   * 当前用户的ID
   */
  'getUserId': function () {
    return Meteor.user().userInfo.userId;
  },

  /**
   * 获取好友列表
   */
  getFriendsList: function () {
    var self = this;
    Meteor.call('getFriendsList', function (err, res) {
      if (err) {
        console.log(err);
        return;
      }
      if (res && res.code === 0) {
        var data = res.data;
        self.friends.set(data);
        // 缓存好友头像
        if (!self.avatarInit) {
          data.forEach(function (friend) {
            self.avatars[friend.userId] = friend.avatar;
          });
          self.avatarInit = true;
        }
      }
    });
  },

  /**
   * 获取群组列表
   */
  getChatGroupList: function() {
    var self = this;
    Meteor.call('getGroupList', function (err, res) {
      if (err) {
        console.log(err);
        return;
      }
      if (res && res.code === 0) {
        var groups = res.data;
        self.groups.set(groups);
      }
    });
  },

  /**
   * 点击会话列表
   */
  clickChatList: function () {
    var self = this;
    $('.im-cur-chat-with-container').removeClass("hidden");
    self._removeDescContainer();
    self._hiddenDescPanel();
    self._showList('chat');
  },

  /**
   * 点击好友列表
   */
  clickFriendList: function () {
    var self = this;
    self.getFriendsList();
    self._showList('friend');
  },

  /**
   * 点击群组列表
   */
  clickGroupList: function () {
    var self = this;
    self.getChatGroupList();
    self._showList('group');
  },

  /**
   * 删除一个会话记录
   */
  deleteConversation: function (chatInfo) {
    var self = this;
    Meteor.call('deleteConversation', chatInfo, function(err, res) {
      if (!err && res.code === 0) {
        // 只删消息，不删消息容器
        $('#conversation-' + chatInfo.tid).empty();
      }
    });
  },

  /**
   * 当前和谁聊天的icon（上下箭头）状态调整
   */
  '_setIconOfChatWith': function () {
    // 顶部标签复原
    var dom = $('#im-cur-chat-chevron');
    if (!dom.hasClass("glyphicon-chevron-down")) {
      dom.removeClass("glyphicon-chevron-up").addClass("glyphicon-chevron-down");
    }
  },

  /**
   * 点击“发送信息”时，隐藏好友或者群组介绍页面
   */
  '_hiddenDescPanel': function () {
    $('.im-frame-right-container').removeClass("hidden");
    $('#im-friend-or-group-info').addClass("hidden");
  },

  /**
   * 点击好友列表中的一个好友或者群组列表的一个群时，显示desc容器
   */
  '_showDescPanel': function () {
    $('.im-frame-right-container').addClass("hidden");
    $('#im-friend-or-group-info').removeClass("hidden");
    $('.im-cur-chat-with-container').addClass("hidden");
  },

  /*
   * 删除好友介绍或者群组介绍的信息容器
   */
  _removeDescContainer: function () {
    $('.im-friend-desc-container').remove();
    $('.im-group-desc-container').remove();
  },

  /**
   * 点击好友列表中的一个好友，显示好友信息
   */
  'showFriendDesc': function (friendInfo) {
    var self = this;
    self._removeDescContainer();
    self._showDescPanel();
    Blaze.renderWithData(Template.friendDesc, friendInfo, $('#im-friend-or-group-info')[0]);
  },

  /**
   * 点击好友请求列表中的一个请求，显示请求者信息
   */
  'showUserDesc': function (friendInfo) {
    var self = this;
    self._removeDescContainer();
    self._showDescPanel();

    friendInfo.notFriend = true;
    Blaze.renderWithData(Template.friendDesc, friendInfo, $('#im-friend-or-group-info')[0]);
  },

  /**
   * 点击群组列表中的一个群信息，显示群信息
   */
  'showGroupDesc': function (groupInfo) {
    var self = this;
    self._removeDescContainer();
    self._showDescPanel();
    Blaze.renderWithData(Template.groupDesc, groupInfo, $('#im-friend-or-group-info')[0]);
  },

  /**
   * 点击“发送信息“后，显示chat聊表，（除了chat列表，还有好友链表和群组列表）
   * @summary 显示不同的列表信息[chat|friend|group]
   * @params {string}
   */
  _showList: function (type) {
    var cls = ['chat', 'friend', 'group'];
    if (cls.indexOf(type) === -1) {
      return;
    }
    cls.forEach(function(ele) {
      $('.im-' + ele + '-list').addClass("hidden");
    });
    $('.im-' + type + '-list').removeClass("hidden");
  },

  /**
   * 激活一个会话，使用场景：用户介绍页面或者群组介绍页面，点击“发送信息”
   */
  _activeOneChat: function (chatTargetInfo, isGroupChat) {
    var self = this;
    var chatId = chatTargetInfo.userId || chatTargetInfo.chatGroupId;
    // 创建会话DOM
    self.checkChatExist(chatId);
    // 隐藏上次会话DOM，显示当前会话DOM
    self.showMsgDom(chatId);
    // 改变session
    Session.set('chatWith', chatTargetInfo);
    // 数据层面创建会话
    Meteor.call('createConversationWithoutMsg', chatId, isGroupChat);
    // 删除好友介绍或者群组介绍列表
    isGroupChat ?
      $('.im-group-desc-container').remove()
      :
      $('.im-friend-desc-container').remove();
    // 如果需要，则调整chatWith标签
    self._setIconOfChatWith();
    // 隐藏好友或者群组介绍界面
    self._hiddenDescPanel();
    $('#J-im-input-text').focus();
    // 显示chat列表
    self._showList('chat');
    // 显示正在和谁聊天
    $('.im-cur-chat-with-container').removeClass("hidden");
  },

  /**
   * 激活一个单聊会话
   */
  activeSingleChat: function(chatTargetInfo) {
    var self = this;
    self._activeOneChat(chatTargetInfo, false);
  },

  /**
   * 激活一个群聊会话
   */
  activeGroupChat: function(chatTargetInfo) {
    var self = this;
    self._activeOneChat(chatTargetInfo, true);
  },

  /**
   * 消息的处理框架
   */
  'msgHandler': function (msg) {
    var userId = this.getUserId();
    if (userId == msg.senderId){
      this.sendedMsgHandler(msg);
      return ;
    }
    if ((userId == msg.receiverId && msg.chatType == 'single') || (_.indexOf(msg.targets, userId) != -1 && msg.chatType == 'group')){
      this.receivedMsgHandler(msg);
      return ;
    }
    console.log('Wrong msg to user:' + userId);
    console.log(msg);
  },

  /**
   * 发送消息的操作逻辑
   */
  'sendedMsgHandler': function (msg) {
    if (msg.chatType === 'single') {
      this.singleSendMsgHandler(msg);
      return;
    }
    // if (msg.chatType === 'group') {
    //   this.groupSendMsgHandler(msg);
    //   return;
    // }
  },

  /**
   * 接收信息的操作逻辑
   */
  'receivedMsgHandler': function (msg) {
    if (msg.chatType === 'single') {
      this.singleMsgHandler(msg);
      return;
    }
    if (msg.chatType === 'group') {
      this.groupMsgHandler(msg);
      return;
    }
  },

  /**
   * 判断会话的dom容器是否存在,single通过userId,group通过conversationId
   */
  'checkChatExist': function (tid) {
    // 不存在则新建一个
    if ($('#conversation-' + tid).length === 0) {
      Blaze.renderWithData(Template.conversation, {'id': tid}, $('.im-chat-info-container')[0]);
    }
    return;
  },

  /**
   * 单聊发送信息处理
   */
  'singleSendMsgHandler': function (msg) {
    var self = this;
    var targetId = msg.receiverId;
    if (targetId !== this.chatWith.tid) {
      if (self.isInUnReadChats(targetId)) {
        // 已存在，持续计数
        var curMsgCnt = Number($('#J-msg-count-' + targetId).text()) + 1;
        $('#J-msg-count-' + targetId).text(curMsgCnt);
      } else {
        // 不存在，新建会话，并将未读信息置为 1
        self.addConversation(targetId, false);
      }
    }

    // 绑定数据到dom
    this.attachMsgToDom(msg, targetId);
  },

  /**
   * 群聊信息处理
   */
  'groupMsgHandler': function (msg) {
    var self = this;
    var targetId = msg.receiverId;
    if (this.isInUnReadChats(targetId)) {
      // 已存在，持续计数
      var curMsgCnt = Number($('#J-msg-count-' + targetId).text()) + 1;
      $('#J-msg-count-' + targetId).text(curMsgCnt);
    } else {
      // 不存在，新建会话，并将未读信息置为 1
      this.addConversation(targetId, true);
    }

    // 绑定数据到dom
    this.attachMsgToDom(msg, targetId);
  },

  /**
   * 单聊信息处理
   */
  'singleMsgHandler': function (msg) {
    var self = this;
    var targetId = msg.senderId;
    if (targetId !== this.chatWith.tid) {
      if (self.isInUnReadChats(targetId)) {
        // 已存在，持续计数
        var curMsgCnt = Number($('#J-msg-count-' + targetId).text()) + 1;
        $('#J-msg-count-' + targetId).text(curMsgCnt);
      } else {
        // 不存在，新建会话，并将未读信息置为 1
        self.addConversation(targetId, false);
      }
    }

    // 绑定数据到dom
    this.attachMsgToDom(msg, targetId);
  },

  /**
   * 将数据在dom中展示
   */
  'attachMsgToDom': function (msg, tid) {
    // 检测信息容器是否存在，不存在则新建
    this.checkChatExist(tid);
    this.renderData(msg, tid);
  },

  /**
   * 处理富文本信息，返回信息
   */
  '_richTextMsg': function (msg) {
    // 解析contents为json对象
    msg.contents = JSON.parse(msg.contents);
    return msg;
  },

  /**
   * 转义
   */
  '_escapeRegExp': function (string) {
    return string.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
  },

  /**
   * 匹配emoji表情，并替换
   */
  '_emojiConvert': function (contents) {
    for (i = 0;i < emojiArray.length;i++){
      var emojiStr = this._escapeRegExp(emojiArray[i].str);
      var regexp = new RegExp(emojiStr, 'g');
      var contents = contents.replace(regexp, '<img src="/images/emoji/' + emojiArray[i].name + '.png" alt="" class="emoji-container">');
    }
    return contents;
  },

  /**
   * 根据修改信息，将已有的audio元素的src替换掉
   */
  'changeVoiceSrc': function (msg) {
    var audio = $('#' + msg.id._str);
    audio.attr('src', msg.fields.convertStatus.url).trigger('load');
  },

  /**
   * 将数据在前端展示，包含补充头像的逻辑
   * 取头像策略：本地缓存读取 => http获取
   */
  'renderData': function (msg, tid) {
    var self = this;
    var templateName = '';

    if (msg.msgType === 200) {
      msg = self._richTextMsg(msg);
      msg.isInvite = (msg.contents.tipType == 2001) ? true : false;
      Blaze.renderWithData(Template['cmdText'], msg, $('#conversation-' + tid)[0]);
    }

    if (msg.msgType === 0) {
      templateName = 'Msg';
      msg.contents = self._emojiConvert(msg.contents);
    }
    if (msg.msgType === 1) {
      if (msg.convertStatus) {
        if (msg.convertStatus.code === 1){
          // 处于等候转码状态
          // TODO 超时重发请求？（记录timeStamp）
          return ;
        }
        if (msg.convertStatus.code === 2){
          // 处于转码成功状态
          templateName = 'VoiceMsg';
          msg = self._richTextMsg(msg);
          msg.voiceUrl = msg.convertStatus.url;
          // TODO 修改 audio的src来源
        }
      } else {
        templateName = 'VoiceMsg';
        msg = self._richTextMsg(msg);
        msg.voiceUrl = msg.contents.url;
        var url = parseUrl(msg.contents.url);
        var key = url.path;
        Meteor.call('convertAmrToMp3', msg._id, key, function (err, result) {
          console.log(result);
          if (result.statusCode === 200) {
            // success
          } else {
            // error
          }
        });
      }
    }
    if (msg.msgType === 2) {
      templateName = 'ImageMsg';
      msg = self._richTextMsg(msg);
    }
    if (msg.msgType === 10) {
      templateName = 'PlanMsg';
      msg = self._richTextMsg(msg);
    }
    if (msg.msgType === 11) {
      templateName = 'PoiMsg';
      msg = self._richTextMsg(msg);
      msg.poiType = '城市';
    }
    if (msg.msgType === 12) {
      templateName = 'NoteMsg';
      msg = self._richTextMsg(msg);
    }
    if (msg.msgType === 13) {
      templateName = 'PoiMsg';
      msg = self._richTextMsg(msg);
      msg.poiType = '景点';
    }
    if (msg.msgType === 14) {
      templateName = 'PoiMsg';
      msg = self._richTextMsg(msg);
      msg.poiType = '美食';
    }
    if (msg.msgType === 15) {
      templateName = 'PoiMsg';
      msg = self._richTextMsg(msg);
      msg.poiType = '购物';
    }

    // 假如是发送的消息
    if (self.getUserId()== msg.senderId)
      templateName = 'send' + templateName;
    else
      templateName = 'receive' + templateName;

    if (self.avatars[msg.senderId]) {
      // 头像已经缓存
      msg.avatar = this.avatars[msg.senderId];
      Blaze.renderWithData(Template[templateName], msg, $('#conversation-' + tid)[0]);
    } else {
      // 头像未缓存，从后端读取用户信息
      Meteor.call('getUserById', msg.senderId, function(err, userInfo) {
        if (!err) {
          // 缓存头像
          if (userInfo.avatar){
            var avatar = userInfo.avatar;
            msg.avatar = avatar;
            self.avatars[tid] = avatar;
          }
          Blaze.renderWithData(Template[templateName], msg, $('#conversation-' + tid)[0]);
        }
      });
    }
  },

  /**
   * 判断一个信息是否在未读信息列表里
   */
  'isInUnReadChats': function (targetId) {
    if (this.unReadChats[targetId]) {
      return true;
    }
    return false;
  },

  /**
   * 创建未读会话信息
   * targetId = senderId/groupId
   */
  'addConversation': function (targetId, isGroup) {
    // 不在未读列表，添加进去
    this.unReadChats[targetId] = true;
    // 更新数据库时间
    Meteor.call('addConversation', targetId, isGroup);
  },

  /**
   * 点击会话信息的动作
   */
  readMsg: function (chatInfo) {
    var self = this;
    var tid = chatInfo.tid;
    $('#J-im-input-text').focus();
    Session.set('chatWith', chatInfo);
    // 显示信息
    this.showMsgDom(tid);
    // 如果是未读信息，对数据层进行修改
    if (self.unReadChats[tid]) {
      $('#J-msg-count-' + tid).text();
      self.unReadChats[tid] = false;
      Meteor.call('readNewMsgs', tid);
    }
  },

  /**
   * 切换消息容器：将当前对话容器切换成tid对应的对话的容器
   */
  showMsgDom: function (tid) {
    var curDomId = this.chatWith.tid;
    $('#conversation-' + curDomId).hide();
    $('#conversation-' + tid).show();
  },

  //貌似废弃了
  /*
   * 显示己方发送的信息
   */
  showSendedMsg: function (receiverId, msg) {
    var self = this;
    // 还不存在会话窗口，新建dom容器
    self.checkChatExist(receiverId);
    self.showMsgDom(receiverId);

    if (msg.msgType == 0) {
      msg.contents = self._emojiConvert(msg.contents);
      var templateName = 'sendedMsg';
    }

    if (msg.msgType == 2) {
      msg.contents = self._emojiConvert(msg.contents);
      var templateName = 'sendedImageMsg';
    }

    if (msg.msgType == 10) {
      msg = self._richTextMsg(msg);
      var templateName = 'sendedPlanMsg';
    }

    if (msg.msgType == 11) {
      msg = self._richTextMsg(msg);
      var templateName = 'sendedPoiMsg';
    }

    if (msg.msgType == 13) {
      msg = self._richTextMsg(msg);
      var templateName = 'sendedVsMsg';
    }

    if (msg.msgType == 15) {
      msg = self._richTextMsg(msg);
      var templateName = 'sendedVsMsg';
    }

    var sendData = Meteor.user().userInfo;
    sendData = _.extend(sendData, {'contents': msg.contents});
    Blaze.renderWithData(Template[templateName], sendData, $('#conversation-' + receiverId)[0]);
  },

  /**
   * 上传并且发送图片
   */
  'upAndSendImage': function() {
    var self = this;
    //从服务器获取token和key
    Meteor.call('getPicUpToken', function(error, result) {
      if (error) {
        return throwError(error.reason);
      }
      if (result){
        $("#picUpToken").val(result.upToken);
        $("#picUpKey").val(result.key);
        var form_data = new FormData($('#pic-up')[0]);

        //用jquery.ajax提交表单
        $.ajax({
          type: 'post',
          url: 'https://up.qbox.me/',
          async: false,
          cache: false,
          contentType: false,
          processData: false,
          data: form_data,
          success: function(data) {
            // 上传了其它格式的文件
            if (! data.fmt) {
              alert('暂不支持其它格式的文件发送！请上传图片等');
            }

            self.sendImageMsg(data, result.url);
            self.uploadLayer.hide();
            // alert("发送图片成功");
          }
        });
      }else{
        alert("上传图片失败！");
      }
    });
  },

  /**
   * 上传图片
   */
  'sendImageMsg': function(data, url) {
    var self = this;
    var imageInfo = {
      width: data.w,
      height: data.h,
      thumb: url + '!thumb',
      origin: url,
      full: url + '!full'
    };
    imageInfo = JSON.stringify(imageInfo);
    self.sendMsg(2, imageInfo);
  },

  /**
   * 发送攻略信息
   */
  'sendPlanMsg': function(plan) {
    var self = this;
    self.planLayer.hide();
    self.sendExtMsg(plan, 'plan');
  },

  /**
   * 发送poi消息
   */
  'sendPoiMsg': function(data){
    var self = this;
    self.searchLayer.hide();
    self.sendExtMsg(data.content, data.type);
  },

  /**
   * 发送特殊格式的信息
   */
  'sendExtMsg': function(data, type){
    var self = this;

    var contents = {
      id: data.id,
      image: data.images ? data.images.url : "",
      name: data.title || data.zhName,
      desc: data.summary || data.desc || "",
      rating: data.rating ? data.rating * 100 / 20 : "",//先转换成整数再计算，否则会有误差！
      price: data.priceDesc || "",
      timeCost: data.dayCnt ? (data.dayCnt + '天') : (data.timeCostDesc || ""),
      address: data.address || ""
    }

    if (type == 'plan'){
      var msgType = 10;
    }

    if (type == 'loc'){
      var msgType = 11;
    }

    if (type == 'vs'){
      var msgType = 13;
    }

    if (type == 'restaurant'){
      var msgType = 14;
    }

    if (type == 'shopping'){
      var msgType = 15;
    }

    contents = JSON.stringify(contents);
    self.sendMsg(msgType, contents);
  },

  /*
   * 消息输入框，绑定回车键进行信息发布
   * TODO：绑定shift+enter进行换行
   */
  bindSendMsg: function() {
    var self = this;
    var input = $('#J-im-input-text');
    input.on('keydown', function(e) {
      if (e.which == 13 || e.keyCode == 13) {
        if (e.shiftKey) {
          $(e.target).html($(e.target).html() + '\n');
        } else {
          e.preventDefault();
          e.stopPropagation();
          var contents = $.trim(input.html());
          if (!contents) {
            return;
          }

          // 清空
          input.html('');

          var str1 = self._escapeRegExp('<img src="/images/emoji/ee_');
          var str2 = self._escapeRegExp('.png" alt="" class="emoji-container">');
          var regexp = new RegExp(str1+ '((\\d)*)' + str2, 'g');
          contents = contents.replace(regexp, function($1, $2, $3, $4, $5){
            return emojiArray[$2 - 1].str;
          });

          self.sendMsg(0, contents);
        }
      }
    });
  },

  //发送消息
  sendMsg: function(msgType, contents) {
    var chatWith = Session.get('chatWith');
    var receiver = chatWith.userId || chatWith.tid,
        sender = lxpUser.getUserId();

    if (!receiver || ! sender) {
      console.log('没有接收者或者发送者信息');
      return;
    }

    var msgType = msgType,
        chatType = 'single',
        msg = {
          'receiver': receiver,
          'sender': sender,
          'msgType': msgType,
          'contents': contents,
          'chatType': chatType
        },
        header = {
          'Content-Type': 'application/json',
        },
        option = {
          'header': header,
          'data': msg
        };

    Meteor.call('sendMsg', option, function(err, res) {
      if (err) {
        console.log(err);
        throwError('发送失败，请重试');
        return;
      }
      if (res.code === 0) {
        // 在聊天记录中显示该信息
      }
    });
  },

  /**
   * 转换时间戳成 YYYY-MM-DD hh:mm:ss的格式
   */
  'convertTsToDate': function(ts) {
    var date = new Date(ts);
    Y = date.getFullYear() + '-';
    M = (date.getMonth()+1 < 10 ? '0'+(date.getMonth()+1) : date.getMonth()+1) + '-';
    D = date.getDate() + ' ';
    h = date.getHours() + ':';
    m = date.getMinutes() + ':';
    s = date.getSeconds();
    return (Y + M + D + h + m + s);
  },

  /**
   * 展示文件上传容器
   */
  'showFileLoader': function () {
    var self = this;
    if (self.uploadLayer) {
      self.uploadLayer.show();
    } else {
      var shareDialogInfo = {
        template: Template.uploadLayer,
        doc: {}
      };
      self.uploadLayer = ReactiveModal.initDialog(shareDialogInfo);
      self.uploadLayer.show();
    }
  },

  /**
   * 解析plan数据
   */
  '_parsePlanData': function(res) {
    res.content = JSON.parse(res.content);
    if (res.content.result && res.content.result.length > 0){
      for(var i = 0, l = res.content.result.length;i < l;i++) {
        res.content.result[i].images = (res.content.result[i].images.length > 0)
          ? res.content.result[i].images[0]
          : {url: ''};
        res.content.result[i].updateTime = this.convertTsToDate(res.content.result[i].updateTime);
      }
    }
    return res.content;
  },

  /**
   * 展示我的攻略
   */
  'showPlanLayer': function() {
    var self = this;
    if (self.planLayer) {
      self.planLayer.show();
    } else {
      Meteor.call('getUserPlans', function(err, res){
        if (err || !res) {
          bootbox.alert('获取计划列表失败!');
          return ;
        };
        var planList = self._parsePlanData(res);
        var shareDialogInfo = {
          template: Template.planLayer,
          doc: planList
        };
        self.planLayer = ReactiveModal.initDialog(shareDialogInfo);
        self.planLayer.show();
      });
    }
  },

  /**
   * 展示搜索框
   */
  'showSearchLayer': function() {
    var self = this;
    if (self.searchLayer) {
      self.searchLayer.show();
      setTimeout("$('.search-layer .search-input').focus()", 500);
    } else {
      var shareDialogInfo = {
        template: Template.searchLayer
      };
      self.searchLayer = ReactiveModal.initDialog(shareDialogInfo);
      self.searchLayer.show();
      setTimeout("$('.search-layer .search-input').focus()", 500);
    }
  },

  '_filterImages': function(data) {
    var types = ['locality', 'vs', 'restaurant', 'shopping'];
    types.map(function(type){
      if (data[type]) {
        data[type].map(function(item){
          item.images = item.images[0];
        })
      }
      return ;
    });
    return data;
  },

  // 展示所有种类poi的搜索结果，每种最多5个结果
  'showSearchFullPoi': function(text) {
    var self = this;
    Meteor.call('searchAllPoi', text, function(err, res){
      if (err || !res) {
        bootbox.alert('获取搜索结果失败!');
        return ;
      };
      var data = self._filterImages(res);
      self.clearSearchList();
      Blaze.renderWithData(Template.searchList, data, $('.search-list')[0]);
    });
  },

  // 展示单类poi的搜索结果，最多99个结果
  'showSearchSinglePoi': function(text, poiType) {
    var self = this;
    Meteor.call('searchSinglePoi', text, poiType, function(err, res){
      if (err || !res) {
        bootbox.alert('获取搜索结果失败!');
        return ;
      };
      var data = self._filterImages(res);
      self.clearSearchList();
      Blaze.renderWithData(Template.searchList, data, $('.search-list')[0]);
    });
  },

  // 清除搜索结果列表
  'clearSearchList': function() {
    $('.search-list').empty();
    return this;
  },

  //展示poi详情
  'showPoiDetail': function(pid, poiType, zhName) {
    // TODO 假如是上次那个，则继续展示，否则清空，发送请求，然后展示
    var self = this;
    if (self.poiLayer && self.poiLayer.doc.type === poiType && self.poiLayer.doc.id === pid) {
      self.poiLayer.show();
    } else {
      Meteor.call('getPoiDetail', pid, poiType, function(err, res){
        if (err || !res) {
          bootbox.alert('获取 "' + zhName + '" 详情失败!');
          return ;
        };
        console.log(res);
        var shareDialogInfo = {
          template: Template.poiLayer,
          doc: {
            content: res,
            type: poiType
          }
        };
        self.poiLayer = ReactiveModal.initDialog(shareDialogInfo);
        self.poiLayer.show();
      });
    }
  },

  // 展示陌生人的信息
  'showStrangerDesc': function (uid) {
    var self = this;
    Meteor.call('getUserById', uid, function(err, userInfo) {
      if (!err) {
        self.showUserDesc(userInfo);
      }
    });
  },

  // 接受好友请求
  'acceptFriendRequest': function (requestId) {
    Meteor.call('acceptContactRequest', requestId, function(err, res) {
      if (!err && res === true) {
        // 接受成功，数据库改动，页面随之改动
      } else {
        // 失败了
      }
    });
  },

  // 拒绝好友请求
  'rejectFriendRequest': function (requestId) {
    Meteor.call('rejectContactRequest', requestId, function(err, res) {
      if (!err && res === true) {
        // 接受成功，数据库改动，页面随之改动
      } else {
        // 失败了
      }
    });
  },

  // 取消好友请求
  'cancelFriendRequest': function (requestId) {
    Meteor.call('cancelContactRequest', requestId, function(err, res) {
      if (!err && res === true) {
        // 接受成功，数据库改动，页面随之改动
      } else {
        // 失败了
      }
    });
  }
});

/**
 * 解析URL
 * @param  {[type]} url [description]
 * @return {object}     以key-value的形式将url组成元素的类型与值相对应
 */
function parseUrl (url) {
  var urlPattern = /^(?:([A-Za-z]+):)?(\/{0,3})([0-9.\-A-Za-z]+)(?::(\d+))?(?:\/([^?#]*))?(?:\?([^#]*))?(?:#(.*))?$/;
  var result = urlPattern.exec(url);
  var type = ['url', 'scheme', 'slash', 'host', 'port', 'path', 'query', 'hash'];
  var parsedUrl = {};
  for (var i = 0, len = type.length; i < len; i += 1) {
    parsedUrl[type[i]] = result[i];
  }
  return parsedUrl;
}

// create a instance in client
lxpUser = new LxpUser();
