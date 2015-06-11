// 本地（仅客户端）集合
// Errors 结合 include/error/中的文件使用
Errors = new Mongo.Collection(null);

throwError = function(msg) {
  Errors.insert({msg: msg});
};