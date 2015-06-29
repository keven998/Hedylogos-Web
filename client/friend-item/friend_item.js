Template.friend.helpers({

});


Template.friend.events({
  // 展示用户信息，提供会话入口
  'click .im-friend-item': function (e) {
    e.preventDefault();
    lxpUser.showFriendDesc(this);
  },
});

