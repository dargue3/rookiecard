
<template>
	<div>
		<div class="page-wrapper">
		<!-- container for template -->

			<!-- no results for team, show message -->
			<div id="noTeam" v-cloak v-show="!team.id" class="f-el-fill text-center">
				<h3>This team doesn't exist, you could create it <a v-link="{name: 'team', params: {name: 'create'}}">here</a></h3>
				<br>
				<h4>If you think this is an error, try refreshing the page.</h4>
			</div>

			<!-- wrapper div around non-modal content for blurring -->
			<div v-cloak v-show="team.id" class="Team for-blurring">
			

	    	<div class="Team__details">
	 			
				
					<div v-if="team.teamname === 'unhbasketball'">
						<img class="img-thumbnail" width="500" height="500"
									src="https://upload.wikimedia.org/wikipedia/commons/4/4e/Lundholm_Gym,_UNH,_Durham_NH.jpg">
					</div>

					<div v-if="team.teamname === 'unhfootball'">
						<img class="img-thumbnail" width="500" height="500"
									src="http://unhmagazine.unh.edu/w09/images/p18b.jpg">
					</div>

			 
					
					<h1 class="Team__name">{{ team.name }}</h1>
					

					<div class="Team__slogan">
						<span>Home of UNH Wildcats Football</span>
					</div>

					<div class="Team__location">
						<span><i id="teamLocationIcon" class="material-icons no-highlight">place</i>COWELL STADIUM, DURHAM, NH</span>
					</div>
					

					<div class="Team__fans">
						<a @click="toggleFan" v-show="isFan === false" class="btn btn-primary outline">
							JOIN {{ numFans }} OTHER FAN{{numFans > 1 || numFans === 0 ? 'S' : ''}}
						</a>
						<a @click="toggleFan" v-show="isFan === true" class="btn btn-primary">
							YOU AND {{ numFans - 1 }} OTHER{{(numFans - 1) > 1 || numFans === 0 ? 'S' : ''}} ARE FANS
						</a>
						<a v-show="isMember === true" class="btn btn-primary isMember">
							YOUR TEAM HAS {{ numFans }} FAN{{numFans > 1 || numFans === 0 ? 'S' : ''}}
						</a>
					</div>
					

	   
	        <ul class="nav nav-tabs Team__tabs no-highlight">
	          <li :class="[tab === 'calendar' ? 'active' : '']">
	            <a @click="tab = 'calendar'">
	        			<i id="teamCalendarIcon" class="material-icons">date_range</i>CALENDAR
	            </a>
	          </li>
	          <li :class="[tab === 'stats' ? 'active' : '']">
	            <a @click="tab = 'stats'">
	        			<i id="teamStatsIcon" class="material-icons">trending_up</i>STATS
	            </a>
	          </li>
	          <li :class="[tab === 'roster' ? 'active' : '']">
	            <a @click="tab = 'roster'">
	          		<i id="teamRosterIcon" class="material-icons">group</i>ROSTER
	            </a>
	          </li>
	          <li v-if="admin" :class="[tab === 'settings' ? 'active' : '']">
	            <a @click="tab = 'settings'">
	        			<i id="teamEditIcon" class="material-icons">settings</i>SETTINGS
	            </a>
	      	</ul>	
	   
				</div> <!-- end team well -->

				<div>
				  <div class="row">
			      <div class="col-xs-12 Team__calendar"
			      			v-show="tab === 'calendar'">

		        	<rc-calendar :admin="admin" :events="events"></rc-calendar>

			      </div>
			    </div>



			    <div class="row">
			      <div class="col-xs-12 text-center Team__stats" v-show="tab === 'stats'">

			      	<!-- links for switching tabs -->
							<div class="Tab__container">
								<ul class="Tab__list">
						      <li>
						        <a :class="['Tab', statsTab === 'teamRecent' ? 'Tab--active' : '']" 
						        		@click="statsTab = 'teamRecent'">RECENT
						        </a>
						      </li>
						      <li>
						        <a :class="['Tab', statsTab === 'playerSeason' ? 'Tab--active' : '']"
						        		@click="statsTab = 'playerSeason'">PLAYER
						        </a>
						      </li>
						      <li>
						        <a :class="['Tab', statsTab === 'teamSeason' ? 'Tab--active' : '']"
						        		@click="statsTab = 'teamSeason'">SEASON
						        </a>
						      </li>
						    </ul>
							</div>

		        	<rc-stats :type="statsTab" 
		        						:stats="stats" :sport="team.sport"
	        							:players="players" pagination="false" 
	        							:team-cols="teamStatCols":player-cols="playerStatCols">
	        		</rc-stats>
			        	
			      </div>
			    </div>



			    <div class="row">
			      <div class="col-xs-12 Team__roster"
			      			v-show="tab === 'roster'">

			        <rc-roster :players="players" :coaches="coaches" 
			        						:fans="fans" :edit-user.sync="editUser" 
			        						:admin="admin">
			        </rc-roster>		

			      </div>
			    </div>


			     <div class="row">
			      <div class="col-xs-12 col-sm-10 col-sm-offset-1 col-md-8 col-md-offset-2 Team__edit"
			      			v-show="tab === 'settings'">

		        	<h3>Settings</h3>
		        	</hr>

			        	
			      </div>
			    </div>
		    </div>

				
				<div class="row">
					<div class="col-xs-12 Team__feed">
						<div class="row">

							<div class="col-xs-12 Team__feed_divider">
								<div class="divider">
									<div class="divider-text">
										<span class="--twotone">NEWS FEED</span>
									</div>
								</div>
							</div>

						</div>

						<div class="row">
							<div class="col-xs-12">

								<rc-news-feed type="team" :feed="feed" :users="users"></rc-news-feed>

							</div>
						</div>
					</div>
				</div>
				
				<!-- include the footer at bottom -->
				<div class="Footer">
				    <p>® 2016 Rookiecard LLC</p>
				</div>

			</div>
		  <!--  end of blurring wrapper --> 
		  <!-- keep modals below here so the background blurs properly -->



	    <!-- inside here is complex logic handling what happens when an event is 
	    			clicked on from calendar or news feed -->
			<rc-view-event :admin="admin" :events="events" 
											:stats="stats" :team="team" 
											:auth="auth" :players="players"
											:team-cols="teamStatCols" :player-cols="playerStatCols">
			</rc-view-event>



	    <!-- modal window for adding events -->
	    <div class="modal" id="addEventModal" role="dialog" aria-hidden="true">
	      <div class="modal-dialog">
	        <div class="modal-content">
	          <div class="modal-header">
	            <button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>
	            <h3 class="modal-title">Add an Event</h3>
	          </div>
	          <div class="modal-body">
	            <div class="row">
	                 
								<rc-add-event></rc-add-event>

	            </div>
	          </div>
	        </div>
	      </div>
	    </div>



	    <!-- modal for editing a player in the roster -->
			<div class="modal" id="rosterModal" role="dialog" aria-hidden="true">
	      <div class="modal-dialog">
	        <div class="modal-content">
	          <div class="modal-header">
	            <button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>
	            <h3 class="modal-title">{{ editUser.firstname + ' ' + editUser.lastname }}</h3>
	          </div>
	          <div class="modal-body">
	          	<div class="row">
	            
								<rc-edit-user v-if="editUser.id" :user="editUser" :positions="positions"></rc-edit-user>

							</div>
	          </div>
	        </div>
	      </div>
	    </div>




	 <!-- end container for template -->
	  </div>  
	</div>

	

