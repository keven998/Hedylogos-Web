var reader;

Template.planLayer.events({
  // 发送plan消息
  'click .btn': function (e) {
    e.preventDefault();
    lxpUser.sendPlanMsg(this);
  },

  // 点击plan,跳转
  'click .plan': function(e) {
    if ($(e.target).hasClass('btn'))
      return ;
    var uid = lxpUser.getUserId();
    window.open('http://h5.taozilvxing.com/planshare.php?pid=' + this.id + '&uid=' + uid);
  }
})

Template.searchLayer.events({
  // input的键盘输入监听
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
  // 展示某一种类(poi)的所有搜索结果
  'click .show-full': function(e) {
    var text = Session.get('searchKeyword');
    Session.set('searchKeyword', '');
    lxpUser.showSearchSinglePoi(text, this.type);
  }
})

Template.poiItem.events({
  // 发送poi消息
  'click .btn': function(e) {
    e.preventDefault();
    lxpUser.sendPoiMsg(this);
  },

  // 点击单个poi的详情展示
  'click .poi-item': function(e) {
    if ($(e.target).hasClass('btn'))
      return ;
    lxpUser.showPoiDetail(this.content.id, this.type, this.content.zhName);
  }
})

Template.uploadLayer.events({
  // 上传图片到服务器并且发送该图片
  "click #pic-up-sub": function(e){
    lxpUser.upAndSendImage();
  },

  // 上传图片的预览以及进度的监控
  'change #file': function(evt){

    // 上传图片的预览
    var file = evt.target.files[0];
    reader = new FileReader();
    reader.onload = (function(theFile) {
      return function(e) {
        // Render thumbnail.
        var span = document.createElement('span');
        span.innerHTML = ['<img class="thumb" src="', e.target.result,
                          '" title="', escape(theFile.name), '"/>'].join('');
        $('#list').empty();
        document.getElementById('list').insertBefore(span, null);
      };
    })(file);
    reader.readAsDataURL(file);

    // 上传过程的进度监控
    var progress = document.querySelector('.percent');

    // Reset progress indicator on new file selection.
    progress.style.width = '0%';
    progress.textContent = '0%';

    reader = new FileReader();
    reader.onerror = errorHandler;
    reader.onprogress = updateProgress;
    reader.onabort = function(e) {
      alert('File read cancelled');
    };
    reader.onloadstart = function(e) {
      $('#progress_bar').show();
      document.getElementById('progress_bar').className = 'loading';
    };
    reader.onload = function(e) {
      // Ensure that the progress bar displays 100% at the end.
      progress.style.width = '100%';
      progress.textContent = '100%';
      // setTimeout("document.getElementById('progress_bar').className='';", 2000);
      setTimeout("$('#progress_bar').hide();", 2000);
    }

    // Read in the image file as a binary string.
    reader.readAsBinaryString(evt.target.files[0]);
  },

  // 中断上传功能
  'click .abort-load': function(e){
    reader && reader.abort();
  }
})

// 输入文本的验证：是否与上次的版本不同并且非空
function textVerify(text, lastText){
  if ((text !== '') && ((!lastText) || (lastText === '') || ($.trim(text) !== $.trim(lastText))))
    return true;
  return false;
}

// 错误处理
function errorHandler(evt) {
  var progress = document.querySelector('.percent');
  switch(evt.target.error.code) {
    case evt.target.error.NOT_FOUND_ERR:
      alert('File Not Found!');
      break;
    case evt.target.error.NOT_READABLE_ERR:
      alert('File is not readable');
      break;
    case evt.target.error.ABORT_ERR:
      break; // noop
    default:
      alert('An error occurred reading this file.');
  };
}

// 进度更新
function updateProgress(evt) {
  var progress = document.querySelector('.percent');
  // evt is an ProgressEvent.
  if (evt.lengthComputable) {
    var percentLoaded = Math.round((evt.loaded / evt.total) * 100);
    // Increase the progress bar length.
    if (percentLoaded < 100) {
      progress.style.width = percentLoaded + '%';
      progress.textContent = percentLoaded + '%';
    }
  }
}