window.mix = (function (window, document, undefined) {

  'use strict';

  var device = function () {
    if (window.addEventListener)
      return 'ontouchstart' in window ? 'touchstart' : 'click';
    else 
      return 'click';
  };

  var hasClass = function (el, className) {
    return new RegExp(' ' + className + ' ').test(' ' + el.className + ' ');
  }

  var addClass = function (el, className) {
    if (el && !hasClass(el, className)) {
      el.className += ' ' + className;
    }
  }

  var removeClass = function (el, className) {
    var newClass = ' ' + el.className.replace(/[\t\r\n]/g, ' ') + ' ';
    if (hasClass(el, className)) {
      while (newClass.indexOf(' ' + className + ' ') >= 0 ) {
        newClass = newClass.replace(' ' + className + ' ', ' ');
      }
      el.className = newClass.replace(/^\s+|\s+$/g, '');
    }
  }

  var removeClassRegex = function (el, regex) {
    var newClass = el.className.match(regex);
    removeClass(el, newClass);
  }

  var attach = function (obj, event, fn) {
    if (window.addEventListener)
      obj.addEventListener(event, fn, false);
    else
      obj.attachEvent('on' + event, fn);
  };

  var click = function (obj, callback) {
    for (var i = 0; i < obj.length; i++) {
      attach(obj[i], device(), callback);
    }
  };

  var progressBar = function (e, el) {
    if (e.lengthComputable) {
      var percent = (e.loaded / e.total) * 100;
      el.style.opacity = (percent >= 100) ? 0 : 1;
      el.style.width = percent + '%';
    } else { // if not computable, fake it
      el.style.opacity = 1;
      el.style.width = 50 + '%';
    }
  };

  var browserHistory = function (progressId, contentEl) {
    if (window.addEventListener && 'pushState' in history) {
      var historyInitialUri = location.href, pushStatePopped = false;
      document.body.innerHTML = '<div id="' + progressId + '"></div>' + document.body.innerHTML;
      window.addEventListener('popstate', function (e) {
        var initialPop = !pushStatePopped && location.href == historyInitialUri;
        pushStatePopped = true;
        if (initialPop) return;
        var uri = (location.pathname === '/') ? '/index' : location.pathname;
        navigate({ 
          method: 'get', 
          uri: uri,
          uriPrefix: '/fragment',
          success: function (data) {
            if (contentEl) document.getElementById(contentEl).innerHTML = data;
          },
          error: function (status, statusText) {
            console.log(status, statusText);
          },
          progress: function (e) {
            if (progressId) mix.progressBar(e, document.getElementById(progressId));
          }
        });
      }, false);
    }
  };

  var navigate = function (options) {

    var xhr = new XMLHttpRequest()
    , method = options.method || 'get'
    , dataType = options.dataType || 'html'
    , success = options.success
    , error = options.error
    , progress = options.progress
    , historyUri = options.historyUri
    , uriPrefix = options.uriPrefix || null;

    if (historyUri) {
      if ('pushState' in history)
        history.pushState(null, null, historyUri);
      else
        window.location.href = options.uri;
    }
    
    xhr.onreadystatechange = function () {
      if (this.readyState === 4) {
        if (this.status === 200) {
          var data = this.response || this.responseText || this.responseXML;
          if (dataType.match(/json/ig)) data = JSON.parse(data);
          if (success) success(data);
        } else {
          if (error) error(this.status, this.statusText);
        }
      }
    };

    xhr.onprogress = function (e) {
      if (progress) progress(e);
    };

    xhr.onerror = function (e) {
      if (error) error(e.status, e.statusText);
    };
    
    xhr.open(method, uriPrefix + options.uri);

    if (options.headers) {
      Object.keys(options.headers).forEach(function(key) {
        xhr.setRequestHeader(key, options.headers[key]);
      });
    }
    
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    xhr.send((options.data) ? urlstringify(options.data) : null);

  };

  return {
    navigate: navigate,
    click: click,
    progressBar: progressBar,
    browserHistory: browserHistory,
    removeClass: removeClass,
    addClass: addClass
  };

})(window, document);