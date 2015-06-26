Template.sendedMsg.onRendered(scrollIntoView());
Template.receivedMsg.onRendered(scrollIntoView());

function scrollIntoView () {
  return function (){
    var parent = $(this.firstNode).parent()[0];
    parent.scrollTop = parent.scrollHeight;
  }
}


Template.picMsg.events({
  'click .im-msg-send-plan-content>img': function(e){
    renderCenterPic(this.contents.full);
  },
});


/**
 * 渲染屏幕中央的图片模板
 * @param  {string} url 图片的地址
 * @return {[type]}        [description]
 */
function renderCenterPic (url) {
  var windowW = $(window).width();
  var windowH = $(window).height();

  showShadow(windowW, windowH);
  showPicContainer(url);
  adjustPicSize(windowW, windowH);
  setPicContainer(windowW, windowH);
  bindCenterPicCloseEvent();
  return ;
};

function showShadow(wW, wH){
  if (! showClass('full-screen-shadow')) {
    $('.full-screen-shadow').css('width', wW);
    $('.full-screen-shadow').css('height', wH);
  }
}

function showPicContainer (url) {
  showClass('center-pic-container');
  $('.center-pic-container').empty();
  $('.center-pic-container').append('<img src="' + url + '">');
}

/**
 * 展示相应的类
 * @param  {string} className 类名
 * @return {[type]}           [description]
 */
function showClass(className) {
  // 不存在则新建一个
  if ($('.' + className).length === 0) {
    $('body').append('<div class="' + className + '"></div>');
    return false;
  } else {
    $('.' + className).show();
    return true;
  }
};

/**
 * 调整图片的尺寸
 * @param  {[type]} wW window's width
 * @param  {[type]} wH window's height
 * @return {[type]}    [description]
 */
function adjustPicSize (wW, wH) {
  var iW = $('.center-pic-container img').width();
  var iH = $('.center-pic-container img').height();

  // 留白，不至于贴边
  wW = wW - 100;
  wH = wH - 100;

  var r = Math.min(wW / iW, wH / iH);
  if (r < 1) {
    iW = iW * r;
    iH = iH * r;
    $('.center-pic-container img').css({'width': iW, 'height': iH});
  }
  return ;
};

function setPicContainer (windowW, windowH) {
  var imageW = $('.center-pic-container img').width();
  var imageH = $('.center-pic-container img').height();

  $('.center-pic-container').css('left', (windowW - imageW)/2);
  $('.center-pic-container').css('top', (windowH - imageH)/2);
  return ;
}

/**
 * 绑定图片的关闭事件
 * @return {[type]} [description]
 */
function bindCenterPicCloseEvent () {
  $('.full-screen-shadow').on('click', function(){
    $('.full-screen-shadow').hide();
    $('.center-pic-container').hide();
  })
  return ;
}







