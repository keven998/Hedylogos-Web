Router.configure({
  layoutTemplate: 'layout',
  loadingTemplate: 'loading', // 等待数据时，显示的菊花
  notFoundTemplate: 'notFound',
  waitOn: function() {
    return [Meteor.subscribe('userData'), ];
  }
});

/**
 * check login status
 */
function checkLogin () {
  // var loginStatus = Session.get('loginStatus');
  if (!Meteor.userId()) {
    this.render('login');
  } else {
    this.next();
  }
  // if (!loginStatus) {
  //   this.render('login');
  // } else {
  //   this.next();
  // }
}

// 未登录，跳转到登录路由
Router.route('/', {
  name: 'chat',
  template: 'chatMain'
});

Router.route('/login', {
  name: 'login',
  template: 'login'
});

Router.onBeforeAction(checkLogin, {
  except: ['login', ]
});
