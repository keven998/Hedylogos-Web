Meteor.methods({
  'login': function (username, password) {
    check(username, String);
    check(password, String);
  }
});