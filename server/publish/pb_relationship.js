Meteor.publish('contactRequest', function (uid) {
  check(uid, Number);
  if (!this.userId) {
    return this.ready();
  }

  return ContactRequest.find({'receiver': uid, 'status': 0}, {'sort': {'timestamp': 1}});
});