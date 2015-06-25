Template.friendDesc.events({
  'click #J-set-contact': function (e) {
    // 打开对应的chat窗口
    // openChatWindow(this);

    // 顶部标签复原
    var dom = $('#im-cur-chat-chevron');
    if (!dom.hasClass("glyphicon-chevron-down")) {
      dom.removeClass("glyphicon-chevron-up").addClass("glyphicon-chevron-down");
    }
    $('.im-friend-desc-container').remove();
    $('.im-frame-right-container').removeClass("hidden");
    $('#im-friend-or-group-info').addClass("hidden");
    lxpUser.activeOneChat(this);
    showList('chat');
  }
});