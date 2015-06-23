var msgHandlerHost = process.env['MSG_HANDLER_HOST'] + '/chats';
if (!msgHandlerHost) {
  throw "缺少环境变量: MSG_HANDLER_HOST";
  return;
}

Meteor.methods({
  'sendMsg': function (option) {
    check(option.header, Object);
    check(option.data.chatType, String);
    check(option.data.contents, String);
    check(option.data.msgType, Number);
    check(option.data.receiver, Number);
    check(option.data.sender, Number);
    // console.log(option);
    var res = HTTP.post(msgHandlerHost, option);
    // Meteor.lxp.Userservice.addContact(100009, 100012);
    if (res.statusCode === 200) {
      return {code: 0, data: res.data};
    } else {
      throw "信息发送失败";
      return {code: -1, data: '信息发送失败'};
    }
  },
});

// mongodb://hedy:muf0peL9Ol7O@192.168.100.2:32001/admin