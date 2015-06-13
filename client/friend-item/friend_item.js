Template.friend.helpers({

});


Template.friend.events({
  'click .im-friend-item': function (e) {
    e.preventDefault();
    var user = {
      'id': this.userId,
      'name': this.nickName
    };
    lxpUser.setChatTarget(user);
    $(e.target).siblings().removeClass("active");
    $(e.target).addClass("active");
    var dom = $('#im-cur-chat-chevron');
    if (!dom.hasClass("glyphicon-chevron-down")) {
      dom.removeClass("glyphicon-chevron-up").addClass("glyphicon-chevron-down");
    }
  },
});

