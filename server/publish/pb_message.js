Meteor.publish('chatMessage', function (msgTs) {
  check(msgTs, Number);
  var self = this;
  var user = Meteor.users.findOne({'_id': this.userId});
  if (user && user.userInfo) {
    var newMsg = [];
    var handle = Message.find({'receiverId': user.userInfo.userId, 'timestamp': {'$gte': msgTs}}).observeChanges({
      added: function (id, msg) {
        newMsg.push(msg);
        console.log(newMsg.length + ' new msg');
      },
    });
    var id = new Mongo.ObjectID();
    self.added("Message1", id, {});
    Meteor.setInterval(function() {
      if (newMsg.length === 0) {
        return self.ready();
      }
      self.removed("Message1", id);
      self.added("Message1", id, {msgs: newMsg});
      newMsg = [];
      self.ready();
    }, 500);
  } else {
    this.ready();
  }
});