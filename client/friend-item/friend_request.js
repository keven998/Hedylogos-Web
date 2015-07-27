Template.friendRequestList.events({
  'click .friend-request-item': function(e) {
    e.preventDefault();
    if (e.target.nodeName === 'I')
      return ;
    lxpUser.showStrangerDesc(this.sender);
  },
  'click .request-btn': function(e) {
    if ($(e.target).hasClass('glyphicon-ok')){
      lxpUser.acceptFriendRequest(this._id._str);
      return ;
    }
    if ($(e.target).hasClass('glyphicon-remove')){
      lxpUser.rejectFriendRequest(this._id._str);
      return ;
    }
    if ($(e.target).hasClass('glyphicon-minus')){
      lxpUser.cancelFriendRequest(this._id._str);
      return ;
    }
  }
})