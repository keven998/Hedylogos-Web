LxpUser = function () {
  var self = this;
  self.hasUser = Session.get('loginStatus');
  self.userId = 0;
  self.userInfo = '';
};

_.extend(LxpUser.prototype, {
  hasUser: function () {
    var self = this;
    return self.hasUser;
  },

  login: function (username, password, callback) {
    var self = this;
    //create a login request with admin: true, so our loginHandler can handle this request
    var loginRequest = {'user': {'username': username, 'password': password}};

    //send the login request
    Accounts.callLoginMethod({
      'methodArguments': [loginRequest],
      'userCallback': callback
    });
    // Meteor.call('loginToLxp', username, password, function (err, res) {
    //   if (err) {
    //     throwError('登录失败，请重试');
    //   }
    //   if (res && res.code === 0) {
    //     var userInfo = res.data;
    //     userInfo.userId = Number(userInfo.userId.toString()); // Int64
    //     self.setUserId(userInfo.userId);
    //     self.setUserInfo(userInfo);
    //     Router.go('chat');
    //   }
    // });
  },

  setUserId: function (uid) {
    var self = this;
    self.userId = uid;
    Session.set('loginStatus', true);
    self.hasUser = true;
  },

  setUserInfo: function (userInfo) {
    var self = this;
    self.userInfo = userInfo;
    Session.set('loginStatus', true);
    self.hasUser = true;
  },

  getUserId: function () {
    var self = this;
    if (!self.hasUser) return;
    return self.userId;
  },

  getUserInfo: function () {
    var self = this;
    if (!self.hasUser) return;
    return self.userInfo;
  },

  getFriendsList: function () {
    var self = this;
    if (!self.hasUser) return;
  },

  getChatGroupList: function() {
    var self = this;
    if (!self.hasUser) return;
  }
});

// create a instance in client
lxpUser = new LxpUser();
