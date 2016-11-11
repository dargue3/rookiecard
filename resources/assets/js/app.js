import { Vue, Router } from './routes.js'
var VueResource = require('vue-resource');
var VueAutosize = require('vue-autosize');
var VueTouch = require('vue-touch');
var SmoothScroll = require('smoothscroll-polyfill');

Vue.use(VueResource);
Vue.use(VueAutosize);
Vue.use(VueTouch);

// attach scrolling library
SmoothScroll.polyfill();

Vue.config.debug = true;

// pull meta data from server out of tags in <head> of main.blade
Vue.http.headers.common['X-CSRF-TOKEN'] = $('#_token').attr('value');


// create any global components here
Vue.component('spinner', {
	template: 
		`<span class="loading-spinner">
			<span class="first" :style="color"></span>
			<span class="second" :style="color"></span>
			<span class="third" :style="color"></span>
			<span class="fourth" :style="color"></span>
		</span>`,

	props: ['color'],

	ready()
	{
		if (! this.color) {
			this.color = 'white'
		}

		this.color = `background-color: ${this.color};`
	}
})

import App from './components/App.vue';
Router.start(App, '#app');