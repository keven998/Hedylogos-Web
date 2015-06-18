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
  if (!Meteor.userId()) {
    this.render('login');
  } else {
    this.next();
  }
}

// 未登录，跳转到登录路由
Router.route('/', {
  name: 'chat',
  waitOn: function () {
    if (typeof Meteor.user().loginTime !== 'number') {
      return [];
    }
    return Meteor.subscribe('chatMessage', Meteor.user().loginTime);
  },
  template: 'chatMain'
});

Router.route('/login', {
  name: 'login',
  template: 'login'
});

Router.onBeforeAction(checkLogin, {
  except: ['login', ]
});
