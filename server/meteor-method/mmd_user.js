var thrift = Meteor.npmRequire('thrift');
var lxpThriftType = Meteor.npmRequire('lxpthrift').Userserver_types;


Meteor.methods({
  /**
   * @获取当前用户的好友列表
   */
  'getFriendsList': function () {
    var userId = i64UserId();
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
   * 获取当前用户的群组列表
   */
  'getGroupList': function () {
    console.log('服务端');
    var userId = i64UserId();
    console.log(userId);
    if (!userId) {
      return {'code': -1, 'data': '传输数据错误'};
    }
    // var options = {};
    // options[lxpThriftType.ChatGroupProp.NAME] = 'ckckckck';
    // var newGroup = Meteor.lxp.Userservice.createChatGroup(new thrift.Int64(100074), [new thrift.Int64(100009)], options);
    // console.log(newGroup);

    var groupList = Meteor.lxp.Userservice.getUserChatGroups(userId, [
      // lxpThriftType.ChatGroupProp.CHAT_GROUP_ID,
      lxpThriftType.ChatGroupProp.NAME,
    ], 0, 100);
    // var groupList = 1;
    console.log(groupList);
    return {'code': 0, 'data': groupList};
  },


  /**
   * 通过用户ID获取用户基本信息
   */
  'getUserById': function (uid) {
    check(uid, Number);
    var targetInfo = Meteor.lxp.Userservice.getUserById(new thrift.Int64(uid), [
      lxpThriftType.UserInfoProp.USER_ID,
      lxpThriftType.UserInfoProp.NICK_NAME,
      lxpThriftType.UserInfoProp.AVATAR,
    ]);
    return targetInfo
  },


  /**
   * 创建一个新会话，数据库层面，并不是显示层面，显示层只显示按时间降序前30个会话
   */
  'createConversation': function (tid, hasNewMsg) {
    check(tid, Number);
    check(hasNewMsg, Boolean);
    var uid = getUserId();
    // 已经存在则不创建，更新下时间置顶
    if (UserConversation.findOne({'tid': tid, 'uid': uid})) {
      UserConversation.update({'tid': tid, 'uid': uid}, {'$set': {'updateTs': Date.now()}});
      return;
    }
    var targetInfo = Meteor.call('getUserById', tid);
    var data = {
      'tid': tid,
      'uid': uid,
      'nickName': targetInfo.nickName,
      'avatar': targetInfo.avatar,
      'updateTs': Date.now(),
      'hasMsg': hasNewMsg
    };
    UserConversation.insert(data);
  },


  /**
   * 创建一个存在即时未读信息的会话，使用场景：来了新消息，自动创建一个会话
   */
  'createConversationWithNewMsg': function(tid) {
    check(tid, Number);
    Meteor.call('createConversation', tid, true);
  },


  /**
   * 创建一个会话，使用场景：点击新建会话
   */
  'createConversationWithoutMsg': function(tid) {
    check(tid, Number);
    Meteor.call('createConversation', tid, false);
  },


  /**
   * 查看自己与其它人的会话是否存在，存在则返回_id
   */
  'findConversation': function (tid) {
    check(tid, Number);
    var uid = getUserId();
    return UserConversation.findOne({'uid': uid, 'tid': tid});
  },


  /**
   * 创建包含未读信息的会话
   */
  'addConversation': function (targetId) {
    check(targetId, Number);
    var conversation = Meteor.call('findConversation', targetId);
    if (conversation) {
      // 存在，只需要更新时间，打上有新消息的标签
      UserConversation.update({'_id': conversation._id}, {'$set': {'updateTs': Date.now(), 'hasMsg': true}});
    } else {
      // 不存在则需要新建会话记录
      Meteor.call('createConversationWithNewMsg', targetId);
    }
    return true;
  },


  /**
   * 点击未读信息，更新 hasMsg 字段
   */
  'readNewMsgs': function (tid) {
    check(tid, Number);
    var uid = getUserId();
    UserConversation.update({'uid': uid, 'tid': tid}, {'$set': {'hasMsg': false}});
  },
});




/**
 * 获得当前用户ID
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
    return userId;
}


/**
 * 获得i64版本的当前用户ID
 */
function i64UserId () {
  return new thrift.Int64(getUserId());
}