</template>




<script>

import Calendar 	from './Calendar.vue';
import Stats 			from './Stats.vue';
import AddEvent 	from './AddEvent.vue';
import ViewEvent 	from './ViewEvent.vue';
import Roster 		from './Roster.vue';
import NewsFeed 	from './NewsFeed.vue';
import EditUser 	from './EditUser.vue';

export default  {
	
	name: 'Team',

	props: [],

	components: {

		'rc-calendar'		: Calendar,
		'rc-stats'			: Stats,
		'rc-add-event'	: AddEvent,
		'rc-view-event'	: ViewEvent,
		'rc-roster'			: Roster,	
		'rc-news-feed'	: NewsFeed,	
		'rc-edit-user'	: EditUser,	

	},

	route: {
		//reload everything if new route but same component
		canReuse: false,
	},

	data() {

		var prefix = this.$parent.prefix + 'team/';
		var teamname = this.$route.params.name;

		//set new title
		document.title = teamname;

		return {
			prefix: prefix + teamname,
			dataReady: false,
			team: {
				meta: {},
			},
			admin: false,
			auth: {},
			isFan: false,
			isMember: false,
			editUser: {
				firstname: '',
				lastname: '',
				meta: {},
			},
			positions: [],
			teamStatCols: [],
			playerStatCols: [],
			users: [],
			tab: 'roster',
			statsTab: 'teamRecent',
			events: [], 
			stats: [], 
			feed: [],
		}
	},

	created() {

		var self = this;
		var url = this.prefix + '/data';
		this.$http.get(url)
		.then(function(response) {
			self.compile(response.data);	
		})
		//didn't put a catch here because the 'team does not exist' header pretty much covers it
	},

	computed: {

		numFans() {
			return this.fans.length;
		},

		//create list of players from users
		players() {
			return this.users.filter(function(user) {
				return user.role <= 1;
			})
		},

		//create list of coaches from users
		coaches() {
			return this.users.filter(function(user) {
				return user.role === 2;
			})
		},

		//create list of fans from users
		fans() {
			return this.users.filter(function(user) {
				return user.role === 3;
			})
		},

	},

	events: {

		//new stats have been posted from ViewEvent
		newStats(data, entry) {
		
			data.forEach(function(val) {
				this.stats.push(val);
			}.bind(this))
			

			this.$broadcast('updateFeed', entry);
		},

		//updated stats have been posted from ViewEvent
		updateStats(data, event) {

			//first erase all stats for this event
			this.stats = this.stats.filter(function(stat) {
				return stat.event_id !== event.id;
			});

			if(data.length) {
				//there were new stats to add
				data.forEach(function(val) {
					this.stats.push(val);
				}.bind(this));
			}
			//tell Stats.vue to re-compile the stats
			this.$broadcast('updateStats', this.stats);
		},

		//stats have been deleted from ViewEvent
		deleteStats(event) {
			//iterate through all stats, keep the ones not associated with this event
			this.stats = this.stats.filter(function(stat) {
				return stat.event_id !== event.id;
			});

			//tell Stats.vue to re-compile
			this.$broadcast('updateStats', this.stats);
		},




		newEvent(events, entry) {
			this.events = events;

			this.$broadcast('updateFeed', entry);
		},

		updateEvent(updatedEvent, entry) {
			this.events = this.events.filter(function(event) {
				return event.id !== updatedEvent.id;
			}.bind(this));

			this.events.push(updatedEvent);

			if(entry)
				this.$broadcast('updateFeed', entry);
		},

		deleteEvent(deletedEvent, entry) {
			this.events = this.events.filter(function(event) {
				return event.id !== deletedEvent.id;
			}.bind(this));

			if(entry)
				this.$broadcast('updateFeed', entry);
		},

		


		//EditUser.vue was saved with new user data
		updateUser(editedUser) {
	
			this.users = this.users.filter(function(user) {
				return user.id !== editedUser.id
			});

			this.users.push(editedUser);

		},

		//they have confirmed with a popup to kick the user that is being edited
		//remove them from the array and send ajax request to server
		deleteUser(editedUser) {

			this.users = this.users.filter(function(user) {
				return user.id !== editedUser.id
			});
			
			//gonna have to include some logic here about a ghost user taking over their stats
		},

	},
	

	methods: {

		//method for assigning data after ajax call finishes
		compile(data) {
		
			this.auth = data.auth;
			this.team = data.team;

			//loop through all the users, create user objects
			this.formatUsers(data.members);
			
			//store meta data about team
			var meta = JSON.parse(data.team.meta);
			this.positions = meta.positions;
			this.teamStatCols = meta.teamCols;
			this.playerStatCols = meta.playerCols;

			//now that all team data is ready, set these variables
			//components are listening, will format the data as needed
			this.events = data.events;
			this.stats = data.stats;
			this.feed = data.feed;

			//tell App.vue to clear any notifications the logged in user may have
			this.$dispatch('clearNotifications', this.team.id);

			this.dataReady = true;

		},

		//compile meta data for users and push into this.users
		formatUsers(users) {

			this.users = [];

			for(var x = 0; x < users.length; x++) {
				
				var user = users[x];

				if(user.meta)
					user.meta = JSON.parse(user.meta);
				else
					user.meta = {};

				if(user.admin === 1)
					user.admin = true;
				else
					user.admin = false;

				//if logged in user is on list, save some other data about them too
				if(user.id === this.auth.id) {
					this.admin = user.admin;
					this.auth.role = user.role;
					if(user.role < 3) {
						this.isMember = true;
						this.isFan = null;
					}
					if(user.role === 3)
						this.isFan = true;
				}

				this.users.push(user);
			}
		},

		//user hit fan button
		toggleFan() {
			var self = this;

			if(this.isFan) {
				//they were a fan, now they aren't
				this.auth.role = null;
				this.isFan = false;
				this.users = this.users.filter(function(user) {
					return user.id !== self.auth.id;
				});
				var data = {isNowFan: false};
			}

			else if(!this.isFan) {
				//they are now a fan
				this.isFan = true
				this.auth.role = 3;
				this.auth.meta = {};
				this.auth.admin = false;
				this.users.push(this.auth);
				var data = {isNowFan: true};
			}

			else if(this.isMember) {
				//member should never have hit this function
				this.$root.banner('bad', "You are already a member")
				return;
			}

			else {
				//this case shouldn't have happened
				this.$root.banner('bad', "There was an issue with this request, refresh the page and try again");
				return;
			}

			
			var url = this.prefix + '/fan';
			this.$http.post(url, data)
			.then(function(response) {
				if(response.data.success && self.isFan) {
					//tell App.vue to add this team to the nav dropdown
					self.$dispatch('addMember', self.team);
					self.$root.banner('good', "You are now a fan of " + self.team.name);
				}
				else if(response.data.success && !self.isFan) {
					//tell App.vue to remove this team from the nav dropdown
					self.$dispatch('removeMember', self.team.teamname);
					self.$root.banner('good', "You are no longer a fan of " + self.team.name);	
				}
				else
					self.$root.banner('bad', "There was a server problem, refresh the page and try again.");
			})
			.catch(function(response) {
				self.$root.banner('bad', "There was a server problem, refresh the page and try again.");
			});


		},

	},

	ready() {

		$(function() {

			$('div.modal').on('hide.bs.modal', function() {
				$('.for-blurring').addClass('modal-unblur').removeClass('modal-blur');
		    $('nav.navbar').addClass('modal-unblur').removeClass('modal-blur');
			});

		});

	},

};


