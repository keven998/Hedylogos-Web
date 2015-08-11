Template.login.events({
  'click #login': function (e) {
    e.preventDefault();
    e.stopPropagation();

    var username = $('input[name="username"]').val(),
        password = $('input[name="password"]').val();

    // 貌似有点多余...
    username = $.trim(username);
    password = $.trim(password);

    if (!username || !password) {
      alert('账户和密码不能为空！');
      throwError('账户和密码不能为空！');
      return ;
    }

    lxpUser.login(username, password, function(err, res) {
      console.log(res);
      if (err) {
        console.log(err);
        alert('账户或密码错误！');
        throwError('账户或密码错误！');
        return;
      }
      Router.go('chat');
    });
  }
});

Template.login.onRendered(function () {

});