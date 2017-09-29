(function() {
  var bridge = new Bridge();
  setTimeout(function() {
    if (bridge.bridge) {
      bridge.send({
        type: 'hideAppLoading'
      });
    }
  }, 500);
  var sessionId = getSearch()['sessionId'] || '';
  var terminal = getSearch()['terminal'];
  var ua = navigator.userAgent;
  var isAndroid = ua.toLowerCase().indexOf('android') > -1 || ua.toLowerCase().indexOf('adr') > -1;
  var version = getSearch()['version'];
  var $http = new http();

  var isFromApp = false;
  if (terminal == 4 || terminal == 5 || bridge.bridge) {
    isFromApp = true;
  }

  var HOST = /nonobank.com/.test(location.host) ? (location.protocol + '//' + location.host + (location.port ? ':' + location.port : '')) : 'https://m.stb.nonobank.com';
  var shareData = {
    'share_title': '诺诺八年平台，投资很安心，推荐你也来。',
    'share_desc': '银行存管已上线，新手历史收益12%，更有888元现金券礼包。',
    'share_url': HOST + '/nono/envoy-land-page/index.html', //分享链接,
    'share_icon': HOST + '/nono/anniversary-bill/images/share_logo.jpg',
    'share_type': 1, //1 普通分享 2 二维码
    'share_sms': 'xxx'
  };

  var isWeiXin = /micromessenger/.test(ua.toLowerCase());
  if (isWeiXin) {
    wxShare();
  }

  var timer, odEl;
  var odEl = document.getElementById('odometer');
  var toastr = {
    active: false,
    info: function(msg) {
      var _this = this;
      if (_this.active) {
        return;
      }
      _this.active = true;
      vm.toastrInfo = msg;
      setTimeout(function() {
        vm.toastrInfo = '';
        _this.active = false;
      }, 3000)
    }
  };
  var vm = new Vue({
    el: '#app',
    components: { swiper: VueSwiper },
    data: {
      isLoading: false,
      toastrInfo: '',
      toastMask: false,
      showShareMask: false,
      MoveSwiperTwo: false,
      MoveSwiperThree: false,
      MoveSwiperfour: false,
      MoveSwiperfive: false,
      MoveSwiperBill: false,
      hasNumInvestCnt: false,
      hasNoNumInvestCnt: false,
      moreTxt: false,

      productId: '',
      regTimes: '',
      firstInvestTimeStr: '',
      maxInvestTimeStr: '',
      firstCashoutTimeStr: '',
      billInfo: {}
    },
    methods: {
      onSlideChangeEnd: function(currentPage) {
        if (vm.hasNoNumInvestCnt && currentPage == 2) {
          vm.MoveSwiperBill = true;
          return;
        }
        switch (currentPage) {
          case 1:
            vm.MoveSwiperTwo = false;
            vm.MoveSwiperThree = false;
            vm.MoveSwiperfour = false;
            vm.MoveSwiperfive = false;
            vm.MoveSwiperBill = false;
            break;
          case 2:
            vm.MoveSwiperTwo = true;
            vm.MoveSwiperThree = false;
            vm.MoveSwiperfour = false;
            vm.MoveSwiperfive = false;
            vm.MoveSwiperBill = false;
            break;
          case 3:
            vm.MoveSwiperThree = true;
            vm.MoveSwiperTwo = false;
            vm.MoveSwiperfour = false;
            vm.MoveSwiperfive = false;
            vm.MoveSwiperBill = false;
            break;
          case 4:
            vm.MoveSwiperTwo = false;
            vm.MoveSwiperThree = false;
            vm.MoveSwiperfour = true;
            vm.MoveSwiperfive = false;
            vm.MoveSwiperBill = false;
            break;
          case 5:
            vm.MoveSwiperTwo = false;
            vm.MoveSwiperThree = false;
            vm.MoveSwiperfour = false;
            vm.MoveSwiperfive = true;
            vm.MoveSwiperBill = false;
            break;
          case 6:
            vm.MoveSwiperTwo = false;
            vm.MoveSwiperThree = false;
            vm.MoveSwiperfour = false;
            vm.MoveSwiperfive = false;
            vm.MoveSwiperBill = true;
            break;
        };
      },

      init: function() {
        var self = this;
        if (!sessionId) {
          vm.toastMask = true;
          return;
        };

        $http.get('/common/current', { silence: true, noSign: true }).then(function(res) {
          if (res.succeed) {
            var sysTime = res.data.timestamp;
            var offsetTime = sysTime - Date.now();
            sessionStorage.setItem('mzST', offsetTime);
            vm.date = res.data.time && res.data.time.slice(0, 10);
            vm.getJWT(function() {
              vm.queryUserBill();
            });
          }
        });
      },

      getJWT: function(callback) { //获取接口所需要的jwt

        $http.get('/common/jwt/' + sessionId).then(function(res) {
          if (!res.succeed) {
            vm.toastMsg = res.errorMessage;
            return;
          }
          var jwt = res.data.jwt;
          sessionStorage.setItem('jwt', jwt);
          callback && callback();
        });
      },

      queryUserBill: function() {
        $http.get('/activity/nono-anniversary/queryUserBill').then(function(res) {
          if (res.succeed && res.data) {
            vm.billInfo = res.data;
            vm.investCnt = res.data.investCnt; //累计投资次数；
            vm.investAmt = res.data.investAmt; //累计投资金额；

            // var regTime = (new Date(vm.billInfo.registerTime)).getTime();
            if (res.data.investCnt == 0 || !res.data.registerTime) {
              vm.hasNoNumInvestCnt = true;
              return;
            }
            vm.hasNumInvestCnt = true;

            vm.regTimes = res.data.registerTime; //  注册时间；
            // vm.registerRank = res.data.registerRank; // 注册排序；
            document.getElementById('swiper_vertical').style.display = 'block';
            odEl = document.getElementById('odometer');

            vm.odometerFn(vm.billInfo.registerRank);
            vm.clearTimer(vm.billInfo.registerRank);

            vm.firstInvestTimeStr = res.data.firstInvestTime; //第一次投资时间；
            // vm.firstInvestAmt = res.data.firstInvestAmt; // 第一次投资金额；

            vm.maxInvestTimeStr = res.data.maxInvestTime; //最大一次投资时间；
            // vm.maxInvestAmt = res.data.maxInvestAmt; //最大一次投资金额；

            vm.firstCashoutTimeStr = res.data.firstCashoutTime; //第一次回款时间 
            // var newTime = (new Date("2017/06/15 00:00:00")).getTime();
            var newTime = (new Date("2017/06/15 00:00:00")).getTime();
            var oldTime = (new Date(vm.billInfo.firstCashoutTime)).getTime();
            if (oldTime > newTime) {
              vm.moreTxt = true;
            }
            vm.productId = res.data.id;
            vm.investEarningAmt = res.data.investEarningAmt.toFixed(2); //累计收益
            // vm.allInvestEarningAmt = res.data.allInvestEarningAmt; //平台累计赚取金额
            // vm.invitedUserCnt = res.data.invitedUserCnt; //累计邀请人数
            // vm.invitedEarningsAmt = res.data.invitedEarningsAmt; //用户累计获得奖励金额
            // vm.allInvitedUserCnt = res.data.allInvitedUserCnt; //平台累计邀请人数
          }
        });
      },

      odometerFn: function(index) {
        timer = setInterval(function() {
          odEl.innerHTML = '';
          setTimeout(function() {
            odEl.innerHTML = index;
          }, 0);
        }, 500);
      },

      clearTimer: function(amount) {
        setTimeout(function() {
          clearInterval(timer);
          timer = null;
          odEl.innerHTML = amount;
        }, 1000);
      },

      goInvest: function() {
        _czc.push(["_trackEvent", "8周年账单", "点击", "去投资"]);
        var protocol = 'mzjf://';
        var home = 'product_productList/?InitialIndex=0';
        var planDetail = 'product_planDetail/?productId=' + vm.billInfo.id + '&productType=4&scope=1';
        var link = '';
        var showType = '0';
        if (isAndroid && version <= '5.3.1') {
          protocol = 'nonobank://';
        }
        if (version >= '5.3.1') {
          home = 'product_jumpToInvestList/?index=0';
        }
        if (isFromApp) {
          if (+vm.investCnt) {
            link = protocol + home;
            showType = '2';
          } else {
            link = protocol + planDetail;
          }
          bridge.send({
            type: 'pageRoute',
            data: {
              link: link,
              showType: showType
            }
          });
          return;
        }
        var messageData = JSON.stringify({
          type: 'backToApp'
        });
        parent.postMessage(messageData, '*');
        // window.location.href = 'https://m.nonobank.com/nono-app/#/home';
      },

      share: function() {
        _czc.push(["_trackEvent", "8周年账单", "点击", "邀好友"]);
        $http.get('/user/info').then(function(res) {
          if (res.succeed) {
            var mobile = res.data.mobile;
            shareData.share_url += '?mobile=' + mobile;
            if (isFromApp) {
              bridge.send({
                type: 'share',
                data: shareData
              });
            } else {
              vm.showShareMask = true;
              var messageData = JSON.stringify({
                type: 'share',
                data: shareData
              })
              parent.postMessage(messageData, '*');
            }
          }
        })

      },
      close: function() {
        vm.showShareMask = false;
      }

    }

  });

  // 时间监听
  eventListener('loading:show', function() {
    console.log('loading');
    vm.isLoading = true;
  });

  eventListener('loading:hide', function() {
    vm.isLoading = false;
    console.log('loaded');
  });

  eventListener('ajax:error', function(evt) {
    vm.isLoading = false;
    var rejection = evt.detail;
    try {
      if (rejection.config.method === 'post' && rejection.response) {
        toastr.info(rejection.response.status + ' : ' + rejection.response.statusText);
      }
    } catch (e) {
      toastr.info('网络不给力呦~');
    }

  });
  eventListener('app:login', function() {
    vm.toastMask = true;
    // bridge.send({
    //   type: 'sessionExpire',
    //   data: {
    //     url: HOST + '/nono/anniversary-bill/index.html'
    //   }
    // });
  });
  vm.init();

  function wxShare() {
    var curUrl = window.location.href;
    var params = {
      url: curUrl,
      // type: 'nonobank'
      type: /m.nonobank.com/.test(HOST) ? 'nonobank' : 'zhanglin'
    };

    $http.post('/wechat/signature', params).then(function(res) {
      if (res.errcode) {
        return;
      }

      wx.config({
        debug: false, // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
        appId: res.appId, // 必填，公众号的唯一标识
        timestamp: res.timestamp, // 必填，生成签名的时间戳
        nonceStr: res.nonceStr, // 必填，生成签名的随机串
        signature: res.signature, // 必填，签名，见附录1
        jsApiList: ["checkJsApi", "onMenuShareTimeline", "onMenuShareAppMessage", "onMenuShareQQ", "onMenuShareQZone"] // 必填，需要使用的JS接口列表，所有JS接口列表见附录2
      });
      wx.error(function(res) {});

      wx.ready(function() {
        // alert(share_link);
        //朋友圈
        wx.onMenuShareTimeline({
          title: shareData.share_title, // 分享标题
          desc: shareData.share_desc, // 分享描述
          link: shareData.share_link, // 分享链接
          imgUrl: shareData.share_icon, // 分享图标
          success: function() {

            // 用户确认分享后执行的回调函数
            // shareSuccess();
          },
          cancel: function() {
            // 用户取消分享后执行的回调函数
          }
        });
        //好友
        wx.onMenuShareAppMessage({
          title: shareData.share_title, // 分享标题
          desc: shareData.share_desc, // 分享描述
          link: shareData.share_link, // 分享链接
          imgUrl: shareData.share_icon, // 分享图标
          type: '', // 分享类型,music、video或link，不填默认为link
          dataUrl: '', // 如果type是music或video，则要提供数据链接，默认为空
          success: function() {
            // alert(share_link)// 用户确认分享后执行的回调函数
            // shareSuccess();
          },
          cancel: function() {
            // 用户取消分享后执行的回调函数
          }
        });
        //QQ
        wx.onMenuShareQQ({
          title: shareData.share_title, // 分享标题
          desc: shareData.share_desc, // 分享描述
          link: shareData.share_link, // 分享链接
          imgUrl: shareData.share_icon, // 分享图标
          type: '', // 分享类型,music、video或link，不填默认为link
          dataUrl: '', // 如果type是music或video，则要提供数据链接，默认为空
          success: function() {
            // alert(1)// 用户确认分享后执行的回调函数
          },
          cancel: function() {}
        });
      });
    });

  };

})();
