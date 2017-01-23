(function() {
  var Facebook, fbappid;

  fbappid = location.href.indexOf("iing.tw") >= 0 ? '1476442785996284' : '267188576687915';

  window.$fb = {
    token: null,
    userID: null,
    picture: null,
    perms: "public_profile,user_photos,publish_actions",
    appId: fbappid,
    shareCapition: '',
    afterPageLoad: function() {},
    afterLogin: function(response) {
      $fb.token = response.authResponse.accessToken;
      $fb.userID = response.authResponse.userID;
      return $('body').addClass('fb-connected');
    },
    notLogin: function() {
      return $('body').addClass('no-fb');
    },
    beforeGetLoginStatus: function() {
      return $('body').addClass('fb-get-login-status');
    },
    afterGetLoginStatus: function() {
      return $('body').removeClass('fb-get-login-status');
    },
    beforeUserPictureLoaded: function() {
      return $('body').addClass('fb-get-picture');
    },
    afterUserPictureLoaded: function() {
      return $('body').removeClass('fb-get-picture');
    }
  };

  (function(d, s, id) {
    var fjs, js;

    js = void 0;
    fjs = d.getElementsByTagName(s)[0];
    if (d.getElementById(id)) {
      return;
    }
    js = d.createElement(s);
    js.id = id;
    js.src = '//connect.facebook.net/zh_TW/sdk.js';
    fjs.parentNode.insertBefore(js, fjs);
  })(document, 'script', 'fb-root');

  window.fbAsyncInit = function() {
    FB.init({
      appId: $fb.appId,
      cookie: true,
      xfbml: true,
      version: 'v2.5'
    });
    $fb.afterPageLoad();
    $('.js-fb-login').on('click', function() {
      return $facebook.dialogLogin(function() {
        return $facebook.getLoginStatus(function() {
          return $facebook.getUserPicture();
        });
      });
    });
    return $('.js-fb-upload').on('click', function() {
      if ($fb.token) {
        return $facebook.uploadPicture();
      } else {
        return $facebook.dialogLogin(function() {
          return $facebook.getLoginStatus(function() {
            return $facebook.uploadPicture();
          });
        });
      }
    });
  };

  Facebook = (function() {
    function Facebook() {}

    Facebook.prototype.getUserPicture = function() {
      var url;

      $fb.beforeUserPictureLoaded();
      url = "/" + $fb.userID + "/picture?width=500&height=500";
      return FB.api(url, function(result) {
        $fb.picture = result.data.url;
        return $util.urlToBlob($fb.picture, function(blob) {
          loadImage([blob]);
          return $fb.afterUserPictureLoaded();
        });
      });
    };

    Facebook.prototype.getLoginStatus = function(callback) {
      $fb.beforeGetLoginStatus();
      return FB.getLoginStatus(function(response) {
        var status;

        status = response.status;
        if (status === 'connected') {
          $fb.afterLogin(response);
          callback();
        } else if (status === 'not_authorized') {
          $fb.notLogin();
        } else {
          $fb.notLogin();
        }
        return $fb.afterGetLoginStatus();
      });
    };

    Facebook.prototype.dialogLogin = function(callback) {
      return FB.login((function(response) {
        return callback(response);
      }), {
        scope: $fb.perms,
        return_scopes: true
      });
    };

    Facebook.prototype.publishPost = function(imgurl) {
      return FB.api('/me/feed', 'post', {
        link: 'http://2.iing.tw',
        picture: imgurl
      }, function(response) {
        return xx(response.id);
      });
    };

    Facebook.prototype.uploadPicture = function() {
      return $util.uploadBase64(getBase64(), function(url, w) {
        $facebook.publishPost(url);
        return FB.api('/me/photos', 'post', {
          access_token: $fb.token,
          url: url,
          caption: $fb.shareCapition
        }, function(response) {
          $util.resizeWindow(w, 520, 400);
          if (response.id) {
            url = "https://m.facebook.com/photo.php?fbid=" + response.id + "&prof=1";
            return w.location.href = url;
          }
        });
      });
    };

    return Facebook;

  })();

  window.$facebook = new Facebook();

}).call(this);
