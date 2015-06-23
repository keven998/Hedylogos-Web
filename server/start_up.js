Meteor.startup(function () {
  initApiCall();
  var address = getThriftServerAddress(),
      thriftConnectionInstance = connectThriftServer(address.ip, address.port);
  createThriftClient(thriftConnectionInstance, 'lxpthrift', 'Userservice');

  console.log('=== Connection And Service Test ===');
  var res = Meteor.lxp.Userservice.add(3, 7);
  if (res === 10) {
    console.log('|             3 + 7 = ' + res + '          |');
    console.log('===        Connection OK        ===');
    console.log('===        Service    OK        ===');
  } else {
    console.log('3 + 7 != ' + res);
    console.log('=== Connection Error OR Service Error ===');
  }
  // 设置session过期日期为一天
  Accounts.config({
     loginExpirationInDays: 1
  });
});



/**
 * 初始化api调用接口
 */
function initApiCall () {
  if (!Meteor.lxp) {
    Meteor.lxp = {};
  } else {
    console.log('停止代码');
  }
}

/**
 * get ectd server url by env
 */
function getEtcdServerUrl () {
  var etcdUrl = process.env['ETCD_URL'];
  if (!etcdUrl) {
    console.log('请检查thrift server的etcd的环境变量');
    return;
  }
  return (etcdUrl + '/v2/keys/backends/yunkai?recursive=true');
}


/**
 * get thrift server address
 * @etcdUrl {String} etcd url for thrift server
 * @return ip address and port
 */
function getThriftServerAddress () {
  var etcdUrl = getEtcdServerUrl();
  if (!etcdUrl) {
    console.log('输入etcd配置地址');
    return;
  }
  var res = HTTP.get(etcdUrl),
      ip = '',
      port = 0;
  if (res && res.statusCode === 200 && res.data && res.data.node &&
      res.data.node.nodes && res.data.node.nodes.length !== 0) {
    // TODO 此处暂时写死
    var address = res.data.node.nodes[0].value,
        temp = address.split(':');
    ip = temp[0];
    port = Number(temp[1]);
  }
  if (!ip || !port) {
    console.log('获取thrift server地址失败，请检查etcd配置地址');
    return;
  }
  return {
    ip: ip,
    port: port
  }
}


/**
 * create client and attach api to Meteor.lxp.clientName
 * connect to thrift server, and create thrift client
 * @thriftServerConnection connection instance fo thrift server
 * @npmPackageName {String} the thrift file in node.js package style
 * @clientName {String} client name of thrift file
 */
function createThriftClient (thriftServerConnection, npmPackageName, clientName) {
  if (!thriftServerConnection) {
    console.log('与thrift server的连接存在问题');
  }

  var lxpthrift = Meteor.npmRequire(npmPackageName);
  if (!lxpthrift) {
    console.log('检查thrift的node.js包名');
    return;
  }
  if (!lxpthrift[clientName]) {
    console.log('检查client名字');
    return;
  }
  var thrift  = Meteor.npmRequire('thrift'),
      service = lxpthrift[clientName],
      clientInstance = thrift.createClient(service, thriftServerConnection);
  attachApi(clientName, clientInstance);
}

/**
 * create connection to thrift server
 * @ip {String} address of thrift server, like "xxx.xxx.xxx.xxx"
 * @port {Number} thrift service port
 * @transportType {String} [optional] transport type
 * @protocolType {String} [optional] protocol type
 * @return: thrift client instance
 */
function connectThriftServer(ip, port, transportType, protocolType) {
  if (!ip || typeof ip !== 'string') {
    console.log('请指定 thrift server的IP地址，格式如： "xxx.xxx.xxx.xxx"');
    return;
  }
  if (!port || typeof port !== 'number') {
    console.log('请指定 thrift server的端口号，格式如： 8000');
    return;
  }

  transportType = transportType || 'TFramedTransport';
  protocolType = protocolType || 'TBinaryProtocol';
  var transportTypeCheck = ['TFramedTransport', 'TBufferedTransport'].indexOf(transportType),
      protocolTypeCheck  = ['TBinaryProtocol', 'TJSONProtocol', 'TCompactProtocol'].indexOf(protocolType);
  if (transportTypeCheck === -1) {
    console.log('输入的数据传输格式错误');
    console.log("请从['TFramedTransport', 'TBufferedTransport']中选取");
    return;
  }
  if (protocolTypeCheck === -1) {
    console.log('输入的传输协议错误');
    console.log("请从['TBinaryProtocol', 'TJSONProtocol', 'TCompactProtocol']中选取");
    return;
  }

  var thrift      = Meteor.npmRequire('thrift'),
      transport   = Meteor.npmRequire('thrift/lib/thrift/transport')[transportType],
      protocol    = Meteor.npmRequire('thrift/lib/thrift/protocol')[protocolType],
      connection  = thrift.createConnection(ip, port, {
        transport : transport,
        protocol : protocol
      });

  connection.on('error', function(err) {
    console.log('Connection Failed!');
    console.log(err);
  });
  console.log('thrift server ip:' + ip + ', port:' + port);
  return connection;
}


/**
 * attach api to Meteor
 * @client {thrift client instance} thrift client instance
 * @apiList {Array} name of api
 */
function attachApi (clientName, client) {
  var apiList = getApiList(clientName);
  Meteor.lxp[clientName] = Async.wrap(client, apiList);
}


/**
 * set api list
 * 有待改进，目前直接写
 */
function getApiList (clientName) {
  var client = {
    Userservice: ['add', 'range', 'login', 'getUserById', 'updateUserInfo', 'isContact', 'addContact', 'addContacts',
    'removeContact', 'removeContacts', 'getContactList', 'createUser', 'createChatGroup', 'updateChatGroup',
    'getChatGroup', 'getUserChatGroups', 'addChatGroupMembers', 'removeChatGroupMembers', 'getChatGroupMembers'],
    // TODO add more client api
  };
  return client[clientName];
}
