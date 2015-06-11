Template.errors.helpers({
  errors: function() {
    return Errors.find();
  }
});

// 每3s删除一个错误提示
Template.error.rendered = function() {
  var error = this.data;
  Meteor.setTimeout(function() {
    Errors.remove(error._id);
  }, 3000);
};