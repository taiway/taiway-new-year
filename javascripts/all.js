var
$userimage = $('#userimage .inner'),
$coverimage = $('#coverimage .inner'),
$dragger = $('#dragger'),
$draggerBorder = $('#dragger-border'),
$sizer = $('#size-slider'),
$loading = $('#loading');
$uploading = $('#uploading');
var $originSize = $coverimage.width();
var $exportSize = 500;

function resetUserImage(pos) {
  $userimage
    .css('background-size',pos[0]+'px '+pos[1]+'px')
    .css('background-position',pos[2]+'px '+pos[3]+'px');
}

function changeSizerValue(value) {
  $sizer.slider('value', value)
}

$(window).load(function() {
  var
  container_size = $userimage.width(),
  userimage_size = $util.getImgSize($util.getBackgroundImageUrl($userimage));
  pos = resizeDragger(userimage_size,container_size);
  nonImageLoadState();
  resetUserImage(pos)
});

$(document).ready(function() {
  // if(location.href.indexOf("fb-review") >= 0) {
  //   $('.js-fb-upload').show()
  // }
  // ie alert
  $("body").iealert({
    support: 'ie9',
    title: '您的瀏覽器太舊啦！',
    text: '請更新您的瀏覽器，我們推薦您使用 Google Chrome',
    closeBtn: false,
    upgradeTitle: '下載 Google Chrome',
    upgradeLink: 'http://www.google.com/chrome/'
  });

  // dragger
  $draggerBorder.css('position', 'absolute').css('z-index', '-100').css('width', '100%').css('height', '100%')
  $dragger.draggable({
    drag: function(event) {
      $userimage.css('background-position',$dragger.css('left')+' '+$dragger.css('top'));
      if($userimage.hasClass('dragged') == false) $userimage.addClass('dragged');
      var value = $('input[name=template]:checked').val();
      // if(value == 9 || value == 10) $userimage.attr('class','inner');
    },
    containment: $draggerBorder
  });

  // size slider
  $sizer.slider({
    value: 100,
    max: 200,
    min: 100,
    slide: function(event, ui) {
      var
      truesize = $util.getBackgroundSize($userimage.css('background-size')),
      position = $util.getBackgroundPosition($userimage.css('background-position')),
      center = $util.getBackgroundCenterPoint(truesize,position);
      $('<img/>').attr('src',$util.getBackgroundImageUrl($userimage))
      .load(function() {
        var
        size = [$originSize, $originSize],
        width = size[0]*(ui.value)/100,
        height = size[1]*(ui.value)/100,
        left = center[0] - width*0.5,
        top = center[1] - height*0.5;

        // 強制把圖放回中間
        // left = 0 - ((width - $originSize) / 2)
        // top = 0 - ((height - $originSize) / 2)

        // 以下是針對四個角在 resize 時做調整，避免圖在縮小時跑到邊界外 XD
        // 但後來決定 resize 直接強制把圖放回中間，所以就註解了
        if(top > 0){
          top = 0
        } else if(top + height < $originSize) {
          top = $originSize - height
        }
        if(left > 0){
          left = 0;
        } else if(left + width < $originSize){
          left = $originSize - width
        }

        $dragger
          .css('width',width+'px').css('height',height+'px')
          .css('top',top+'px').css('left',left+'px');
        $userimage
          .css('background-size',width+'px '+height+'px')
          .css('background-position',left+'px '+top+'px');
        originSize = $coverimage.width()
        // console.log(width, height)
        borderWidth  = width <= originSize ? originSize : originSize + ((width - originSize) * 2)
        borderHeight = height <= originSize ? originSize : originSize + ((height - originSize) * 2)
        // console.log(borderWidth, borderHeight)
        borderLeft = (originSize / 2) - borderWidth*0.5,
        borderTop = (originSize / 2) - borderHeight*0.5;
        $draggerBorder
          .css('width',borderWidth+'px').css('height',borderHeight+'px')
          .css('top',borderTop+'px').css('left',borderLeft+'px');
      });
      if(ui.value == 100) {
        $dragger.draggable( 'disable' )
      } else {
        $dragger.draggable( 'enable' )
      }
    }
  });

  // change template
  $('body').delegate('input[name=template]','change',function(){
    var
    width,
    value = $(this).val(),
    url = 'images/object/'+value+'.png';

    $coverimage.css('background-image','url('+url+')');
    if($userimage.hasClass('dragged') == true) $userimage.attr('class', 'inner dragged');
    else $userimage.attr('class', 'inner');

    // 執行這塊會造成 draggerBorder 失效，使得圖片可以被拖曳到看不見，只好先註解，因為也沒有造成其他問題
    // $('<img/>').attr('src',$util.getBackgroundImageUrl($userimage))
    // .load(function() {
    //   var
    //   size = [this.width,this.height],
    //   container_size = $userimage.width();
    //   resizeDragger(size,container_size,value);
    // });
  });

  $("#normalSubmit").click(function() {
    downloadImage();
  });
});
// $(window).konami({
//   code : [55,55,55],
//   cheat: function() {
//     $('.banana').slideDown();
//   }
// });
// $(window).konami({
//   code : [54,54,54],
//   cheat: function() {
//     $('h1,#size-slider').delay(100).animate({'opacity':'0'},2900)
//     $('#formbuttons,.template-label').delay(400).animate({'opacity':'0'},2600)
//     $('#settings').delay(1000).animate({'opacity':'0'},2000)
//     $('.left-bottom-corner').delay(800).animate({'opacity':'0'},2200)
//     $('.preview').animate({'top':'-500px','opacity':'0.5'},3000).animate({'width':'0','opacity':'0'},3000,function(){
//       $('#content').slideUp();
//     })
//   }
// });

