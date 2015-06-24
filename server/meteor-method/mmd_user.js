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
  },

  /**
   * 更新用户的会话历史信息
   */
  'updateConversationTs': function (targetId) {
    check(targetId, Number);
    var uid = Number(getUserId().toString());
    var conversation = UserConversation.findOne({'uid': uid, 'tid': targetId});
    if (conversation) {
      // 存在，只需要更新时间，打上有新消息的标签
      UserConversation.update({'_id': conversation._id}, {'$set': {'updateTs': Date.now(), 'hasMsg': true}});
    } else {
      // 不存在则需要新建会话记录
      // 先查询用户信息，获得 nickName 和 avatar
      var targetInfo = Meteor.lxp.Userservice.getUserById(new thrift.Int64(targetId), [
        lxpThriftType.UserInfoProp.USER_ID,
        lxpThriftType.UserInfoProp.NICK_NAME,
        lxpThriftType.UserInfoProp.AVATAR,
      ]);
      var data = {
        'tid': targetId,
        'uid': uid,
        'nickName': targetInfo.nickName,
        'avatar': targetInfo.avatar,
        'updateTs': Date.now(),
        'hasMsg': true
      };
      UserConversation.insert(data);
    }
  },

  /**
   * 点击未读信息，更新 hasMsg 字段
   */
  'readNewMsgs': function (tid) {
    check(tid, Number);
    var uid = Number(getUserId().toString());
    UserConversation.update({'uid': uid, 'tid': tid}, {'$set': {'hasMsg': false}});
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
