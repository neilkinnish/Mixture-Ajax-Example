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
    removeClass: removeClass,
    addClass: addClass
  };

})(window, document);
(function (window, document, undefined) {

  'use strict';

  // Add progress bar to the page
  document.body.innerHTML = '<div id="js-progress"></div>' + document.body.innerHTML;

  var progressBar = function (e, el) {
    if (e.lengthComputable) {
      var percent = (e.loaded / e.total) * 100;
      if (percent > 100) percent = 100;
      el.style.opacity = (percent >= 100) ? 0 : 1;
      el.style.width = percent + '%';
    } else { // if not computable, fake it
      el.style.opacity = 1;
      el.style.width = 50 + '%';
    }
  };

  var addPageContent = function (data, loaded, content, progress) {
    content.innerHTML = data;
    var imgs = content.querySelectorAll('img');

    if (imgs) {
      var count = imgs.length, size = Math.ceil(50/count);

      progressBar({ lengthComputable: true, loaded: loaded, total: 100 }, progress);

      for (var i = 0; i < imgs.length; i++) {
        loaded += size;
        var img = new Image();
        img.onload = function () {
          progressBar({ lengthComputable: true, loaded: loaded, total: 100 }, progress);
        };
        img.src = imgs[i].getAttribute('src');
      }

    } else {
        progressBar({ lengthComputable: true, loaded: 100, total: 100 }, progress);
    }
  };

  var setupNavigation = function (navigation, uri) {
    for (var i = 0; i < navigation.length; i++) {
      mix.removeClass(navigation[i].parentNode, 'selected');
      if (navigation[i].getAttribute('href') === uri) mix.addClass(navigation[i].parentNode, 'selected');
    }
  }

  // Handle page history and reloading content
  if (window.addEventListener && 'pushState' in history) {

    var historyInitialUri = location.href, pushStatePopped = false;

    window.addEventListener('popstate', function (e) {

      var initialPop = !pushStatePopped && location.href == historyInitialUri;
      pushStatePopped = true;

      if (initialPop) return;

      var uri = (location.pathname === '/') ? '/index' : location.pathname;
      var navigation = document.querySelectorAll('header a');
      setupNavigation(navigation, uri);
      var loaded = 50;

      mix.navigate({ 
        method: 'get', 
        uri: uri,
        uriPrefix: '/fragment',
        success: function (data) {
          addPageContent(data, loaded, document.getElementById('js-content'), document.getElementById('js-progress'));
        },
        error: function (status, statusText) {
          console.log(status, statusText);
        },
        progress: function (e) {
          progressBar(e, document.getElementById('js-progress'));
        }
      });
    }, false);
  }

  // Get the navigation items
  var navigation = document.querySelectorAll('header a');

  // Navigation events
  mix.click(navigation, function (e) {

    e.preventDefault();

    var uri = (e.target.pathname === '/') ? '/index' : e.target.pathname;
    setupNavigation(navigation, uri);

    var loaded = 50;

    mix.navigate({ 
      method: 'get', 
      uri: uri,
      uriPrefix: '/fragment',
      historyUri: e.target.pathname,
      success: function (data) {
        addPageContent(data, loaded, document.getElementById('js-content'), document.getElementById('js-progress'));
      },
      error: function (status, statusText) {
        console.log(status, statusText);
      },
      progress: function (e) {
        progressBar(e, document.getElementById('js-progress'));
      }
    });

  });

})(window, document);