var i64 = Meteor.npmRequire('i64');
Meteor.methods({
  'getFriendsList': function () {
    var userId = null;
    try {
      userId = Meteor.user().userInfo.userId;
    } catch (e) {
      console.log(e);
    }
    console.log(userId)
    if (!userId) {
      return {'code': -1, 'data': '传输数据错误'};
    }
    // userId = i64.as64(userId);
    // console.log(i64.isI64(userId));
    console.log(typeof userId);
    var friendList = Meteor.lxp.Userservice.getContactList(userId);
    console.log(friendList);
    return {'code': 0, 'data': friendList};

  }
});