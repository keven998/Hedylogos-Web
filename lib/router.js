Router.configure({
  layoutTemplate: 'layout',
  loadingTemplate: 'loading', // 等待数据时，显示的菊花
  notFoundTemplate: 'notFound',
  // waitOn: function() {
  //   return [];
  // }
});

// 未登录，跳转到登录路由
Router.route('/', {
  name: 'chat',
  template: 'chatMain'
});

Router.route('/login', {
  name: 'login',
  template: 'login'
});

