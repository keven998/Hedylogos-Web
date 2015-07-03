Message1 = new Mongo.Collection('Message1');
AudioMsg = new Mongo.Collection('AudioMsg');

// 消息声音提示
msgSound = new Howl({
  src: ['msg.mp3']
});

Template.chatMain.onRendered(function () {
  // 初始化lxpUser
  lxpUser.init();

  // message获取
  Tracker.autorun(function () {
    var newMsgs = Message1.findOne({}).msgs;
    if (!newMsgs || !newMsgs.length) {
      return;
    }
    // 新信息提示
    msgSound.play();
    console.log('新的信息来了');
    newMsgs.forEach(function(msg) {
      lxpUser.receivedMsgHander(msg);
    });
  });

  Tracker.autorun(function () {
    var newMsgs = AudioMsg.findOne({}).msgs;
    if (!newMsgs || !newMsgs.length) {
      return;
    }
    // 新的语音信息提示
    console.log('语音转码成功！');
    newMsgs.forEach(function(msg) {
      lxpUser.changeVoiceSrc(msg);
    });
  });
});


Template.chatMain.helpers({
  'friends': function () {
    return lxpUser.friends.get();
  },
  'groups': function () {
    return lxpUser.groups.get();
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
    lxpUser.clickChatList();
  },

  'click #J-im-btn-contact-list': function (e) {
    e.preventDefault();
    lxpUser.clickFriendList();
  },

  'click #J-im-btn-group-list': function (e) {
    e.preventDefault();
    lxpUser.clickGroupList();
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



