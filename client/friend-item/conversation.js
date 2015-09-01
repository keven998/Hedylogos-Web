Template.sendMsg.onRendered(scrollIntoView());
Template.receiveMsg.onRendered(scrollIntoView());

Template.receiveImageMsg.events({
  'click .im-msg-send-plan-content>img': function(e){
    renderCenterImage(this.contents.origin);
  },
});

Template.sendImageMsg.events({
  'click .im-msg-send-plan-content>img': function(e){
    renderCenterImage(this.contents.origin);
  },
});

Template.receivePoiMsg.events({
  'click #show-poi': function(e){
    showPoi(this);
  },
})

Template.sendPoiMsg.events({
  'click #show-poi': function(e){
    showPoi(this);
  },
})

function showPoi(data){
  switch (data.poiType){
    case '城市':
      lxpUser.showPoiDetail(data.contents.id, 'loc', data.contents.zhName);
      break;
    case '景点':
      lxpUser.showPoiDetail(data.contents.id, 'vs', data.contents.zhName);
      break;
    case '购物':
      lxpUser.showPoiDetail(data.contents.id, 'shopping', data.contents.zhName);
      break;
    case '美食':
      lxpUser.showPoiDetail(data.contents.id, 'restaurant', data.contents.zhName);
      break;
    default:
      break;
  }
}

// 新消息滚入页面
function scrollIntoView () {
  return function (){
    lxpUser.scrollIntoView( $(this.firstNode).parent()[0] );
  }
}

/**
 * 渲染屏幕中央的图片模板
 * @param  {string} url 图片的地址
 * @return {[type]}        [description]
 */
function renderCenterImage (url) {
  var windowW = $(window).width();
  var windowH = $(window).height();

  showShadow(windowW, windowH);
  showImageContainer(url);
  adjustImageSize(windowW, windowH);
  setImageContainer(windowW, windowH);
  bindCenterImageCloseEvent();
  return ;
};

// 展示阴影层
function showShadow(wW, wH){
  if (! showClass('full-screen-shadow')) {
    $('.full-screen-shadow').css('width', wW);
    $('.full-screen-shadow').css('height', wH);
  }
}

// 展示图片容器
function showImageContainer (url) {
  showClass('center-image-container');
  $('.center-image-container').empty();
  $('.center-image-container').append('<img src="' + url + '">');
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
function adjustImageSize (wW, wH) {
  var iW = $('.center-image-container img').width();
  var iH = $('.center-image-container img').height();

  // 留白，不至于贴边
  wW = wW - 100;
  wH = wH - 100;

  var r = Math.min(wW / iW, wH / iH);
  if (r < 1) {
    iW = iW * r;
    iH = iH * r;
    $('.center-image-container img').css({'width': iW, 'height': iH});
  }
  return ;
};

// 设置图片容器
function setImageContainer (windowW, windowH) {
  var imageW = $('.center-image-container img').width();
  var imageH = $('.center-image-container img').height();

  $('.center-image-container').css('left', (windowW - imageW)/2);
  $('.center-image-container').css('top', (windowH - imageH)/2);
  return ;
}

/**
 * 绑定图片的关闭事件
 * @return {[type]} [description]
 */
function bindCenterImageCloseEvent () {
  $('.full-screen-shadow').on('click', function(){
    $('.full-screen-shadow').hide();
    $('.center-image-container').hide();
  })
  return ;
}







