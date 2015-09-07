Meteor.publish('chatMessage', function (msgTs) {
  check(msgTs, Number);
  var self = this;
  var user = Meteor.users.findOne({'_id': this.userId});
  if (user && user.userInfo) {
    var newMsg = [];
    var audioMsg = [];
    // 监听Message的变化，并记录
    var handle = Message.find({'targets': user.userInfo.userId, 'timestamp': {'$gte': msgTs}}).observeChanges({
      added: function (id, msg) {
        msg._id = new Mongo.ObjectID(id._str);
        newMsg.push(msg);
        console.log(msg);
      },
      changed: function (id, fields) {
        if (fields.convertStatus && fields.convertStatus.code && fields.convertStatus.code === 2){
          var msg = {
            id: id,
            fields: fields
          };
          audioMsg.push(msg);
        }
      }
    });

    // 初始化
    var id = new Mongo.ObjectID();
    var aid = new Mongo.ObjectID();
    self.added("Message1", id, {});
    self.added("AudioMsg", aid, {});

    // 轮询数据变动，并将改动传至前端
    Meteor.setInterval(function() {
      if (newMsg.length !== 0) {
        self.removed("Message1", id);
        self.added("Message1", id, {msgs: newMsg});
        newMsg = [];
      }
      if (audioMsg.length !== 0) {
        self.removed("AudioMsg", aid);
        self.added("AudioMsg", aid, {msgs: audioMsg});
        audioMsg = [];
      }
      self.ready();
    }, 500);
  } else {
    this.ready();
  }
});