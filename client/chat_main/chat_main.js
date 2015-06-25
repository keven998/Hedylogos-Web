Message1 = new Mongo.Collection('Message1');


Template.chatMain.onRendered(function () {
  // 初始化lxpUser
  lxpUser.init();

  // message获取
  Tracker.autorun(function () {
    var newMsgs = Message1.findOne({}).msgs;
    if (!newMsgs || !newMsgs.length) {
      return;
    }
    console.log('新的信息来了');
    newMsgs.forEach(function(msg) {
      lxpUser.receivedMsgHander(msg);
    });
  });
});


Template.chatMain.helpers({
  'friends': function () {
    return lxpUser.friends.get();
  },
  'curChatWith': function () {
    return Session.get('chatWith');
  },
  'chats': function () {
    return UserConversation.find({}, {'sort': {'updateTs': -1}});
  }

});


Template.chatMain.events({
  'click #J-im-user-icon': function (e) {

  },

  'click #J-im-btn-chat-list': function (e) {
    e.preventDefault();
    showList('chat');

    // 右侧界面的切换，可以合并
    $('.im-friend-desc-container').remove();
    $('.im-frame-right-container').removeClass("hidden");
    $('#im-friend-or-group-info').addClass("hidden");
  },

  'click #J-im-btn-contact-list': function (e) {
    e.preventDefault();
    lxpUser.getFriendsList();
    showList('friend');

    // 右侧界面的切换
    $('.im-frame-right-container').addClass("hidden");
    $('#im-friend-or-group-info').removeClass("hidden");
  },

  'click #J-im-btn-group-list': function (e) {
    e.preventDefault();
    // lxpUser.getChatGroupList();
    showList('group');

    // 右侧界面的切换
    $('.im-frame-right-container').addClass("hidden");
    $('#im-friend-or-group-info').removeClass("hidden");
  },

  // TODO 展示群内人员
  'click .im-cur-chat': function (e) {
    e.preventDefault();
    var dom = $('#im-cur-chat-chevron');
    if (dom.hasClass("glyphicon-chevron-down")) {
      dom.removeClass("glyphicon-chevron-down").addClass("glyphicon-chevron-up");
    } else {
      dom.removeClass("glyphicon-chevron-up").addClass("glyphicon-chevron-down");
    }
  }
});


/* @summary 显示不同的列表信息[chat|friend|group]
 * @params {string}
 */
showList = function (type) {
  var cls = ['chat', 'friend', 'group'];
  if (cls.indexOf(type) === -1) {
    return;
  }
  cls.forEach(function(ele) {
    $('.im-' + ele + '-list').addClass("hidden");
  });
  $('.im-' + type + '-list').removeClass("hidden");
}



