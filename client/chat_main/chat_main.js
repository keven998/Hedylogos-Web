Message1 = new Mongo.Collection('Message1');
Template.chatMain.onRendered(function () {
  bindSendMsg();
  Tracker.autorun(function () {
    var msgs = Message1.findOne({});
    console.log(msgs.fetch());
    // TODO 分送信息到不同的聊天容器
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
    return Session.get('chatList');
  }

});


Template.chatMain.events({
  'click #J-im-user-icon': function (e) {

  },

  'click #J-im-btn-chat-list': function (e) {
    e.preventDefault();
    showList('chat');
  },

  'click #J-im-btn-contact-list': function (e) {
    e.preventDefault();
    lxpUser.getFriendsList();
    showList('friend');
  },

  'click #J-im-btn-group-list': function (e) {
    e.preventDefault();
    showList('group');
    // lxpUser.getChatGroupList();
  },

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

