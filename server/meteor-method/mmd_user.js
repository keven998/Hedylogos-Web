var thrift = Meteor.npmRequire('thrift');
var lxpThriftType = Meteor.npmRequire('lxpthrift').Userserver_types;

Meteor.methods({
  /**
   * @summary Get friends list of current logined user
   */
  'getFriendsList': function () {
    var userId = getUserId();
    if (!userId) {
      return {'code': -1, 'data': '传输数据错误'};
    }
    var friendList = Meteor.lxp.Userservice.getContactList(userId, [
      lxpThriftType.UserInfoProp.USER_ID,
      lxpThriftType.UserInfoProp.NICK_NAME,
      lxpThriftType.UserInfoProp.AVATAR,
    ], 0, 2000);
    // transform i64 object to number
    friendList.map(function(friend){friend.userId = parseInt(friend.userId.toString())});
    return {'code': 0, 'data': friendList};
  },

  /**
   * @summary Get chatgroups list of current logined user
   */
  'getGroupList': function () {
    var userId = getUserId();
    if (!userId) {
      return {'code': -1, 'data': '传输数据错误'};
    }
    var groupList = Meteor.lxp.Userservice.getUserChatGroups(userId, [
      lxpThriftType.ChatGroupProp.CHAT_GROUP_ID,
      lxpThriftType.ChatGroupProp.NAME,
    ]);
    return {'code': 0, 'data': groupList};
  }
});



/**
 * @summary Get current logined userId
 */
function getUserId () {
  var userId = null;
    try {
      userId = Meteor.user().userInfo.userId;
    } catch (e) {
      console.log(e);
    }
    if (!userId) {
      return;
    }
    userId = new thrift.Int64(userId);
    return userId;
}

/**
 * @summary Transform i64 object to js number
 * @param {object | i64} i64 object or object which has i64 object as its key-value
 * @param {array} [optional] when target is a object, fields refer to keys whose value is i64 object.
 *                            data format: ['key1', 'key2.key3', 'key4.key5.key6', ...]
 */
function i64ToNumber (target, fields) {
  // TODO implement this function
  var argsCnt = arguments.length;
  if (argsCnt === 0 || argsCnt > 2) {
    throw 'argument error';
    return;
  }
  if (argsCnt === 1) {
    return target.toString();
  }
  var tempTarget = target;
  for (var i = 0, len = fields.length; i < len; ++i) {
    var field = fields[i],
        keys = field.split('.'),
        temp = tempTarget;
    for (var j = 0, l = keys.length; j < l; ++j) {
      temp = temp[keys[j]];
    }
    temp = temp.toString();
    console.log(temp);
    console.log(tempTarget);
  }

  // fields.map(function (keys) {
  //   var temp = tempTarget;
  //   keys.split('.').map(function(key) {
  //     temp = temp[key];
  //   });
  //   // console.log(temp);
  //   temp = temp.toString();
  //   console.log(temp);
  //   console.log(tempTarget);
  // });
  // console.log(tempTarget);
  return tempTarget;
}
