Template.chatFaceContainer.helpers({
  'emoji': function(e) {
    return emojiArray;
  }
})

Template.chatFaceContainer.events({
  'click .emoji-wrapper': function(e) {
    var input = $('#J-im-input-text');
    input.html(input.html() + '<img src="/images/emoji/' + this.name + '.png" alt="" class="emoji-container">');
    return ;
  }
})