//db define
UserConversation = new Mongo.Collection('UserConversation');
Message1 = new Mongo.Collection('Message1');
AudioMsg = new Mongo.Collection('AudioMsg');
ContactRequest = new Mongo.Collection("ContactRequest");

//Session define
Session.set('searchKeyword', '');