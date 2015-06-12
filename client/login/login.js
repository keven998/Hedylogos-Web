Template.login.events({
  'click #login': function (e) {
    e.preventDefault();
    e.stopPropagation();
    var username = $('input[name="username"]').val(),
        password = $('input[name="password"]').val();
    username = $.trim(username);
    password = $.trim(password);
    if (!username || !password) {
      throwError('账户和密码不能为空！');
    }
    lxpUser.login(username, password, function(err, res) {
      if (err) {
        throwError('账户或密码错误！');
        return;
      }
      Router.go('chat');
    });
  }
});

Template.login.onRendered(function () {

});