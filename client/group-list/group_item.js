Template.group.events({
  // 展示用户信息，提供会话入口
  'click .im-group-item': function (e) {
    e.preventDefault();
    lxpUser.showGroupDesc(this);
  },
});