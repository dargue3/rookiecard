
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
			

	    	<div class="Team__details" :style="team.backdrop">
					
					<div class="Team__pic">
						<img width="250" height="250" :src="team.pic">
					</div>
					
					<div class="black-container">
						
						<div class="filler"></div>						

						<div class="Team__info__tabs">

							<div class="filler"></div>
							
							<div class="Team__info">
								<div class="Team__text">
									<h1 class="Team__name">{{ team.name }}</h1>
									<div class="Team__slogan">
										<i>{{ team.slogan }}</i>
									</div>
									<div class="Team__location">
										<span>
											<i class="material-icons no-highlight">place</i>
											{{ team.homefield + ', ' + team.city }}
										</span>
									</div>	
								</div>

								<div class="Team__fans">
									<div class="Team__join_buttons">
										<!-- buttons for joining team, accepting invitation -->
										<div class="Team__invite">
											<a v-show="showRequestToJoin" 
													class="btn btn-primary" @click="requestToJoin('join')">REQUEST TO JOIN</a>

											<a v-show="showCancelRequest" 
													class="btn btn-delete" @click="requestToJoin('cancel')">CANCEL REQUEST</a>

											<a v-show="showRespondToInvitation" class="btn btn-success" @click="respondToInv()">RESPOND TO INVITATION</a>

											<a v-show="showYoureAMember" class="btn btn-success --member">YOU'RE A MEMBER</a>
										</div>
									</div>
									<div class="num-fans">
										<div class="fan-count" :class="numFansClass">
											<!-- for animating a new fan counter, show numFans +- 1 -->
											<span v-if="!fansChanged" :transition="numFansTransition">{{ numFans }}</span>
											<span v-if="fansChanged" :transition="numFansTransition">{{ numFans }}</span>
										</div>
										<div class="arrow-right --white"></div>
									</div>

									<div v-show="showRemoveFan" class="fan-icon" @click="toggleFan">
										<img src="/images/becomeFan.png" width="35" height="47" alt="Become a fan" id="becomeFan">
									</div>
									<div v-show="showBecomeFan" class="fan-icon" @click="toggleFan">
										<img src="/images/isFan.png" width="35" height="47"  alt="You're a fan" id="isFan">
									</div>
									<div v-show="showIsFan" class="fan-icon --member">
										<img src="/images/isFan.png" width="35" height="47"  alt="You're a member">
									</div>
								</div> <!-- end  Team__fans -->
								
							</div>

							<div class="Team__tabs">
								<div class="tab" :class="{'--active' : tab === 'calendar'}"
											@click="tab = 'calendar'">
									<div class="tab-box"></div>
									<a id="calendarTab">
		        				<i class="material-icons">date_range</i>CALENDAR
			            </a>			
								</div>
								<div class="tab" :class="{'--active' : tab === 'stats'}"
											@click="tab = 'stats'">
									<div class="tab-box"></div>
									<a id="statsTab">
		        				<i class="material-icons">trending_up</i>STATS
			            </a>	
								</div>
								<div class="tab" :class="{'--active' : tab === 'roster'}"
											@click="tab = 'roster'">
									<div class="tab-box"></div>
									<a id="rosterTab">
		        				<i class="material-icons">group</i>ROSTER
			            </a>	
								</div>
								<div v-show="admin" class="tab" :class="{'--active' : tab === 'settings'}"
											@click="tab = 'settings'">
									<div class="tab-box"></div>
									<a id="settingsTab">
		        				<i class="material-icons">settings</i>SETTINGS
			            </a>	
								</div>
							</div>	
						</div>
					</div>
				</div> <!-- end team well -->



				
				<div> <!-- begin calendar/roster/stats/newsfeed container -->


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
			if(response.data.ok) {
				self.compile(response.data.data);	
				setTimeout(function() {
					self.requestFinished = true;
				}, 100);
			}
			else
				throw response.data.error
		})
		.catch(function(error) {
			console.log(error);
			self.$root.errorMsg(error);
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

		//the following three functions pick which of the fan icons to display
		showRemoveFan() {
			return !this.isFan && !this.isMember;
		},
		showBecomeFan() {
			return this.isFan && !this.admin;
		},
		showIsFan() {
			//this icon is unclickable
			return this.isMember || (this.isFan && this.admin)
		},


		//the following four functions pick which of the membership buttons to display
		showYoureAMember() {
			return this.isMember || this.isCreator;
		},
		showRequestToJoin() {
			return !this.hasRequestedToJoin && !this.hasBeenInvited && !this.isMember && !this.isCreator;
		},
		showCancelRequest() {
			return this.hasRequestedToJoin;
		},
		showRespondToInvitation() {
			return this.hasBeenInvited;
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

			var self = this;
			data.forEach(function(val) {
				self.stats.push(val);
			});
		
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

			//format raw data and add to array of users
			this.formatUsers(user);

		},

		//user was updated from EditUser
		updateUser(editedUser) {
	
			//remove current version of this user
			this.users = this.users.filter(function(user) {
				return user.member_id !== editedUser.member_id
			});

			//format raw data and add to array of users
			this.formatUsers(editedUser);
		},


		//user was kicked from team from EditUser
		deleteUser(editedUser) {	

			//remove current version of user from users
			this.users = this.users.filter(function(user) {
				return user.member_id !== editedUser.member_id
			});

			if(!editedUser.deleted) {
				//if there's a ghost remaining, format raw data and add to array of users
				this.formatUsers(editedUser);
			}
		}
	},
	

	methods: {

		//method for assigning data after ajax call finishes
		compile(data) {
		
			this.auth = data.auth;
			this.team = data.team;

			//loop through all the users, create user objects
			this.users = [];
			this.formatUsers(data.members);
			
			//store meta data about team
			var meta = JSON.parse(data.team.meta);		
			this.teamStatCols = meta.stats.teamCols;
			this.playerStatCols = meta.stats.playerCols;
			this.team.slogan = meta.slogan;
			this.team.homefield = meta.homefield;
			this.team.city = meta.city;

			//format the backdrop image as a style tag 
			this.team.backdrop = "background-image: url('" + this.team.backdrop + "');";

			//note whether or not this user is the creator
			if(this.team.creator_id == this.auth.id) {
				this.isCreator = true;
				this.admin = true;
			}

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

			if(!users) {
				//its possible there is a 'null' here 
				return;
			}

			if(!Array.isArray(users))
				users = [users];

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

			var self = this;
			var url = this.prefix + '/fan';
			this.$http.post(url)
				.then(function(response) {
					if(response.data.ok) 
						self.updateFanStatus();
					else
						throw response.data.error
				})
				.catch(function(error) {
					self.$root.errorMsg(error);
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
				this.$dispatch('becameAFanOfTeam', this.team);
				this.$root.banner('good', "You're now a fan");
			}


			else {
				//is no longer a fan
				this.auth.role = null;
				this.admin = false;
				this.users = this.users.filter(function(user) {
					return user.id !== self.auth.id;
				});

				self.$dispatch('removedAsFanOfTeam', self.team.teamname);
				self.$root.banner('good', "You're no longer a fan");	
			}
		},



		//the player wants to send a request to join this team
		requestToJoin(action) {
			var self = this;
			var url = this.prefix + '/join';
			this.$http.post(url)
				.then(function(response) {
					if(!response.data.ok)
						throw response.data.error;

					if(action === 'join') {
						self.hasRequestedToJoin = true;
						self.$root.banner('good', "Request sent to team admin");
					}
					else if(action === 'cancel') {
						self.hasRequestedToJoin = false
						self.$root.banner('good', "Request cancelled");
					}
				})
				.catch(function(error) {
					self.$root.errorMsg(error);
				});
		},




		//they were invited, make them a for-real member now
		respondToInv(outcome) {
			var self = this;
			//first they should confirm whether they want to accept the invite or not
			//only do this if 'outcome' isn't a boolean yet (vue makes it random event data on-click)
			if(typeof outcome !== 'boolean') {
				if(this.auth.role === 5 || this.auth.role === 45) var role = 'player.';
				if(this.auth.role === 6 || this.auth.role === 46) var role = 'coach.';
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
					//call this function with boolean response
					if(confirm) {
						self.respondToInv(true);
					}
					else {
						self.respondToInv(false);
					}
				});

				//they will be back after confirming
				return;
			}

			var url = this.prefix + '/join';
			data = { accept: outcome };
			this.$http.post(url, data)
				.then(function(response) {
					//check there were no authorization errors
					if(!response.data.ok) {
						throw response.data.error;
					}

					self.hasBeenInvited = false;

					if(outcome) {
						//add them to the team
						self.formatUsers(response.data.users);
						self.$root.banner('good', "You've joined this team");
						self.isFan = false;
					}
					else {
						self.$root.banner('good', "Invitation denied");
					}
				})
				.catch(function(error) {
					self.$root.errorMsg(error);
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
	flex-flow column
	margin-bottom 35px
	padding 110px 0 0 0px 
	background-size cover
	background-attachment fixed
	//background-image url()

.Team__pic
	flex 1
	padding-left 40px
	max-width 290px
	transform translate(0, 125px)
	img
		border-radius 50%
		border 3px solid white
		
.black-container
	display flex
	flex-flow row
	background rgba(0,0,0,0.70)
	.filler
		flex 1
	
.Team__info__tabs
	display flex
	flex-flow column
	justify-content flex-start
	flex 3
	padding 0
	
.Team__info
	display flex
	flex-flow row
	
.Team__text
	flex 1
	display flex
	flex-flow column wrap
	color white

.Team__tabs
	display flex
	flex-flow row
	
.Team__name		
	flex-basis 1
	font-size 42px
	
.Team__location
	padding-left 22px
	flex-basis 1
	margin-top 15px
	font-size 16px
	span
		position relative
	.material-icons
		position absolute
		font-size 21px
		left -27px
		top -2px
		
.Team__slogan
	flex-basis 1
	margin-top 15px
	font-size 16px

.Team__fans
	flex 1
	display flex
	flex-flow row
	align-items flex-end
	margin-top 20px
	.num-fans
		position relative
		display flex
		flex-flow row
		overflow hidden
		height 44px
		width 70px
		.fan-count
			display flex
			flex-flow row
			justify-content center
			align-items center
			background-color white
			min-width 61px
			height 44px
			font-size 17px	
			border-radius 10%
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
	background white
	border-radius 5px
	margin-right 15px
	a.btn.outline
	a.btn
		border 0
		margin 0
		&:hover
			border 0
		&.--member:hover
			cursor default
			color white
			background-color rc_bright_green
		
			
.Team__tabs
	margin-top 25px
	height 45px
	padding 0
	overflow visible
	.tab
		width 200px
		position relative
		height 45px
		float left
		overflow hidden
		margin 0 -15px 0 0
		.tab-box
			height 53px
			background #CCC
			border-radius 6px
			border 1px solid rc_lite_gray
			border-bottom 9px solid rc_lite_gray
			margin 0 7px 0
			box-shadow 0 0 2px white inset
			transform perspective(100px) rotateX(23deg)
			transition background 0.3s, border-bottom 0.05s
		a
			color link_blue
			transition color 0.3s
		&:hover
			cursor pointer
			.tab-box
				background white
				transition background 0.3s
			a
				color link_blue_hover
				transition color 0.3s
		&.--active
			z-index 40
			position relative
			padding-bottom 1px
			.tab-box
				background-color whitesmoke
				border-bottom 0
				transition border-bottom 0.05s
				box-shadow 0 0 2px white inset
			a
			&:hover
				cursor default
				color black
					
				

.Team__feed
	background rc_two_tone
	margin-top 4em
	&_divider
		margin 65px 0px 105px 0px		
		
.Team__stats
	padding 0 2em

#calendarTab
	position absolute
	top 17px
	left 69px
	i
		position absolute
		font-size 24px
		left -28px
		top -3px

#statsTab
	position absolute
	top 17px
	left 84px
	i
		position absolute
		font-size 24px
		left -28px
		top -3px
		
#rosterTab
	position absolute
	top 17px
	left 81px
	i
		position absolute
		font-size 24px
		left -28px
		top -3px
		
#settingsTab
	position absolute
	top 15px
	left 74px
	i
		position absolute
		font-size 24px
		left -28px
		top -3px						



#noTeam
	margin-top 80px


rc-stats
	padding 2em	







</style>