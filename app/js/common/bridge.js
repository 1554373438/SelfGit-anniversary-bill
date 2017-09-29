(function() {
  var u = navigator.userAgent.toLowerCase();
  var isAndroid = u.indexOf('android') > -1 || u.indexOf('adr') > -1;
  var isIos = u.indexOf('iphone') > -1 || u.indexOf('ipad') > -1;
  var search = getLocationSearch();
  var CLIENT_VERSION = search.version || '';
  var oldIosVersion = CLIENT_VERSION >= '4.4.0' && CLIENT_VERSION < '5.3.0' && !isAndroid;

  function setupNewIosBridge(callback) {
    if (window.WebViewJavascriptBridge) {
      return callback(WebViewJavascriptBridge);
    }
    if (window.WVJBCallbacks) {
      return window.WVJBCallbacks.push(callback);
    }
    window.WVJBCallbacks = [callback];
    var WVJBIframe = document.createElement('iframe');
    WVJBIframe.style.display = 'none';
    WVJBIframe.src = 'wvjbscheme://__BRIDGE_LOADED__';
    document.documentElement.appendChild(WVJBIframe);
    setTimeout(function() { document.documentElement.removeChild(WVJBIframe) }, 0);
  }

  function Bridge() {
    var self = this;
    setupNewIosBridge(function(bridge) {
      self.bridge = bridge;
    });
    document.addEventListener('WebViewJavascriptBridgeReady', function() {
      self.bridge = WebViewJavascriptBridge;
    }, false);
  };


  Bridge.prototype.send = function(obj, callback) {
    console.log(obj);
    if (this.bridge) {
      if (isAndroid) {
        obj = JSON.stringify(obj);
      }
      if (CLIENT_VERSION >= '5.3.0') {
        this.bridge.callHandler('MZNativeHandler', obj, function(resData) {
          callback && callback(resData);
        });
      } else if (oldIosVersion) {
        this.bridge.callHandler('nonobankIos', obj, function(resData) {
          callback && callback(resData);
        });
      } else {
        this.bridge.send(obj, function(resData) {
          callback && callback(resData);
        });
      }
    }
  };

  window.Bridge = Bridge;

  function getLocationSearch() {
    var query_string = {};
    var query = window.location.search.substring(1);
    var vars = query.split("&");
    for (var i = 0; i < vars.length; i++) {
      var pair = vars[i].split("=");
      // If first entry with this name
      if (typeof query_string[pair[0]] === "undefined") {
        query_string[pair[0]] = decodeURIComponent(pair[1]);
        // If second entry with this name
      } else if (typeof query_string[pair[0]] === "string") {
        var arr = [query_string[pair[0]], decodeURIComponent(pair[1])];
        query_string[pair[0]] = arr;
        // If third or later entry with this name
      } else {
        query_string[pair[0]].push(decodeURIComponent(pair[1]));
      }
    }

    return query_string;
  }


})();
