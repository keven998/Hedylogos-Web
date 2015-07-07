Template.chatFaceContainer.helpers({
  'emoji': function(e) {
    return emojiArray;
  }
})

Template.chatFaceContainer.events({
  'click .emoji-wrapper': function(e) {
    var input = $('#J-im-input-text');
    var text = input.html();
    // 当有表情时，会用val值来记录
    if (! input.val()){
      input.val(input.html());
    }
    input.val(input.val() + this.str);
    input.html(text + '<img src="/images/emoji/' + this.name + '.png" alt="" class="emoji-container">');
    return ;
  }
})