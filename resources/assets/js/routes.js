var Vue = require('vue');
var VueRouter = require('vue-router');
var VueResource = require('vue-resource');
var VueAutosize = require('vue-autosize');
var VueTouch = require('vue-touch');

Vue.use(VueRouter);
Vue.use(VueResource);
Vue.use(VueAutosize);
Vue.use(VueTouch);

Vue.config.debug = true;


// pull meta data from server out of tags in <head> of main.blade
Vue.http.headers.common['X-CSRF-TOKEN'] = $('#_token').attr('value');


// set up global filters

// turns LeBron James -> L. James
Vue.filter('statsName', function(first, last) {
	return first[0] + '. ' + last;
});

// returns at time string like 11:25 pm
Vue.filter('justTime', function(val) {
	return moment(val * 1000).format('h:mm a');
});


Vue.filter('checkPercentage', function(val) {
	if(val > 100)
		return 'ERROR'
	else return val
});


Vue.filter('formatRepeatString', require('./filters/FormatRepeatString.js'));
Vue.filter('formatTimeString', require('./filters/FormatTimeString.js'));


// import components
import App from './components/App.vue';
import Team from './components/Team.vue';
import CreateTeam from './components/CreateTeam.vue';


// enable router, turn on history mode
var router = new VueRouter({
	history: true,
	transitionOnLoad: true,
});



router.map({

	'/': {
		name: 'home',
		component: {
			template: "<h1 style='margin-top: 80px'>This is the homepage</h1>"
		}
	},



	'/team/create': {
		name: 'createTeam',
		component:  CreateTeam,
	},

	'/team/:name': {
		name: 'team',
		component:  Team,
	},



	'/:name': {
		name: 'user',
		component: {
			template: "<h1 style='margin-top: 80px'>Welcome to your very own rookiecard, {{ $route.params.name}}!</h1>"
		}
	},





	'*': {
		component: {
			template: "<div class='text-center'><h1>Uh oh!</br>Page not found!</h1></div>"
		}
	}


});




router.start(App, '#app');

