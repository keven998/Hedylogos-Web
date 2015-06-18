Meteor.publish('chatMessage', function (msgTs) {
  check(msgTs, Number);
  var self = this;
  console.log(msgTs);
  var user = Meteor.users.findOne({'_id': this.userId});
  if (user && user.userInfo) {
    var newMsg = [];
    var handle = Message.find({'receiverId': user.userInfo.userId, 'timestamp': {'$gte': msgTs}}).observeChanges({
      added: function (id, msg) {
        console.log('new msg');
        newMsg.push(msg);
        console.log(newMsg.length);
      },
    });
    var id = new Mongo.ObjectID();
    self.added("Message1", id, {});
    Meteor.setInterval(function() {
      // self.removed("Message1", id);
      if (newMsg.length === 0) {
        return;
      }
      self.removed("Message1", id);
      self.added("Message1", id, newMsg);
      newMsg = [];
      self.ready();
    }, 3000);
  } else {
    this.ready();
  }
});