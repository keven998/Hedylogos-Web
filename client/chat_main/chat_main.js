Template.chatMain.onRendered(function () {
  $('#J-im-input-text').on('keyup', function(e) {
    if (e.which == 13 || e.keyCode == 13) {
      e.preventDefault();
      e.stopPropagation();
      var contents = $.trim($(e.target).val());
      if (!contents) {
        return;
      }
      var receiver = lxpUser.chatWith.get().id,
          sender = lxpUser.getUserId();

      if (!receiver || ! sender) {
        return;
      }

      var msgType = 0,
          chatType = 'single',
          msg = {
            'receiver': receiver,
            'sender': sender,
            'msgType': msgType,
            'contents': contents,
            'chatType': chatType
          },
          header = {
            'Content-Type': 'application/json',
          },
          option = {
            'header': header,
            'data': msg
          };
          console.log(option);
      Meteor.call('sendMsg', option, function(err, res) {
        if (err) {
          throwError('发送失败，请重试');
          return;
        }
        console.log(res);
        if (res.code === 0) {
          $('#J-im-input-text').val('');
          // 在聊天记录中显示该信息
        }
      });
    }
  });
});


Template.chatMain.helpers({
  'friends': function () {
    return lxpUser.friends.get();
  },
  'curChatWith': function () {
    return lxpUser.chatWith.get();
  }

});


Template.chatMain.events({
  'click #J-im-user-icon': function (e) {

  },

  'click #J-im-btn-contact-list': function (e) {
    e.preventDefault();
    lxpUser.getFriendsList();
  },

  'click #J-im-btn-group-list': function (e) {
    e.preventDefault();
    lxpUser.getChatGroupList();
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

