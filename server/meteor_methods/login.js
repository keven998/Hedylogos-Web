Meteor.methods({
  'loginToLxp': function (username, password) {
    check(username, String);
    check(password, String);
    var loginResponce = Meteor.lxp.Userservice.login(username, password);
    if (!loginResponce || !loginResponce.userId.toString()) {
      return {
        code: -1,
        data: '登录失败'
      };
    } else {
      return {
        code: 0,
        data: loginResponce
      };
    }
  }
});