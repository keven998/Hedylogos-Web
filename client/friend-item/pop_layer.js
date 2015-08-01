Template.planLayer.events({
  'click .btn': function (e) {
    e.preventDefault();
    lxpUser.sendPlanMsg(this);
  },

  'click .plan': function(e) {
    if ($(e.target).hasClass('btn'))
      return ;
    var uid = lxpUser.getUserId();
    window.open('http://h5.taozilvxing.com/planshare.php?pid=' + this.id + '&uid=' + uid);
  }
})

Template.searchLayer.events({
  'keydown input': function(e) {
    if (e.which == 13 || e.keyCode == 13) {
      var text = $.trim(e.target.value);

      if ( textVerify(text, Session.get('searchKeyword')) ){
        Session.set('searchKeyword', text);
        lxpUser.showSearchFullPoi(text);
      }
    }
  }
})

Template.searchList.events({
  'click .show-full': function(e) {
    var text = Session.get('searchKeyword');
    Session.set('searchKeyword', '');
    lxpUser.showSearchSinglePoi(text, this.type);
  }
})

Template.poiItem.events({
  'click .btn': function(e) {
    e.preventDefault();
    lxpUser.sendPoiMsg(this);
  },
  'click .poi-item': function(e) {
    if ($(e.target).hasClass('btn'))
      return ;
    lxpUser.showPoiDetail(this.content.id, this.type, this.content.zhName);
  }
})

Template.uploadLayer.events({
  "click #pic-up-sub": function(e){
    lxpUser.upAndSendImage();
  }
})

// 输入文本的验证：是否与上次的版本不同并且非空
function textVerify(text, lastText){
  if ((text !== '') && ((!lastText) || (lastText === '') || ($.trim(text) !== $.trim(lastText))))
    return true;
  return false;
}