window.getBase64 = function() {
  var
  basesize = $userimage.width(),
  size = $util.getBackgroundSize($userimage.css('background-size')),
  position = $util.getBackgroundPosition($userimage.css('background-position')),
  scale = basesize/$exportSize;

  var
  template = $('input[name=template]:checked').val(),
  source = $('#source').val(),
  w = size[0]/scale,
  h = size[1]/scale,
  x = position[0]/scale,
  y = position[1]/scale;

  var cover = new Image();
  cover.src = 'images/object/'+template+'.png';

  var userimage = new Image();
  userimage.src = source;

  var resize_canvas = document.getElementById("result");
  resize_canvas.width = $exportSize;
  resize_canvas.height = $exportSize;
  var ctx = resize_canvas.getContext("2d");
  ctx.rect(0,0,$exportSize,$exportSize);
  ctx.fillStyle="#CCCCCC";
  ctx.fill();
  ctx.drawImage(userimage,x,y,w,h);
  ctx.drawImage(cover,0,0,$exportSize,$exportSize);

  return resize_canvas.toDataURL("image/png");
}

function downloadImage(){
  var base64 = getBase64()

  // check ie or not
  var ua = window.navigator.userAgent;
  var msie = ua.indexOf("MSIE ");
  if (msie > 0 || !!navigator.userAgent.match(/Trident.*rv\:11\./)){
    var html="<p>請按右鍵另存圖片</p>";
    html+="<img src='"+base64+"' alt='iing-no-2'/>";
    var tab=window.open();
    tab.document.write(html);
  } else {
    $util.downloadByBase64(base64 ,function(url, w) {
      $util.resizeWindow(w, 500, 500)
      w.location.href = url
    })
    // 原本的 download 方式
    // base64 = base64.replace("image/png", "image/png;headers=Content-Disposition%3A%20attachment%3B%20filename=iing-no-2.png;")
    // $('#download').attr('href',base64);
    // $('#download').attr('download', "iing-no-2.png");
    // $('#download').attr('target', "_blank");
    // $('#download')[0].click();
  }
}

//uploader
$(function(){
  var dropZone = document.getElementById('drop');
  dropZone.addEventListener('dragover', handleDragOver, false);
  dropZone.addEventListener('drop', handleFileSelect, false);

  $('.uploadBtn').click(function(){
    $('#uploadInput').click();
  });
  $('#uploadInput').on('change',function(){
    input = document.getElementById('uploadInput');
    if(input.files[0]) {
      loadImage(input.files);
      changeSizerValue(100)
    }
  });
});

// drag image
function handleFileSelect(evt) {
  evt.stopPropagation();
  evt.preventDefault();
  var files = evt.dataTransfer.files;
  loadImage(files);
}
function handleDragOver(evt) {
  evt.stopPropagation();
  evt.preventDefault();
  evt.dataTransfer.dropEffect = 'copy';
}

