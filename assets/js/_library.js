window.mix = (function (window, document, undefined) {

  'use strict';

  /** 
    Class manipulation: _hasClass, _addClass, _removeClass
    http://toddmotto.com/apollo-js-standalone-class-manipulation-api-for-html5-and-legacy-dom
  */
  var exports = {}, _hasClass, _addClass, _removeClass;

  var _forEach = function (array, callback) {
    array = array.split(' ');
    for (var i = 0; i < array.length; i++) {
      callback(array[i], i);
    }
  };

  var _device = function () {
    if (window.addEventListener)
      return 'ontouchstart' in window ? 'touchstart' : 'click';
    else 
      return 'click';
  };

  if (document.documentElement.classList) {
    _hasClass = function (elem, className) {
      return elem.classList.contains(className);
    };
    _addClass = function (elem, className) {
      elem.classList.add(className);
    };
    _removeClass = function (elem, className) {
      elem.classList.remove(className);
    };
  } else {
    _hasClass = function (elem, className) {
      return new RegExp('(^|\\s)' + className + '(\\s|$)').test(elem.className);
    };
    _addClass = function (elem, className) {
      if (!exports.hasClass(elem, className)) {
        elem.className += (elem.className ? ' ' : '') + className;
      }
    };
    _removeClass = function (elem, className) {
      if (exports.hasClass(elem, className)) {
        elem.className = elem.className.replace(new RegExp('(^|\\s)*' + className + '(\\s|$)*', 'g'), '');
      }
    };
  }

  exports.hasClass = function (elem, className) {
    return _hasClass(elem, className);
  };

  exports.addClass = function (elem, classes) {
    _forEach(classes, function (className) {
      _addClass(elem, className);
    });
  };

  exports.removeClass = function (elem, classes) {
    _forEach(classes, function (className) {
      _removeClass(elem, className);
    });
  };

  exports.attachEvent = function (obj, event, fn) {
    if (window.addEventListener)
      obj.addEventListener(event, fn, false);
    else
      obj.attachEvent('on' + event, fn);
  };

  exports.click = function (obj, callback) {
    for (var i = 0; i < obj.length; i++) {
      this.attachEvent(obj[i], _device(), callback);
    }
  };

  exports.navigate = function (options) {
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

  return exports;

})(window, document);