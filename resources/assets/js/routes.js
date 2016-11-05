var Vue = require('vue');
var VueRouter = require('vue-router');
var VueResource = require('vue-resource');
var VueAutosize = require('vue-autosize');
var VueTouch = require('vue-touch');
var SmoothScroll = require('smoothscroll-polyfill');

Vue.use(VueRouter);
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


// import components
import App from './components/App.vue';
import Team from './components/Team.vue';
import CreateTeam from './components/CreateTeam.vue';


// enable router, turn on history mode
var router = new VueRouter({
	history: true,
	transitionOnLoad: true,
});

// before each new route, scroll the page to the top 
// (but delay it so that the scroll is during the loading white screen)
router.beforeEach(function(transition) {
	setTimeout(function() {
		window.scroll(0, 0);
	}, 400);
	transition.next();
});

router.map({

	'/':
	{
		name: 'home',
		component:
		{
			template: "<h1 style='margin-top: 80px'>This is the homepage</h1>"
		}
	},


	'/team/create':
	{
		component:  CreateTeam,
	},


	'/team/:name':
	{
		name: 'team',
		component:  Team,
		subRoutes: {
			'/event/:event_id': {
				component: Team,
			},
		},
	},


	'/:name':
	{
		name: 'user',
		component:
		{
			template: "<h1 style='margin-top: 80px'>Welcome to your very own rookiecard, {{ $route.params.name }}!</h1>"
		}
	},


	'*': {
		component: {
			template: "<div class='text-center'><h1>Uh oh!</br>Page not found!</h1></div>"
		}
	}


});




router.start(App, '#app');

