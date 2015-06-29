Template.friendDesc.events({
  'click #J-set-contact': function (e) {
    lxpUser.activeSingleChat(this);
  },
  'click #J_delete_desc': function (e) {
  	e.preventDefault();
  	lxpUser.clickChatList();
  }
});