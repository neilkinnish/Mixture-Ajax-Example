(function (window, document, undefined) {

  'use strict';

  mix.browserHistory('js-progress', 'js-content');

  // Get the navigation items
  var navigation = document.querySelectorAll('header a');

  // Navigation events
  mix.click(navigation, function (e) {

    e.preventDefault();

    for (var i = 0; i < navigation.length; i++)
      mix.removeClass(navigation[i].parentNode, 'selected');

    if (e.target.parentNode.nodeName === 'LI')
      mix.addClass(e.target.parentNode, 'selected');

    mix.progressBar({ lengthComputable: true, loaded: 10, total: 100 }, document.getElementById('js-progress'));

    mix.navigate({ 
      method: 'get', 
      uri: (e.target.pathname === '/') ? '/index' : e.target.pathname,
      uriPrefix: '/fragment',
      historyUri: e.target.pathname,
      success: function (data) {
        document.getElementById('js-content').innerHTML = data;
        
        mix.progressBar({ lengthComputable: true, loaded: 100, total: 100 }, document.getElementById('js-progress'));
      },
      error: function (status, statusText) {
        console.log(status, statusText);
      },
      progress: function (e) {
        mix.progressBar(e, document.getElementById('js-progress'));
      }
    });

  });

})(window, document);