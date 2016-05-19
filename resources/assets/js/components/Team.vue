
<template>
	<div>
		<div v-show="requestFinished">
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
					
					<div>
						<img class="img-thumbnail" width="500" height="400" :src="team.pic">
					</div>
					
					
					<h1 class="Team__name">{{ team.name }}</h1>
					

					<div class="Team__slogan">
						<span>&ldquo;{{ team.slogan }}&rdquo;</span>
					</div>

					<div class="Team__location">
						<span>
							<i id="teamLocationIcon" class="material-icons no-highlight">place</i>
							{{ team.homefield + ', ' + team.city }}
						</span>
					</div>
					

					<div class="Team__fans">

						<div class="num-fans">
							<div class="fan-count" :class="numFansClass">
								<!-- for animating a new fan counter, show numFans +- 1 -->
								<span v-if="!fansChanged" :transition="numFansTransition">{{ numFans }}</span>
								<span v-if="fansChanged" :transition="numFansTransition">{{ numFans }}</span>
							</div>
							<div class="arrow-right --white"></div>
						</div>

						<div v-show="!isFan && !isMember" class="fan-icon" @click="toggleFan">
							<img src="/images/becomeFan.png" width="35" height="47" alt="Become a fan" id="becomeFan">
						</div>
						<div v-show="isFan && !admin" class="fan-icon" @click="toggleFan">
							<img src="/images/isFan.png" width="35" height="47"  alt="You're a fan" id="isFan">
						</div>
						<div v-show="isMember || (isFan && admin)" class="fan-icon --member">
							<img src="/images/isFan.png" width="35" height="47"  alt="You're a member">
						</div>
					</div>


					<!-- buttons for joining team, accepting invitation -->
					<div class="Team__invite">
						<a v-show="!isMember && !hasBeenInvited && !hasRequestedToJoin" 
								class="btn btn-primary outline" @click="requestToJoin(true)">REQUEST TO JOIN</a>

						<a v-show="!isMember && !hasBeenInvited && hasRequestedToJoin" 
								class="btn btn-success outline" @click="requestToJoin(false)">CANCEL REQUEST</a>

						<a v-show="!isMember && hasBeenInvited" class="btn btn-success" @click="respondToInv()">ACCEPT INVITATION</a>

						<a v-show="isMember" class="btn btn-success outline --member">YOU'RE A MEMBER</a>
					</div>


	   
	        <ul class="nav nav-tabs Team__tabs no-highlight">
	          <li :class="{'active' : tab === 'calendar'}">
	            <a @click="tab = 'calendar'">
	        			<i id="teamCalendarIcon" class="material-icons">date_range</i>CALENDAR
	            </a>
	          </li>
	          <li :class="{'active' : tab === 'stats'}">
	            <a @click="tab = 'stats'">
	        			<i id="teamStatsIcon" class="material-icons">trending_up</i>STATS
	            </a>
	          </li>
	          <li :class="{'active' : tab === 'roster'}">
	            <a @click="tab = 'roster'">
	          		<i id="teamRosterIcon" class="material-icons">group</i>ROSTER
	            </a>
	          </li>
	          <li v-if="admin" :class="{'active' : tab === 'settings'}">
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
	            <h3 v-show="(editUser.id || editUser.ghost) && !editUser.new" class="modal-title">{{ editUser.firstname + ' ' + editUser.lastname }}</h3>
	            <h3 v-show="editUser.new && editUser.role === 1" class="modal-title">Add a Player</h3>
	            <h3 v-show="editUser.new && editUser.role === 3" class="modal-title">Add a Coach</h3>
	          </div>
	          <div class="modal-body">
	          	<div class="row">
	            
								<rc-edit-user v-if="editUser.id || editUser.new || editUser.ghost" :user="editUser" :positions="positions"></rc-edit-user>

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
			requestFinished: false,
			team: {
				meta: {},
			},
			admin: false,
			auth: {},
			isFan: false,
			isMember: false,
			hasBeenInvited: false,
			hasRequestedToJoin: false,
			isCreator: false,
			editUser: {
				firstname: '',
				lastname: '',
				meta: {},
			},
			positions: [],
			teamStatCols: [],
			playerStatCols: [],
			users: [],
			tab: 'calendar',
			statsTab: 'teamRecent',
			events: [], 
			stats: [], 
			feed: [],
			fansChanged: false,
			numFansTransition: 'number-tick-up',
		}
	},

	created() {

		var self = this;
		var url = this.prefix + '/data';
		this.$http.get(url)
		.then(function(response) {
			self.compile(response.data);	
			setTimeout(function() {
				self.requestFinished = true;
			}, 100);
		})
		//didn't put a catch here because the 'team does not exist' header pretty much covers it
	},

	computed: {

		numFans() {
			return this.fans.length;
		},

		//makes fan counter div wider with larger numFans
		numFansClass() {
			if(this.fans.length >= 1000)
				return '--thousandsOfFans';

			else if(this.fans.length >= 100)
				return '--hundredsOfFans';

			else if(this.fans.length >= 10)
				return '--tensOfFans';

			else
				return '';
		},

		//create list of players from users
		//0 = user player, 1 = ghost player
		players() {
			return this.users.filter(function(user) {
				return user.role === 0 || user.role === 1;
			})
		},

		//create list of coaches from users
		//2 = user coach, 3 = ghost coach
		coaches() {
			return this.users.filter(function(user) {
				return user.role === 2 || user.role === 3;
			})
		},

		//create list of fans from users
		fans() {
			return this.users.filter(function(user) {
				return user.role === 4 || (user.role >= 45 && user.role <= 47);
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

		


		//new user was created from EditUser
		newUser(user) {
			user.meta = JSON.parse(user.meta);
			var split = user.meta.ghost.name.split(' ');
			user.firstname = split[0];
			user.lastname = split[1];
			user.member_id = user.id;
			user.ghost = true;
			delete user.user_id;

			user.pic = '/images/ghost.png';

			this.users.push(user);

		},

		//user was updated from EditUser
		updateUser(editedUser) {
	
			this.users = this.users.filter(function(user) {
				return user.member_id !== editedUser.member_id
			});

			if(editedUser.ghost) {
				//if ghost user, set name data just in case edited
				var split = editedUser.meta.ghost.name.split(' ');
				editedUser.firstname = split[0];
				editedUser.lastname = split[1];
			}

			this.users.push(editedUser);

		},


		//user was kicked from team from EditUser
		deleteUser(editedUser) {	

			if(!editedUser.ghost) {
				//if player was a real user, turn into ghost
				editedUser.ghost = true;
				editedUser.admin = false;
				delete editedUser.gender;
				editedUser.role = editedUser.role + 1;
				editedUser.meta.ghost = {
					id: editedUser.member_id,
					name: editedUser.firstname + ' ' + editedUser.lastname,
					email: null
				};
				editedUser.pic = '/images/ghost.png';

				var deleteUser = false;

			}

			else {
				var deleteUser = true;
			}

			//tell server about new changes
			var data = {
				delete: deleteUser,
				editedUser: editedUser
			};
			var self = this;
			this.$http.delete(this.prefix + '/user', data)
				.then(function(response) {

					if(!response.data.ok) {
						self.$root.banner('bad', response.data.error);
						return;
					}

					//remove current version of user from users
					self.users = self.users.filter(function(user) {
						return user.member_id !== editedUser.member_id
					});

					if(deleteUser) {
						//if they're completely gone, remove their stats from current stats
						self.stats = self.stats.filter(function(stat) {
							return stat.member_id !== editedUser.member_id;
						});
						self.$root.banner('good', "Ghost deleted");
					}
					else {
						//add this edited version
						editedUser.id = 0;
						self.users.push(editedUser);
						self.$root.banner('good', 'User kicked');
					}
				})
				
				.catch(function() {
					self.$root.errorMsg();
				});	
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
			this.teamStatCols = meta.stats.teamCols;
			this.playerStatCols = meta.stats.playerCols;
			this.team.slogan = meta.slogan;
			this.team.homefield = meta.homefield;
			this.team.city = meta.city;

			//now that all team data is ready, set these variables
			//components are listening, will format the data as needed
			this.events = data.events;
			this.stats = data.stats;
			this.feed = data.feed;
			this.positions = data.positions;

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

				//mark which user is the creator
				if(this.team.creator_id === user.id)
					user.creator = true;

				if(user.meta.ghost) {
					//user is a ghost player, move their data around to be consistent with real players
					var split = user.meta.ghost.name.split(' ');
					user.firstname = split[0];
					user.lastname = split[1];
					user.id = 0;
					user.ghost = true;
					user.pic = '/images/ghost.png';
				}
				else
					user.ghost = false;

				//if logged in user is on list, save some other data about them too
				if(user.id === this.auth.id) {
					this.admin = user.admin;
					this.auth.role = user.role;

					//note whether or not this user is the creator
					if(this.team.creator_id == user.id) {
						this.isCreator = true;
						this.isMember = true;
					}

					if(user.role <= 3) {
						this.isMember = true;
					}
					//they're a fan if role is 4
					if(user.role === 4)
						this.isFan = true;

					//they've been invited to join if a 5 or 6
					if(user.role === 5 || user.role === 6)
						this.hasBeenInvited = true;			
					else if(user.role === 45 || user.role === 46) {
						this.hasBeenInvited = true;
						this.isFan = true;
					}

					//they've requested to join team if role is 7 or 47
					if(user.role === 7)
						this.hasRequestedToJoin = true;
					else if(user.role === 47) {
						this.hasRequestedToJoin = true;
						this.isFan = true;
					}
				}

				this.users.push(user);
			}
		},

		//user hit fan button
		toggleFan() {

			if(this.isMember) {
				//member should never have hit this function
				this.$root.errorMsg();
				return;
			}

			var self = this;
			var url = this.prefix + '/fan';
			this.$http.post(url)
				.then(function(response) {
					if(response.data.ok) 
						self.updateFanStatus();
					else
						self.$root.errorMsg();
				})
				.catch(function() {
					self.$root.errorMsg();
				});

		},

		//successful request, change fan status
		updateFanStatus() {
			var self = this;

			if(this.isFan) {
				//use decrement animation on counter
				this.numFansTransition = 'number-tick-down'
			}
			else {
				//increment
				this.numFansTransition = 'number-tick-up'
			}

			//swap the fan status
			this.isFan = !this.isFan;
			this.fansChanged = !this.fansChanged;

			if(this.isFan) {
				//is now a fan of this team
				this.auth.role = 4;
				this.auth.meta = {};
				this.auth.admin = false;
				this.admin = false;
				this.users.push(this.auth);

				//tell App.vue to add this team to the nav dropdown
				this.$dispatch('addMember', this.team);
				this.$root.banner('good', "You're now a fan");
			}


			else {
				//is no longer a fan
				this.auth.role = null;
				this.admin = false;
				this.users = this.users.filter(function(user) {
					return user.id !== self.auth.id;
				});

				self.$dispatch('removeMember', self.team.teamname);
				self.$root.banner('good', "You're no longer a fan");	
			}
		},


		//the player wants to send a request to join this team
		requestToJoin(joinOrCancel) {
			var self = this;
			var url = this.prefix + '/join';
			this.$http.post(url)
				.then(function(response) {
					if(!response.data.ok) {
						self.$root.banner('bad', response.data.error);
						return;
					}

					self.hasRequestedToJoin = joinOrCancel;
					self.$root.banner('good', "Request sent to team admin");
				})
				.catch(function() {
					self.$root.errorMsg();
				});
		},

		//they were invited, make them a for-real member now
		respondToInv(outcome) {
			var self = this;

			//check if their choice is confirmed
			if(outcome === true || outcome === false) {
				var url = this.prefix + '/join';
				data = {accept: outcome};
				this.$http.post(url, data)
					.then(function(response) {
						//check there were no authorization errors
						if(!response.data.ok) {
							self.$root.banner('bad', response.data.error);
							return;
						}
						self.hasBeenInvited = false;

						if(outcome) {
							//add them to the team
							self.formatUsers(response.data.users);
							self.$root.banner('good', "You've joined this team");
						}
						else
							self.$root.banner('good', "Invitation denied");
					})
					.catch(function() {
						self.$root.errorMsg();
					});
			}

			//otherwise make popup to confirm their decision
			
			if(this.auth.role === 5) var role = 'player.';
			if(this.auth.role === 6) var role = 'coach.';
			var text = "You've been invited to join this team as a " + role;
			swal({   
				title: 'Respond to Invitation',
				text: text,
				type: "info",
				showCancelButton: true,
				confirmButtonColor: '#1179C9',
				cancelButtonColor: 'whitesmoke',
				confirmButtonText: 'JOIN',
				cancelButtonText: 'NO THANKS',
				closeOnConfirm: true
			}, function(confirm) {
				if(confirm) {
					self.respondToInv(true);
				}
				else {
					self.respondToInv(false);
				}
			});
		},


	}, //end methods

	ready() {

		$(function() {

			$('div.modal').on('hide.bs.modal', function() {
				$('.for-blurring').addClass('modal-unblur').removeClass('modal-blur');
		    $('nav.navbar').addClass('modal-unblur').removeClass('modal-blur');
			});

			$('#becomeFan').on('mouseover', function() {
				$(this).attr('src', '/images/becomeFanHover.png');
			});
			$('#becomeFan').on('mouseout', function() {
				$(this).attr('src', '/images/becomeFan.png');
			});

			$('#isFan').on('mouseover', function() {
				$(this).attr('src', '/images/isFanHover.png');
			});
			$('#isFan').on('mouseout', function() {
				$(this).attr('src', '/images/isFan.png');
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
	margin-top 25px
	font-size 17px
	span
		position relative
		color rc_dark_gray

.Team__fans
	flex-basis 100%
	display flex
	flex-flow row wrap
	justify-content center
	align-items center
	margin-top 25px
	.num-fans
		position relative
		display flex
		flex-flow row
		margin-bottom 5px
		overflow hidden
		height 40px
		width 70px
		.fan-count
			display flex
			flex-flow row
			justify-content center
			align-items center
			background-color white
			min-width 61px
			height 40px
			font-size 17px	
			border-radius 15%
			color rc_dark_gray
			span
				position absolute
				top 8px	
				right 33px
			&.--tensOfFans
				span
					right 30px
			&.--hundredsOfFans
				span
					right 24px
			&.--thousandsOfFans
				span
					right 19px			
		.arrow-right
			position absolute
			top 5px
			right 4px
			margin-top 9px
			height 0
			width 0
			border-bottom 6px solid transparent		
			border-top 6px solid transparent
			border-left 6px solid white
	.fan-icon
		margin-left 2px
		&:hover
			cursor pointer
		&.--member:hover
			cursor default
			
.Team__invite
	flex-basis 100%		
	margin-top 25px
	.btn
		margin-left 0px
		&.--member:hover
			cursor default
			color rc_bright_green
			border 2px solid rc_bright_green
		
			
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
		
.Team__stats
	padding 0 2em



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
	top -3px


#noTeam
	margin-top 80px


rc-stats
	padding 2em	







</style>