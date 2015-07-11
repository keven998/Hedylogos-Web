//db define
UserConversation = new Mongo.Collection('UserConversation');
Message1 = new Mongo.Collection('Message1');
AudioMsg = new Mongo.Collection('AudioMsg');

//Session define
Session.set('searchKeyword', '');