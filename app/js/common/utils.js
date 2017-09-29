function setSession(key, value) {
  try {
    if (value === null) {
      sessionStorage.removeItem("reservation_" + key);
      return;
    }
    if (typeof value === 'object') {
      value = JSON.stringify(value);
    }
    sessionStorage.setItem("reservation_" + key, value);
  } catch (ex) {
    Storage.prototype._setItem = Storage.prototype.setItem;
    Storage.prototype.setItem = function() {};
    alert('请不要在无痕模式下打开');
  }
}

function getSession(key) {
  var data = sessionStorage.getItem("reservation_" + key);
  try {
    return JSON.parse(data);
  } catch (e) {
    return data;
  }
}


function getSearch() {
  if (window.location.search == '') {
    return false;
  }
  var query_string = {},
    query = window.location.search.substring(1), //获取url中？之后的内容(字符串)
    vars = query.split("&"); //split()将字符串分割成字符串数组
  for (var i = 0; i < vars.length; i++) {
    var pair = vars[i].split("=");
    // If first entry with this name
    if (typeof query_string[pair[0]] === "undefined") {
      query_string[pair[0]] = decodeURIComponent(pair[1]); //URI解码
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


//事件监听
function eventListener(type, handler) {
  if (document.addEventListener) {
    document.addEventListener(type, function(e) { handler(e) }, false);
  } else {
    document.attachEvent('on' + type, function(e) { handler(e) });
  }
}

// function appRun() {
//   window.bridge = new Bridge();
//   var terminal = getSearch().terminal || getSession('terminal');
//   var sessionId = getSearch().sessionId || getSession('sessionId');
//   if(!sessionId || (terminal!=4 &&terminal!=5)) {
//      window.location.href = 'empty.html';
//      return;
//   }

//   var standalone = window.navigator.standalone,
//     userAgent = window.navigator.userAgent.toLowerCase(),
//     ios = /iphone|ipod|ipad/.test(userAgent);

//   if (terminal==4|| ios && standalone) {
//     document.querySelector('body').className += ' platform-cordova platform-ios ';
//   }
// }

// appRun();
