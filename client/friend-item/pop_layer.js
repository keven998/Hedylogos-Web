Template.planLayer.events({
  'click .btn': function (e) {
    e.preventDefault();
    lxpUser.sendPlanMsg(this);
  },

  'click .plan': function(e) {
    if ($(e.target).hasClass('btn'))
      return ;
    window.open('http://h5.taozilvxing.com/planshare.php?pid=' + this.id);
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

Template.poi.events({
  'click .btn': function(e) {
    e.preventDefault();
    lxpUser.sendPoiMsg(this);
  }
})

function textVerify(text, lastText){
  if ((text !== '') && ((!lastText) || (lastText === '') || ($.trim(text) !== $.trim(lastText))))
    return true;
  return false;
}