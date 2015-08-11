Accounts.registerLoginHandler(function (loginRequest) {
  if (undefined === loginRequest) {
    throw "loginRequest is undefined";
    return undefined;
  }
  var user = loginRequest.user;
  if (!user.username || !user.password) {
    throw "user lack of username or password";
    return undefined;
  }
  var username = user.username,
      password = user.password,
      src = 'web';

  var loginResponse = Meteor.lxp.Userservice.login(username, password, src);//假如失败，下面的程序便不再执行！

  if (!loginResponse || !loginResponse.userId.toString()) {
    throw "login failed!";
    return undefined;
  }
  var userId = Number(loginResponse.userId.toString()),
      uid = null;
  loginResponse.userId = userId;
  var user = Meteor.users.findOne({'userInfo.userId': userId});
  var ts = Date.now();
  if (!user) {
    uid = Meteor.users.insert({'userInfo': loginResponse, 'loginTime': ts});
  } else {
    uid = user._id;
    Meteor.users.update({'_id': uid}, {'$set': {'userInfo': loginResponse, 'loginTime': ts}});
  }

  var stampedToken = Accounts._generateStampedLoginToken();
  var hashStampedToken = Accounts._hashStampedToken(stampedToken);

  Meteor.users.update(userId,
    {$push: {'services.resume.loginTokens': hashStampedToken}}
  );

  //sending token along with the userId
  return {
    userId: uid,
    token: stampedToken.token
  }
});