LxpUser = function () {
  var self = this;
  Session.setDefault('chatList', []);
  Session.setDefault('chatWith', {});
  Session.setDefault('chatIds', {});
  self.friends = new ReactiveVar([], function (o, n){ return o == n;});
  self.chatWith = new ReactiveVar({}, function (o, n){ return o == n;});
};

_.extend(LxpUser.prototype, {
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
        console.log(data);
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

  // getChatList: function () {
  //   var self = this;
  //   return self.chatList;
  // }
});

// create a instance in client
lxpUser = new LxpUser();
