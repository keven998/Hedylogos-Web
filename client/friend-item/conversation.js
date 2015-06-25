function scrollIntoView () {
  var parent = $(this.firstNode).parent()[0];
  parent.scrollTop = parent.scrollHeight;
}

Template.sendedMsg.onRendered(scrollIntoView());

Template.receivedMsg.onRendered(function() {
  // scrollIntoView();
  // soundManager.play('msg');
  msgSound.play();
});

