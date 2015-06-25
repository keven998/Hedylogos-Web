Template.chatItem.events({
  // 展示用户信息，提供会话入口
  'click .im-friend-item': function (e) {
    e.preventDefault();
    // TODO 设置状态
    // $(e.target).siblings().removeClass("active");
    // $(e.target).addClass("active");

    // TODO 判断是否为当前对话，假如不是，则hide当前对话窗口，并且show该对话窗口（注意可能要修改的逻辑：之前是在获取消息时render模板，现在是在入口处render!）
    lxpUser.readMsg(this);
    // openChatWindow(this);
  },
});

/**
 * 切换会话窗口
 * @param  {string} curChatWithId  当前对话者的Id
 * @param  {string} nextChatWithId 即将对话者的Id
 * @return {[type]}                [description]
 */
toggleChatWindow = function (curChatWithId, nextChatWithId) {
  $('#conversation-' + curChatWithId).hide();
  $('#conversation-' + nextChatWithId).show();
}

/**
 * 打开对应的会话的窗口
 * @param  {object} chatWithInfo 被选择的对话者的信息
 * @return {[type]}              [description]
 */
openChatWindow = function (nextChatWith) {
  var curChatWith = Session.get('chatWith');
  var curChatWithId = curChatWith.userId || curChatWith.groupId;
  var nextChatWithId = nextChatWith.userId || nextChatWith.groupId;
  if (curChatWith !== nextChatWith){
    checkChatExist(nextChatWithId);
    toggleChatWindow(curChatWithId, nextChatWithId);
    lxpUser.setChatTarget(nextChatWith);//即 Session.set('chatWith', this);
  } else {
    // 暂无
  }
}
