Template.chatMain.helpers({

});

Template.chatMain.events({
  'click #J-im-user-icon': function(e) {

  },

  'click #J-im-btn-contact-list': function (e) {
    e.preventDefault();
    console.log('click friend list btn');
    lxpUser.getFriendsList();
  },

  'click #J-im-btn-group-list': function (e) {

  },
});