Template.chatFaceContainer.helpers({
  'emoji': function(e) {
    return emojiArray;
  }
})

Template.chatFaceContainer.events({
  'click .emoji-wrapper': function(e) {
  	var textarea = $('#J-im-input-text');
  	var text = textarea.val();
  	textarea.val(text + this.str);
    return ;
  }
})