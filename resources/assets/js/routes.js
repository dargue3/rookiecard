// packages pulled from npm
export var Vue = require('vue');
var VueRouter = require('vue-router');

Vue.use(VueRouter);

// enable router, turn on history mode
export var Router = new VueRouter({
	history: true,
	transitionOnLoad: true,
});

// before each new route, scroll the page to the top 
// delay it such that the scroll is during the blank loading screen
Router.beforeEach(function(transition) {
	setTimeout(function() {
		window.scroll(0, 0);
	}, 400);
	transition.next();
});


// components used during these routes 
import Team from './components/Team/Team.vue';
import User from './components/User/User.vue';
import CreateTeam from './components/Team/CreateTeam.vue';
import Feedback from './components/Options/Feedback.vue';


// define the routes 
Router.map({

	'/':
	{
		name: 'home',
		component:
		{
			template: "<h1 style='margin-top: 80px; margin-left: 80px;'>This is the homepage</h1>"
		}
	},

	'/options/feedback':
	{
		name: 'feedback',
		component: Feedback
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
		component: User,
	},


	'*': {
		component: {
			template: "<div class='text-center'><h1>Uh oh!</br>Page not found!</h1></div>"
		}
	}
});