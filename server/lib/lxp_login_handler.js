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
      loginResponce = Meteor.lxp.Userservice.login(username, password);

  if (!loginResponce || !loginResponce.userId.toString()) {
    throw "login failed!";
    return undefined;
  }
  var userId = Number(loginResponce.userId.toString()),
      uid = null;
  loginResponce.userId = userId;
  var user = Meteor.users.findOne({'userInfo.userId': userId});
  var ts = Date.now();
  if (!user) {
    uid = Meteor.users.insert({'userInfo': loginResponce, 'loginTime': ts});
  } else {
    uid = user._id;
    Meteor.users.update({'_id': uid}, {'$set': {'userInfo': loginResponce, 'loginTime': ts}});
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