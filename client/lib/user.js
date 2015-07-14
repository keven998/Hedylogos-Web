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
    isGroupChat ?
      Meteor.call('createGroupConversationWithoutMsg', chatId)
      :
      Meteor.call('createConversationWithoutMsg', chatId);
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
   * 接收信息的操作逻辑框架
   */
  'receivedMsgHander': function (msg) {
    if (msg.chatType === 'single') {
      this.singleMsgHander(msg);
      return;
    }
    if (msg.chatType === 'group') {
      this.groupMsgHander(msg);
      return;
    }
  },

  /**
   * 判断会话的dom容器是否存在
   */
  'checkChatExist': function (id) {
    // 不存在则新建一个
    if ($('#conversation-' + id).length === 0) {
      Blaze.renderWithData(Template.conversation, {'id': id}, $('.im-chat-info-container')[0]);
    }
    return;
  },

  /**
   * 群聊信息处理
   */
  'groupMsgHander': function (msg) {
    var self = this;
    var senderId = msg.senderId;
    // if (this.isInUnReadChats(senderId)) {
    //   // 已存在，持续计数
    //   var curMsgCnt = Number($('#J-msg-count-' + senderId).text()) + 1;
    //   $('#J-msg-count-' + senderId).text(curMsgCnt);
    // } else {
    //   // 不存在，新建会话，并将未读信息置为 1
    //   this.addConversation(senderId);
    // }
    // // 绑定数据到dom
    // this.attachMsgToDom(msg);
  },


  /**
   * 单聊信息处理
   */
  'singleMsgHander': function (msg) {
    var self = this;
    var senderId = msg.senderId;
    if (senderId !== this.chatWith.tid) {
      if (self.isInUnReadChats(senderId)) {
        // 已存在，持续计数
        var curMsgCnt = Number($('#J-msg-count-' + senderId).text()) + 1;
        $('#J-msg-count-' + senderId).text(curMsgCnt);
      } else {
        // 不存在，新建会话，并将未读信息置为 1
        self.addConversation(senderId);
      }
    }

    // 绑定数据到dom
    this.attachMsgToDom(msg);
  },

  /**
   * 将数据在dom中展示
   */
  'attachMsgToDom': function (msg) {
    var tid = msg.senderId;
    // 检测信息容器是否存在，不存在则新建
    this.checkChatExist(tid);
    this.renderData(msg);
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
   * 取头像策略：本地缓存读取-》http获取
   */
  'renderData': function (msg) {
    var self = this;
    var tid = msg.senderId;
    var templateName = '';

    console.log(msg);
    if (msg.msgType === 0) {
      templateName = 'receivedMsg';
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
          templateName = 'voiceMsg';
          msg = self._richTextMsg(msg);
          msg.voiceUrl = msg.convertStatus.url;
          // TODO 修改 audio的src来源
        }
      } else {
        templateName = 'voiceMsg';
        msg = self._richTextMsg(msg);
        msg.voiceUrl = msg.contents.url;
        var url = parseUrl(msg.contents.url);
        var key = url.path;
        Meteor.call('convertAmrToMp3', msg._id, key, function (err, result) {
          if (result.statusCode === 200) {
            // success
          } else {
            // error
          }
        });
      }
    }
    if (msg.msgType === 2) {
      templateName = 'imageMsg';
      msg = self._richTextMsg(msg);
    }
    if (msg.msgType === 10) {
      templateName = 'planMsg';
      msg = self._richTextMsg(msg);
    }
    if (msg.msgType === 11) {
      templateName = 'cityMsg';
      msg = self._richTextMsg(msg);
    }
    if (msg.msgType === 12) {
      templateName = 'noteMsg';
      msg = self._richTextMsg(msg);
    }
    if (msg.msgType === 13) {
      templateName = 'vsMsg';
      msg = self._richTextMsg(msg);
    }
    if (self.avatars[tid]) {
      // 头像已经缓存
      msg.avatar = this.avatars[tid];
      Blaze.renderWithData(Template[templateName], msg, $('#conversation-' + tid)[0]);
    } else {
      // 头像未缓存，从后段读取用户信息
      Meteor.call('getUserById', tid, function(err, userInfo) {
        if (!err) {
          var avatar = userInfo.avatar;
          msg.avatar = avatar;
          self.avatars[tid] = avatar;
          console.log(msg);
          console.log(templateName);
          Blaze.renderWithData(Template[templateName], msg, $('#conversation-' + tid)[0]);
        }
      });
    }
  },

  /**
   * 判断一个信息是否在未读信息列表里
   */

  'isInUnReadChats': function (senderId) {
    if (this.unReadChats[senderId]) {
      return true;
    }
    return false;
  },

  /**
   * 创建未读会话信息
   */
  'addConversation': function (senderId) {
    // 不在未读列表，添加进去
    this.unReadChats[senderId] = true;
    // 更新数据库时间
    Meteor.call('addConversation', senderId);
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


          var chatWith = Session.get('chatWith');
          var receiver = chatWith.userId || chatWith.tid,
              sender = lxpUser.getUserId();

          if (!receiver || ! sender) {
            console.log('没有接收者或者发送者信息');
            return;
          }

          var msgType = 0,
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
          console.log(contents);
          Meteor.call('sendMsg', option, function(err, res) {
            if (err) {
              console.log(err);
              throwError('发送失败，请重试');
              return;
            }
            if (res.code === 0) {
              console.log(res);
              // 在聊天记录中显示该信息
              self.showSendedMsg(receiver, msg);
            }
          });
        }
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

  'showPoiDetail': function(content, type) {
    // TODO 假如是上次那个，则继续展示，否则清空，发送请求，然后展示
    var self = this;
    if (self.poiLayer && self.poiLayer.doc.type === type && self.poiLayer.doc.id === content.id) {
      self.poiLayer.show();
    } else {
      Meteor.call('getPoiDetail', content.id, type, function(err, res){
        if (err || !res) {
          bootbox.alert('获取路线详情失败!');
          return ;
        };
        console.log(res);
        var shareDialogInfo = {
          template: Template.poiLayer,
          doc: {
            content: res,
            type: type
          }
        };
        self.poiLayer = ReactiveModal.initDialog(shareDialogInfo);
        self.poiLayer.show();
      });
    }
  },

  /**
   * 发送攻略信息
   */
  'sendPlanMsg': function(plan) {
    var self = this;
    self.planLayer.hide();
    // TODO 把发送消息部分封装一下！
    var contents = {
      id: plan.id,
      image: plan.images.url,
      name: plan.title,
      desc: plan.summary,
      timeCost: plan.dayCnt
    }

    contents = JSON.stringify(contents);
    var chatWith = Session.get('chatWith');
    var receiver = chatWith.userId || chatWith.tid,
        sender = lxpUser.getUserId();

    if (!receiver || ! sender) {
      console.log('没有接收者或者发送者信息');
      return;
    }

    var msgType = 10,
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
        throwError('发送失败，请重试');
        return;
      }
      if (res.code === 0) {
        // 在聊天记录中显示该信息
        self.showSendedMsg(receiver, msg);
      }
    });
  },

  'sendPoiMsg': function(data){
    var self = this;
    self.searchLayer.hide();
    // TODO 把发送消息部分封装一下！
    // var msgType = self._getMsgType(data.type)
    if (data.type == 'locality'){
      var msgType = 11;
      var contents = {
        id: data.content.id,
        image: data.content.images.url,
        name: data.content.zhName,
        desc: data.content.desc
      }
    }

    if (data.type == 'vs'){
      var msgType = 13;
      var contents = {
        id: data.content.id,
        image: data.content.images.url,
        name: data.content.zhName,
        desc: data.content.desc
      }
    }

    if (data.type == 'restaurant'){
      var msgType = 14;
      var contents = {
        id: data.content.id,
        image: data.content.images.url,
        name: data.content.zhName,
        desc: data.content.desc
      }
    }

    if (data.type == 'shopping'){
      var msgType = 15;
      var contents = {
        id: data.content.id,
        image: data.content.images.url,
        name: data.content.zhName,
        desc: data.content.desc
      }
    }


    contents = JSON.stringify(contents);
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
        self.showSendedMsg(receiver, msg);
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
