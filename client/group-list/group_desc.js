Template.groupDesc.events({
  'click #J-set-contact': function (e) {
    lxpUser.activeGroupChat(this);
  },
  'click #J_delete_desc': function (e) {
    e.preventDefault();
    lxpUser.clickChatList();
  }
});