LxpUser = function () {
  var self = this;
  self.avatarInit = false;
  self.unReadChats = {};  //未读信息
  self.chatIds = {};      //会话列表中的所有会话
  self.chatWith = {};     //当前聊天对象的信息
  self.avatars = {};      // uid -> avatarUrl
  self.friends = new ReactiveVar([], function (o, n){ return o == n;});
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
    console.log('lxp in');
    Meteor.call('getGroupList', function (err, res) {
      if (err) {
        console.log(err);
        return;
      }
      if (res && res.code === 0) {
        var groups = res.data;
        // TODO
        console.log(res);
      }
    });
  },

  /**
   * 激活一个会话，使用场景：用户介绍页面或者群组介绍页面，点击“发送信息”
   */
  activeOneChat: function (chatTargetInfo) {
    var self = this;
    var chatId = chatTargetInfo.userId || chatTargetInfo.groupId;
    // 创建会话DOM
    self.checkChatExist(chatId);
    // 隐藏上次会话DOM，显示当前会话DOM
    self.showMsgDom(chatId);
    // 改变session
    Session.set('chatWith', chatTargetInfo);
    // 数据层面创建会话
    Meteor.call('createConversationWithoutMsg', chatId);
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
  'richTextMsg': function (msg) {
    // TODO
  },
  /**
   * 将数据在前端展示，包含补充头像的逻辑
   * 取头像策略：本地缓存读取-》http获取
   */
  'renderData': function (msg) {
    var self = this;
    var tid = msg.senderId;
    var templateName = '';
    // 攻略 plan
    if (msg.msgType === 10) {
      templateName = 'planMsg';
      msg = self.richTextMsg();
    }
    if (msg.msgType === 0) {
      templateName = 'sendedMsg';
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
   * 显示信息
   */
  showMsgDom: function (tid) {
    var curDomId = this.chatWith.tid;
    if (curDomId !== tid) {
      $('#conversation-' + curDomId).hide();
      $('#conversation-' + tid).show();
    }
  },

  /*
   * 显示己方分送的信息
   */
  showSendedMsg: function (receiverId, content) {
    var self = this;
    // 还不存在会话窗口，新建dom容器
    self.checkChatExist(receiverId);
    var senderInfo = Meteor.user();
    senderInfo = _.extend(senderInfo, {'contents': content});
    Blaze.renderWithData(Template.sendedMsg, senderInfo, $('#conversation-' + receiverId)[0]);
  },


  /*
   * 消息输入框，绑定回车键进行信息发布
   * TODO：绑定shift+enter进行换行
   */
  bindSendMsg: function() {
    var slef = this;
    $('#J-im-input-text').on('keydown', function(e) {
      if (e.which == 13 || e.keyCode == 13) {
        if (e.shiftKey) {
          console.log('shift + enter');
          console.log($(e.target).val() + '//EOM');
          $(e.target).val($(e.target).val() + '\n');
          console.log($(e.target).val() + '//EOM');
        } else {
          e.preventDefault();
          e.stopPropagation();
          var contents = $.trim($(e.target).val());
          if (!contents) {
            return;
          }
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
          Meteor.call('sendMsg', option, function(err, res) {
            if (err) {
              throwError('发送失败，请重试');
              return;
            }
            if (res.code === 0) {
              // 清空
              $('#J-im-input-text').val('');
              // 在聊天记录中显示该信息
              slef.showSendedMsg(receiver, contents);
            }
          });
        }
      }
    });
  }
});

// create a instance in client
lxpUser = new LxpUser();
