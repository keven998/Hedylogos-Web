Router.configure({
  layoutTemplate: 'layout',
  loadingTemplate: 'loading', // 等待数据时，显示的菊花
  notFoundTemplate: 'notFound',
  waitOn: function() {
    return [Meteor.subscribe('userData'), Meteor.subscribe('userConversation')];
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

Router.route('/receiveAmrInfo', {where: 'server'}).post(function () {
  if (this.request.body.code === 0 && this.request.body.items[0].code === 0){
    var persistentId = this.request.body.id;
    var key = this.request.body.items[0].key;
      var bucket = 'imres';
    var url = Qiniu.getDownloadUrl(key, bucket);
    var msg = Message.findOne({
      'convertStatus.id': persistentId,
      'convertStatus.code': 1
    });
    if (msg){
      Message.update({
        'convertStatus.id': persistentId,
        'convertStatus.code': 1
      }, {
        $set: {
          convertStatus: {
            code: 2,
            url: url
          }
        }
      })
    }
  } else {
    console.log('音频转换失败！error报告：');
    console.log(this.request.body.items[0].error);//只有一个操作时
  }
  return ;
});

// 未登录，跳转到登录路由
Router.route('/', {
  name: 'chat',
  waitOn: function () {
    if (!Meteor.user()) {
      return [];
    }
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
  except: ['login', 'receiveAmrInfo']
});




