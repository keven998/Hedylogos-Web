UserConversation = new Mongo.Collection('UserConversation');


Meteor.publish('userConversation', function () {
  if (!this.userId) {
    return this.ready();
  }
  var user = Meteor.users.findOne(this.userId);
  if (!user) {
    throw new Error("User Not Found In Publish: userConversation");
    return this.ready();
  }
  var uid = user.userInfo.userId;
  return UserConversation.find({'uid': uid}, {'sort': {'updateTs': -1}, 'limit': 50});
});