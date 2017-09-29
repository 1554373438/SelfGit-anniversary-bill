/*
组件：toast
*/
Vue.component('loading', {
  props: {
    show: {
      type: Boolean,
      default: false
    },
  },
  template: '<div id="loading" class="row row-center" v-show="show">\
      <div class="inner">\
      <p></p>\
        <img src="images/loading.gif" width="26">\
      </div>\
    </div>'
});

