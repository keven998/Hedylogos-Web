// dependencies: lib/etcd_util.js

var mongoUrlHedy = getHedyMongoUrl();
var hedy = new MongoInternals.RemoteCollectionDriver(mongoUrlHedy);

Message = new Mongo.Collection("Message", { _driver: hedy});

function getHedyMongoUrl () {
  var Etcd = new EtcdClass();
  var result = Etcd.callEtcd();

  // 解析出相关参数
  var mongoUrl = Etcd.getSettingValue(Etcd.settingPath.mongo.url.path, result);
  var mongoUser = Etcd.getSettingValue(Etcd.settingPath.mongo.auth.user, result);
  var mongoPassword = Etcd.getSettingValue(Etcd.settingPath.mongo.auth.password, result);
  var mongoDBName = 'hedy';

  return 'mongodb://' + mongoUser + ':' + mongoPassword + '@' + mongoUrl.toString() + '/' + mongoDBName + '?' + 'authSource=admin&authMechanism=SCRAM-SHA-1';
}

