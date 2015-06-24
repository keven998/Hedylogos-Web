LxpUser = function () {
  var self = this;
  self.unReadChats = {};
  self.chatWith = {};
  Session.setDefault('chatList', []);
  Session.setDefault('chatWith', {});
  Session.setDefault('chatIds', {});  //缓存会话ID，减少数据库请求
  self.friends = new ReactiveVar([], function (o, n){ return o == n;});
  self.chatWith = new ReactiveVar({}, function (o, n){ return o == n;});
};

_.extend(LxpUser.prototype, {
  init: function () {
    var self = this;
    // 跟踪改变缓存的chat列表
    var tempChatIds = {};
    UserConversation.find({}).forEach(function (chat) {
      tempChatIds[chat.tid.toString()] = true;
    });
    Session.set('chatIds', tempChatIds);
    Tracker.autorun(function() {
      self.chatWith =  Session.get('chatWith');
    });
  },

  hasUser: function () {
    return Meteor.userId();
  },

  login: function (username, password, callback) {
    var self = this;
    // keep this format even with the same key name
    var loginRequest = {'user': {'username': username, 'password': password}};
    //send the login request
    Accounts.callLoginMethod({
      'methodArguments': [loginRequest],
      'userCallback': callback
    });
  },

  getUserId: function () {
    return parseInt(Meteor.user().userInfo.userId);
  },

  getUserInfo: function () {
    return Meteor.user().userInfo;
  },

  setChatTarget: function (target) {
    var self = this;
    Session.set('chatWith', target);
  },

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
      }
    });
  },

  getChatGroupList: function() {
    var self = this;
    Meteor.call('getGroupList', function (err, res) {
      if (err) {
        console.log(err);
        return;
      }
      if (res && res.code === 0) {
        var data = res.data;
      }
    });
  },

  addOneChat: function (chatTargetInfo) {
    var self = this;
    var chatId = chatTargetInfo.userId || chatTargetInfo.groupId,
    chatIds = Session.get('chatIds');
    if (chatIds.hasOwnProperty(chatId)) {
      return self.setChatTarget(chatTargetInfo);
    }
    chatIds[chatId] = true;
    Session.set('chatIds', chatIds);
    var chatList = Session.get('chatList') || [];
    chatList.push(chatTargetInfo);
    Session.set('chatList', chatList);
  },

  isInChatHistory: function (senderId) {
    var self = this;
    // 存在于未读信息列表中，不做任何处理，结束
    if (self.unReadChats[senderId]) {
      return;
    } else {
      // 不在未读列表，添加进去
      self.unReadChats[senderId] = true;
      // 更新数据库时间，谁先到谁在前
      Meteor.call('updateConversationTs', senderId);
    }
  },
  readMsg: function (chatInfo) {
    var self = this;
    var tid = chatInfo.tid;
    if (self.unReadChats[tid]) {
      self.unReadChats[tid] = false;
      Meteor.call('readNewMsgs', tid);
    }
  },

  // getChatList: function () {
  //   var self = this;
  //   return self.chatList;
  // }
});

// create a instance in client
lxpUser = new LxpUser();
