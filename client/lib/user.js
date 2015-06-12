LxpUser = function () {
  var self = this;
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
    return Meteor.userId();
  },

  getUserInfo: function () {
    return Meteor.user().userInfo;
  },

  getFriendsList: function () {
    var self = this;
    // TODO
  },

  getChatGroupList: function() {
    var self = this;
    // TODO
  }
});

// create a instance in client
lxpUser = new LxpUser();
