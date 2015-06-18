showSendMsg = function (receiverId, content) {
  // 还不存在会话窗口，新建dom容器
  if ($('#conversation-' + receiverId).length === 0) {
    Blaze.renderWithData(Template.conversation, {'id': receiverId}, $('.im-chat-info-container')[0]);
  }
  var senderInfo = Meteor.user();
  senderInfo = _.extend(senderInfo, {'content': content});
  Blaze.renderWithData(Template.sendedMsg, senderInfo, $('#conversation-' + receiverId)[0]);
}




bindSendMsg = function() {
  $('#J-im-input-text').on('keyup', function(e) {
    if (e.which == 13 || e.keyCode == 13) {
      e.preventDefault();
      e.stopPropagation();
      var contents = $.trim($(e.target).val());
      if (!contents) {
        return;
      }
      var chatWith = Session.get('chatWith');
      var receiver = chatWith.userId || chatWith.groupId,
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
      Meteor.call('sendMsg', option, function(err, res) {
        if (err) {
          throwError('发送失败，请重试');
          return;
        }
        if (res.code === 0) {
          // 清空
          $('#J-im-input-text').val('');
          // 在聊天记录中显示该信息
          showSendMsg(receiver, contents);
        }
      });
    }
  });
}