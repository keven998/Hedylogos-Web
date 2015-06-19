Template.friend.helpers({

});


Template.friend.events({
  // 展示用户信息，提供会话入口
  'click .im-friend-item': function (e) {
    e.preventDefault();
    // TODO 设置状态
    // $(e.target).siblings().removeClass("active");
    // $(e.target).addClass("active");
    $('.im-friend-desc-container').remove();
    $('.im-frame-right-container').addClass("hidden");
    $('#im-friend-or-group-info').removeClass("hidden");
    Blaze.renderWithData(Template.friendDesc, this, $('#im-friend-or-group-info')[0]);
  },
});