// function
window.loadImage = function(files) {
  var file, fr, img;
  if (!files) {
    alert('悲劇！您的瀏覽器不支援檔案上傳！')
  } else {
    $uploading.fadeIn();
    $loading.show();
    file = files[0];
    fr = new FileReader();
    fr.onload = createImage;
    fr.readAsDataURL(file);
  }
  function createImage() {
    img = new Image();
    img.onload = imageLoaded;
    img.src = fr.result;
  }
  function imageLoaded() {
    var canvas = document.getElementById("canvas")
    if( this.width > this.height) {
      sx = (this.width - this.height) / 2
      sy = 0
      imgW = this.height
      imgH = this.height
    } else if( this.width < this.height) {
      sx = 0
      sy = (this.height - this.width) / 2
      imgW = this.width
      imgH = this.width
    } else { // width == height
      sx = 0
      sy = 0
      imgW = this.width
      imgH = this.height
    }
    var ctx = canvas.getContext("2d");
    ctx.drawImage(img, sx, sy, imgW, imgH, 0, 0, $exportSize, $exportSize);
    var base64 = canvas.toDataURL("image/png");

    $('#source').attr('value',base64);
    $userimage.css('background-image','url('+base64+')');

    var thumb = document.getElementById("thumb");
    var thumb_w,thumb_h;
    if(img.width > img.height) {
      thumb_h = 100;
      thumb_w = 100*(img.width/img.height);
    }
    else {
      thumb_w = 100;
      thumb_h = 100*(img.height/img.width);
    }
    thumb.width = thumb_w;
    thumb.height = thumb_h;
    var ctx = thumb.getContext("2d");
    ctx.drawImage(img,0,0,thumb_w,thumb_h);
    var thumbbase64 = thumb.toDataURL("image/png");
    $('#templates label').css('background-image','url('+thumbbase64+')');

    $('<img/>').attr('src',base64)
    .load(function() {
      var
      value = $('input[name=template]:checked').val(),
      container_size = $userimage.width(),
      userimage_size = [$originSize, $originSize];
      pos = resizeDragger(userimage_size, container_size,value);
      resetUserImage(pos)

      $loading.hide();
      $uploading.fadeOut();
    });
  }
}
function resizeDragger(size,wrapper,value,upload,init)
{
  value = typeof value !== 'undefined' ? value : 1;
  upload = typeof upload !== 'undefined' ? upload : 0;

  var scale, width, height, top, left;
  if(size[0] > size[1]) {
    scale = (wrapper/size[1]);
    width = size[0]*scale;
    height = wrapper;
    top = 0;
    left = (width - wrapper)*0.5*-1;
  }
  else {
    scale = (wrapper/size[0]);
    width = wrapper;
    height = size[1]*scale;
    top = (height - wrapper)*0.5*-1;
    left = 0;
  }

  // if(value == 6){
  //   left = wrapper*0.2*-1;
  //   if(size[0] > size[1]) left -= (width-wrapper)*0.5;
  // }
  // else if(value == 9){
  //   $sizer.slider('value',65);
  //   if(size[0] > size[1]) {
  //     left = wrapper*0.65*0.13*0.5;
  //     width *=0.65;
  //     height *=0.65;
  //     top = (wrapper - height)*0.48;
  //   }
  //   else {
  //     left = wrapper*0.65*0.13*0.5;
  //     width *=0.65;
  //     height *=0.65;
  //     top = (wrapper - height)*0.48;
  //   }
  // }
  // else if(value == 10){
  //   $sizer.slider('value',92);
  //   if(size[0] > size[1]) {
  //     width = wrapper*0.92;
  //     height = width*(size[1]/size[0]);
  //     top = wrapper*0.045;
  //     left = (wrapper-width)*0.5;
  //   }
  //   else {
      // width = width*0.92;
      // height = height*0.92;
      // top = wrapper*0.045;
      // left = (wrapper-width)*0.5;
  //   }
  // }
  $dragger
    .css('width',width+'px').css('height',height+'px')
    .css('top',top+'px').css('left',left+'px');
  // $userimage
  //   .css('background-size',width+'px '+height+'px')
  //   .css('background-position',left+'px '+top+'px');
  return [width, height, left, top]
}

// 沒有圖片上傳時的預設圖片處理 function，目的是讓預設圖片也可以被下載
function nonImageLoadState() {
  var dftImage = new Image();
  dftImage.src = "/images/sample.jpg";
  function drawDftImage(dftImage) {
    var dftcv = document.getElementById("canvas");
    dftcv.width = $exportSize;
    dftcv.height = $exportSize;
    var dftctx = dftcv.getContext("2d");
    dftctx.drawImage(dftImage, 0, 0, dftImage.width, dftImage.height, 0, 0, $exportSize, $exportSize);
    var dftimgbase64 = dftcv.toDataURL("image/png");
    $('#source').attr('value',dftimgbase64);
    value = $originSize+'px '+$originSize+'px'
    $userimage.css('background-image','url('+dftimgbase64+')').
      css('background-size', value)
  }
  drawDftImage(dftImage);
}

window.onresize = function(e) {
  $originSize = $coverimage.width()
  resizeDragger($originSize, $originSize)
  resetUserImage([$originSize, $originSize, 0, 0])
  $draggerBorder
    .css('width', '100%').css('height', '100%')
    .css('top', 'auto').css('left', 'auto')
  changeSizerValue(100)
  $dragger.draggable( 'disable' )
}

// smooth-scroll-link
$('.smooth-scroll-link').smoothScroll();
