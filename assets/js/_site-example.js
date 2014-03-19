(function (window, document, undefined) {

  'use strict';

  /** Add progress bar to the page */
  document.body.innerHTML = '<div id="js-progress"></div>' + document.body.innerHTML;

  var progressBar = function (e, el) {

    if (e.lengthComputable) {
      var percent = (e.loaded / e.total) * 100;
      if (percent > 100) percent = 100;
      el.style.opacity = (percent >= 100 || percent <= 0) ? 0 : 1;
      el.style.width = percent + '%';
    } else { // if not computable, fake it
      el.style.opacity = 1;
      el.style.width = 50 + '%';
    }

  };

  /** Function to add content to element, loop through images if any and update progress bar  */
  var addPageContent = function (data, content, progress) {

    content.innerHTML = data;
    var imgs = content.querySelectorAll('img');

    if (imgs) {
      var loaded = 50;
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

  /** Updates the navigation selected */
  var setupNavigation = function (navigation, uri) {

    for (var i = 0; i < navigation.length; i++) {
      mix.removeClass(navigation[i].parentNode, 'selected');
      if (navigation[i].getAttribute('href') === uri) mix.addClass(navigation[i].parentNode, 'selected');
    }

  }

  /** Handles browser history via the html5 history api */
  if (window.addEventListener && 'pushState' in history) {

    var historyInitialUri = location.href, pushStatePopped = false;

    window.addEventListener('popstate', function (e) {

      var initialPop = !pushStatePopped && location.href == historyInitialUri;
      pushStatePopped = true;

      if (initialPop) return;

      var uri = (location.pathname === '/') ? '/index' : location.pathname;
      var navigation = document.querySelectorAll('header a');
      setupNavigation(navigation, uri);

      mix.navigate({ 
        method: 'get', 
        uri: uri,
        uriPrefix: '/fragment',
        success: function (data) {
          addPageContent(data, document.getElementById('js-content'), document.getElementById('js-progress'));
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

  var navigation = document.querySelectorAll('header a');

  /** Click event / Ajax page loading with progress */
  mix.click(navigation, function (e) {

    progressBar({ lengthComputable: true, loaded: 0, total: 100 }, document.getElementById('js-progress'));

    e.preventDefault();

    var uri = (e.target.pathname === '/') ? '/index' : e.target.pathname;
    setupNavigation(navigation, uri);

    mix.navigate({ 
      method: 'get', 
      uri: uri,
      uriPrefix: '/fragment',
      historyUri: e.target.pathname,
      success: function (data) {
        addPageContent(data, document.getElementById('js-content'), document.getElementById('js-progress'));
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