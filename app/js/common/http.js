function http(options) {
  options = options || {};

  var HOST = /nonobank.com/.test(location.host) ? (location.protocol + '//' + location.host + (location.port ? ':' + location.port : '')) : 'https://m.sit.nonobank.com';
  var FESERVER = HOST + '/feserver';

  // FESERVER = 'http://192.168.35.148:1990';

  var instance = axios.create({
    baseURL: options.host || FESERVER,
    timeout: options.timeout || 60*1000
  });

  var loading = new Event('loading:show'),
    loaded = new Event('loading:hide'),
    appLogin = new Event('app:login');
  var counter = 0;

  instance.defaults.headers.common['Content-Type'] = 'application/json';

  // Add a request interceptor
  instance.interceptors.request.use(function(config) {

    // Do something before request is sent
    var jwt = sessionStorage.getItem('jwt');
    config.headers.jwt = jwt;
    if (!config.silence) {
      counter++;
      console.log('loading counter', counter);
      document.dispatchEvent(loading);
    }


    if (!config.noSign) {
      var encryptSign = new EncryptSign();
      if (config.method == 'get') {
        config.params = encryptSign.sign(config.params);
      } else {
        config.data = encryptSign.sign(config.data);
      }
    }
    return config;
  }, function(error) {
    // Do something with request error
    return Promise.reject(error);
  });

  // Add a response interceptor
  instance.interceptors.response.use(function(response) {
    if (!response.config.silence) {
      counter--;
      if (!counter) {
         console.log('loaded counter', counter);
        document.dispatchEvent(loaded);
      }
    }
    return response.data;
  }, function(error) {
    if (error.response && error.response.status === 401) {
      document.dispatchEvent(appLogin);
      document.dispatchEvent(loaded);
      return;
    }
    var ajaxError = new CustomEvent('ajax:error', {"detail": error});
    document.dispatchEvent(ajaxError);
    if (!error.config.silence) {
      counter--;
      if (!counter) {
        document.dispatchEvent(loaded);
      }
    }
  
   
    return Promise.reject(error);
  });

  return instance;
}
