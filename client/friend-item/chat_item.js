Template.chatItem.events({
  // 展示用户信息，提供会话入口
  'click .im-friend-item': function (e) {
    e.preventDefault();
    lxpUser.readMsg(this);
  },
});



// 绑定鼠标的右键快捷键操作
Template.chatItem.onRendered(function() {
  var chatItemInfo = Template.currentData().chatItemInfo,
      cssSelector = '',
      funcName;
  if (chatItemInfo.isGroupChat) {
    cssSelector = '#J_groupChat_';
    funcName = 'showGroupDesc';
  }else {
    cssSelector = '#J_singleChat_';
    funcName = 'showFriendDesc';
  }
  cssSelector += chatItemInfo.tid;

  context.attach(cssSelector, [
      {
        text: '查看资料',
        action: function(e) {
          e.preventDefault();
          lxpUser[funcName](chatItemInfo);
        }
      },
      {divider: true},
      {
        text: '删除会话',
        action: function(e) {
          e.preventDefault();
          lxpUser.deleteConversation(chatItemInfo);
        }
      },
    ]
  );
});