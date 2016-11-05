
<template>

	<div id="app-wrapper" :class="{'toggled' : toggleSidebar}">

		<div id="app-content">

		<rc-nav :user="user" :member="memberOf" :toggle.sync="toggleSidebar"
						:invited="invitedTo" :fan="fanOf"></rc-nav>

		

		<rc-alert :show="alert" transition="fade-slow"></rc-alert>

		<router-view id="router" transition="fade-slow" transition-mode="out-in" class="router"></router-view>

		</div>

	</div>
	
</template>




<script>

import Alert from './Alert.vue'
import Requests from '../mixins/Requests.js'
import Nav from './Nav.vue'

export default  {

	name: 'App',

	props: [],

	mixins: [Requests],

	components: {
		'rc-alert' 	: Alert,
		'rc-nav'		: Nav,
	},

	data() {

		return {
			prefix: '/api/v1/',
			user: {},
			teams: [],
			alert: false,
			toggleSidebar: true,
		}
	},

	created()
	{
		// get logged-in user data
		var url = this.prefix + 'user/auth';

		var self = this;
		this.$http.get(url)
			.then(function(response) {
				if (! response.data.ok) {
					throw response.data.error;
				}

				self.$emit('App_data', response);
				
			})
			.catch(function(error) {
				self.errorMsg(error);
			});
	},

	events: {

		App_data(response)
		{
			this.user = response.data.user;
			this.teams = response.data.teams;
		},


		// event from Team.vue telling App to clear notifications for that team
		clearNotifications(id)
		{
			var updated = false;
			var self = this;

			this.teams = this.teams.filter(function(team) {
				if(team.id === id && team.notifications > 0) {
					updated = true;
					team.notifications = 0;
				}
				return team;
			});

			if(updated) {
				// notifications were cleared for this team, send ajax request to save to server
				var url = this.prefix + 'user/auth/team/' + id;
				this.$http.post(url);
			}
		},

		/**
		 * User became a fan of a given team, add them to the nav menus
		 */
		App_becameAFan(team)
		{
			var newTeam = {
				id: team.id,
				teamname: team.teamname,
				name: team.name,
				notifications: 0,
				isMember: false,
				isFan: true,
				hasBeenInvited: false,
			}

			this.teams.push(newTeam);
		},

		
		/**
		 * Remove given team from nav menus
		 */
		App_notAFan(team)
		{
			this.teams = this.teams.filter(function(current) {
				return current.teamname !== team.teamname;
			})
		},


		/**
		 * Remove a given team from nav menus
		 */
		App_notInvited(team)
		{
			this.teams = this.teams.filter(function(current) {
				return current.teamname !== team.teamname;
			})
		}


	},

	computed:
	{
		// which teams they are a member of
		memberOf()
		{
			return this.teams.filter(function(team) {
				return team.isMember;
			});
		},

		// which teams they are a fan of
		fanOf()
		{
			return this.teams.filter(function(team) {
				return team.isFan;
			});
		},

		// which teams an admin has invited them to join
		invitedTo()
		{
			return this.teams.filter(function(team) {
				return team.hasBeenInvited;
			});
		}
	},

	methods:
	{
		/**
		 * Show a sweetalert popup message
		 *
		 * @param {string} type  Possible: 'good', 'bad', 'info'
		 * @param {string} title  
		 * @param {string} msg  
		 */
		popup(type, title, msg)
		{
			switch(type) {
				case 'good':
					swal(title, msg, "success");
					break;
				case 'bad':
					swal(title, msg, "error");
					break;
				case 'info':
					swal(title, msg, "info");
					break;
			}
		},

		
		/**
		 * Show a banner message using Alert component
		 *
		 * @param {string} type  	Possible: 'good', 'bad', 'info'
		 * @param {string} msg 		The message to display
		 * @param {string} link 	Link to route to if the user clicks the alert
		 */
		banner(type, msg, link = '')
		{
			// always hide any existing alerts
			this.alert = false;

			// give some timeout so there's a noticeable gap between old and new alerts
			var self = this;
			setTimeout(function() {
				self.alert = true;
				self.$broadcast('Alert_display', type, msg, link);
			}, 400);
		},


		/**
		 * Display a given error message or a default one
		 * 
		 * @param {string | null} msg
		 */
		errorMsg(msg = null)
		{
			if (typeof msg === 'string') {
				this.banner('bad', msg);
			}
			else {
				this.banner('bad', 'There was a problem, refresh the page and try again');
			}
		},


		/**
		 * Set the URL in the bar but don't change the state at all
		 * 
		 * @param {string}  url 	The full URL to set the current URL address to
		 * @param {object} data 	Any data to store in the current state history
		 */
		url(url, data = {})
		{
			window.history.replaceState(data, '', url);
		},


		/**
		 * Show a bootstrap modal with a given id
		 *
		 * @param {string} id
		 */
		showModal(id)
		{
			$('.for-blurring').removeClass('modal-unblur').addClass('modal-blur');
    	$('nav.navbar').removeClass('modal-unblur').addClass('modal-blur');
    	$('#' + id).modal('show');
		},


		unblur()
		{
			let self = this;
			$(function() {

				// remove blurring
				// if user had a modal open then clicked 'back' on browser, blur persists
				$('div.modal').modal('hide');
				$('.for-blurring').addClass('modal-unblur').removeClass('modal-blur');
		    $('nav.navbar').addClass('modal-unblur').removeClass('modal-blur');


				$('div.modal').on('hide.bs.modal', function() {
					$('.for-blurring').addClass('modal-unblur').removeClass('modal-blur');
			    $('nav.navbar').addClass('modal-unblur').removeClass('modal-blur');
			    self.$broadcast('App_modal_minimized');
				});
		
		});
		}

	}, // end methods

	ready()
	{
		
		/*
		// job offer
		console.log("%cI like your style! email me and I might hire you...  dan@rookiecard.com", "color: black; font-size: large;")
		*/
	
		this.unblur();
	}
};


</script>




<style lang="stylus">

@import '/resources/assets/stylus/variables.styl'


.router
	margin-top 50px
	min-height 100%
	position relative


</style>