Template.chatItem.events({
  // 展示用户信息，提供会话入口
  'click .im-friend-item': function (e) {
    e.preventDefault();
    // TODO 设置状态
    // $(e.target).siblings().removeClass("active");
    // $(e.target).addClass("active");
    Session.set('chatWith', this);
    lxpUser.readMsg(this);
  },
});