</script>


<style lang="stylus">

@import '/resources/assets/stylus/variables.styl'

.Team
	flex 1
	
.Team__details
	display flex
	flex-flow row wrap
	justify-content center
	text-align center
	position relative
	margin-bottom 35px
	border none
	box-shadow none
	padding 40px 0 0 0 
	background rc_two_tone
		
.Team__name		
	flex-basis 100%
	
.Team__location		
.Team__slogan
	flex-basis 100%
	margin-top 35px
	span
		position relative
		color rc_dark_gray

.Team__fans
	flex-basis 100%
	margin-top 35px
	a
		margin-left 0
	.isMember
		background rc_blue
		&:hover
			cursor auto
			background rc_blue	
			
.Team__tabs
	display flex
	flex-flow row wrap
	justify-content center
	li
		a
			padding 20px 40px 20px 64px
			@media screen and (max-width xs_max_width) 				
				padding 20px 30px 20px 54px			

.Team__feed
	background rc_two_tone
	margin-top 4em
	&_divider
		margin 65px 0px 105px 0px		



#teamCalendarIcon
	font-size 24px
	position absolute
	left 30px
	bottom 18px
	@media screen and (max-width 767px)
		left 14px

#teamStatsIcon
	font-size 24px
	position absolute
	left 32px
	bottom 19px
	@media screen and (max-width 767px)
		left 15px

#teamRosterIcon
	font-size 24px
	position absolute
	left 32px
	bottom 19px
	@media screen and (max-width 767px)
		left 16px	

#teamEditIcon
	font-size 24px
	position absolute
	left 32px
	bottom 19px
	@media screen and (max-width 767px)
		left 16px		
			
#teamLocationIcon
	position absolute
	left -27px
	top -4px


#noTeam
	margin-top 80px


rc-stats
	padding 2em	







</style>