Template.friendDesc.events({
  'click #J-set-contact': function (e) {
    lxpUser.setChatTarget(this);

    var dom = $('#im-cur-chat-chevron');
    if (!dom.hasClass("glyphicon-chevron-down")) {
      dom.removeClass("glyphicon-chevron-up").addClass("glyphicon-chevron-down");
    }
    $('.im-friend-desc-container').remove();
    $('.im-frame-right-container').removeClass("hidden");
    $('#im-friend-or-group-info').addClass("hidden");
    lxpUser.addOneChat(this);
    showList('chat');
  }
});