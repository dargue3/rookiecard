<template>
	<div>
		<div v-show="requestFinished">
		<!-- container for template -->

			<!-- no results for team, show message -->
			<div id="noTeam" v-cloak v-show="notFound" class="f-el-fill text-center">
				<h3>This team doesn't exist, you could create it <a v-link="{name: 'team', params: {name: 'create'}}">here</a></h3>
				<br>
				<h4>If you think this is an error, try refreshing the page.</h4>
			</div>

			<!-- wrapper div around non-modal content for blurring -->
			<div v-cloak v-else class="Team for-blurring">
			

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
											<span v-if="team.homefield">{{ team.homefield  + ', '}}</span>
											<span>{{ team.city }}</span>
										</span>
									</div>	
								</div>

								<div class="Team__buttons">
									<div class="btn-counter --members">
										<template v-if="! isMember">
											<span v-show="hasBeenInvited" class="btn-text --icon --green" @click="join('accept')">
												<i class="material-icons">drafts</i><span>ACCEPT INVITE</span>
											</span>
											<span v-show="hasRequestedToJoin" class="btn-text --icon --red" @click="join('cancel')">
												<i class="material-icons">clear</i><span>CANCEL</span>
											</span>
											<span v-show="! hasBeenInvited && ! hasRequestedToJoin" class="btn-text --icon --blue" @click="join('request')">
												<i class="material-icons">person_add</i><span>ASK TO JOIN</span>
											</span>
										</template>
										<span v-else class="btn-text --icon --not-a-button">
											<i class="material-icons">grade</i><span>MEMBERS</span>
										</span>
										<span class="btn-count">
											<span>{{ players.length + coaches.length }}</span>
										</span>
									</div>

									<div class="btn-counter --fans">
										<template v-if="! isMember">
											<span v-show="! isFan" class="btn-text --icon --blue" @click="toggleFan">
												<i class="material-icons">favorite</i><span>FAN</span>
											</span>
											<span v-show="isFan" class="btn-text --icon --blue" @click="toggleFan">
												<i class="material-icons">favorite_border</i><span>UNFAN</span>
											</span>
										</template>
										<span v-else class="btn-text --icon --not-a-button">
											<i class="material-icons">favorite</i><span>FANS</span>
										</span>
										<span class="btn-count" v-touch:tap="$root.showModal('fansModal')">
											<span>{{ fans.length }}</span>
										</span>
									</div>
								</div> <!-- end  Team__buttons -->
								
							</div> <!-- end Team__info -->

							<div class="Team__tabs">
								<div class="tab" :class="{'--active' : tab === 'calendar'}" @click="tab = 'calendar'">
									<a>CALENDAR</a>			
								</div>
								<div class="tab" :class="{'--active' : tab === 'stats'}" @click="tab = 'stats'">
									<a>STATS</a>	
								</div>
								<div class="tab" :class="{'--active' : tab === 'roster'}" @click="tab = 'roster'">
									<a>ROSTER</a>	
								</div>
								<div v-show="isAdmin" class="tab" :class="{'--active' : tab === 'settings'}" @click="tab = 'settings'">
									<a>SETTINGS</a>	
								</div>
							</div>	
						</div>
					</div>
				</div> <!-- end team well -->



				
				<div> <!-- begin calendar/roster/stats/newsfeed container -->


				  <div class="row">
			      <div class="col-xs-12 Team__calendar"
			      			v-show="tab === 'calendar'">

		        	<rc-calendar :admin="isAdmin" :events="events"></rc-calendar>

			      </div>
			    </div>



			    <div class="row">
			      <div class="col-xs-12 text-center Team__stats" v-show="tab === 'stats'">

			      	<div class="TabButton">
								<div class="first" :class="{'active' : statsTab === 'teamRecent'}" v-touch:tap="statsTab = 'teamRecent'">
									<span>Recent</span>
								</div>
								<div class="second" :class="{'active' : statsTab === 'playerSeason'}" v-touch:tap="statsTab = 'playerSeason'">
									<span>Players</span>
								</div>
								<div class="third" :class="{'active' : statsTab === 'teamSeason'}" v-touch:tap="statsTab = 'teamSeason'">
									<span>Season</span>
								</div>
							</div>

							<div v-show="statsTab === 'teamRecent'">
								<rc-stats v-if="stats.length" type="teamRecent" :stat-keys="team.settings.statKeys" :sport="team.sport"
													:raw-stats="stats" :players="players" :raw-team-stats.sync="rawTeamStats">
		        		</rc-stats>
		        		<div v-else class="text-center">
									<h4>No stats yet...</h4>
								</div>
							</div>


							<div v-show="statsTab === 'playerSeason'">
								<div v-show="stats.length" class="TabButton --just-two --small">
									<div class="first" :class="{'active' : showStatTotals === true}" v-touch:tap="showStatTotals = true">
										<span>Totals</span>
									</div>
									<div class="second" :class="{'active' : showStatTotals === false}" v-touch:tap="showStatTotals = false">
										<span>Averages</span>
									</div>
									<input type="text" class="form-control --white" placeholder="Search by name..." v-model="statFilterKey">
								</div>
									
			        	<rc-stats v-if="stats.length" type="playerSeason" :stat-keys="team.settings.statKeys" :total="showStatTotals" 
			        						:sport="team.sport" :raw-stats="stats" :players="players" :filter-key="statFilterKey">
		        		</rc-stats>
		        		<div v-else class="text-center">
									<h4>No stats yet...</h4>
								</div>
		        	</div>
							

							<div v-show="statsTab === 'teamSeason'">
								<div v-show="stats.length" class="TabButton --just-two --small">
									<div class="first" :class="{'active' : showStatTotals === true}" v-touch:tap="showStatTotals = true">
										<span>Totals</span>
									</div>
									<div class="second" :class="{'active' : showStatTotals === false}" v-touch:tap="showStatTotals = false">
										<span>Averages</span>
									</div>
								</div>
			        	<rc-stats v-if="stats.length" type="teamSeason" :stat-keys="team.settings.statKeys" :raw-team-stats.sync="rawTeamStats"
			        						:sport="team.sport" :raw-stats="stats" :players="players" :total="showStatTotals">
		        		</rc-stats>
		        		<div v-else class="text-center">
									<h4>No stats yet...</h4>
								</div>
		        	</div>
			        	
			      </div>
			    </div>



			    <div class="row">
			      <div class="col-xs-12 Team__roster"
			      			v-show="tab === 'roster'">

			        <rc-roster :players="players" :coaches="coaches" 
			        						:fans="fans" :edit-user.sync="editUser" 
			        						:is-admin="isAdmin">
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

								<!-- <rc-news-feed type="team" :feed="feed" :users="users"></rc-news-feed> -->

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
			<rc-view-event :is-admin="isAdmin" :events="events" :stats="stats" :team="team" 
											:players="players" :stat-keys="team.settings.statKeys">
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


	    <!-- modal window for adding events -->
	    <div class="modal" id="fansModal" role="dialog" aria-hidden="true">
	      <div class="modal-dialog">
	        <div class="modal-content">
	          <div class="modal-header">
	            <button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>
	            <h3 class="modal-title">Fans</h3>
	          </div>
	          <div class="modal-body">
	            <div class="row">
	                 
								<div class="col-xs-12 Team__fans">
									<ul>
										<li v-for="fan in fans">
											<a v-link="{name: 'user', params: {name: fan.username}}">{{ fan.name }}</a>
										</li>
									</ul>
								</div>

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
	            <h3 v-show="(editUser.member_id) && !editUser.new" class="modal-title">{{ editUser.firstname + ' ' + editUser.lastname }}</h3>
	            <h3 v-show="editUser.new && editUser.isPlayer" class="modal-title">Add a Player</h3>
	            <h3 v-show="editUser.new && editUser.isCoach" class="modal-title">Add a Coach</h3>
	          </div>
	          <div class="modal-body">
	          	<div class="row">
	            
								<rc-edit-user v-if="editUser.member_id || editUser.new" :user="editUser" :positions="positions"></rc-edit-user>

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

	components:
	{
		'rc-calendar'		: Calendar,
		'rc-stats'			: Stats,
		'rc-add-event'	: AddEvent,
		'rc-view-event'	: ViewEvent,
		'rc-roster'			: Roster,	
		'rc-news-feed'	: NewsFeed,	
		'rc-edit-user'	: EditUser,	
	},

	route:
	{
		canReuse: false,
	},

	data()
	{
		var prefix = this.$parent.prefix + 'team/';
		var teamname = this.$route.params.name;

		// set new title
		document.title = teamname;

		return {
			prefix: prefix + teamname,
			requestFinished: false,
			notFound: false,
			showStatTotals: false,
			statFilterKey: '',
			tab: 'calendar',
			statsTab: 'teamRecent',
			auth: {},
			team: {
				meta: {},
				settings: {},
			},
			isAdmin: false,
			isFan: false,
			isPlayer: false,
			isCoach: false,
			hasBeenInvited: false,
			hasRequestedToJoin: false,
			isCreator: false,
			joinAction: null,
			positions: [],
			users: [],
			events: [], 
			stats: [], 
			rawTeamStats: [],
			feed: [],
			editUser: {
				firstname: '',
				lastname: '',
				meta: {},
			},
		}
	},

	created()
	{
		var url = this.makeUrl('');
		this.$root.get(url, 'Team_requestSuccess', [], 'Team_requestFail');
	},

	computed: {

		isMember()
		{
			return this.isPlayer || this.isCoach;
		},

		/**
		 * The following three properties pick which of the fan icons to display
		 */
		showRemoveFan()
		{
			return this.isFan && !this.isMember;
		},
		showBecomeFan()
		{
			return !this.isFan && !this.isAdmin;
		},
		showIsFan()
		{
			// this icon is unclickable
			return this.isMember || (this.isFan && this.isAdmin)
		},


		/**
		 * The following four properties pick which of the membership buttons to display
		 */
		showJoinButton()
		{
			return this.showRequestToJoin || this.showCancelRequest || this.showRespondToInvitation;
		},
		showRequestToJoin()
		{
			return !this.hasRequestedToJoin && !this.hasBeenInvited && !this.isMember && !this.isCreator;
		},
		showCancelRequest()
		{
			return this.hasRequestedToJoin;
		},
		showRespondToInvitation()
		{
			return this.hasBeenInvited;
		},



		/**
		 * Create list of players from users
		 */
		players()
		{
			return this.users.filter(function(user) {
				return user.isPlayer;
			})
		},

		/**
		 * Create list of coaches from users
		 */
		coaches()
		{
			return this.users.filter(function(user) {
				return user.isCoach;
			})
		},

		/**
		 * Create list of fans from users
		 */
		fans()
		{
			return this.users.filter(function(user) {
				return user.isFan;
			})
		},

		/**
		 * Create a list of users that have requested to join the team
		 */
		usersThatWantToJoin()
		{
			return this.users.filter(function(user) {
				return user.hasRequestedToJoin;
			})
		},

	},

	events:
	{

		// team data has arrived from the back-end
		Team_requestSuccess(response)
		{
			this.compile(response.data.data);	

			setTimeout(function() {
				this.requestFinished = true;
				this.$broadcast('dataReady');
			}.bind(this), 100);
		},


		// team data has arrived from the back-end
		Team_requestFail(response)
		{
			this.requestFinished = true;
			this.notFound = true;
		},

		/**
		 * Successful toggleFan request to server
		 */
		Team_toggleFan(response)
		{
			this.isFan = !this.isFan;

			if (this.isFan) {
				// tell App.vue to add this team to the nav dropdown
				this.$dispatch('App_becameAFan', this.team);
				this.$root.banner('good', "You're now a fan");
			}
			else {
				this.$dispatch('App_notAFan', this.team);
				this.$root.banner('good', "You're no longer a fan");	
			}

			this.users = [];
			this.formatUsers(response.data.members);
		},


		Team_join(response)
		{
			if (this.joinAction === 'request') {
				this.hasRequestedToJoin = true;
				this.$root.banner('good', "Request sent");
			}
			else if (this.joinAction === 'cancel') {
				this.hasRequestedToJoin = false;
				this.$root.banner('good', "Request canceled");
			}
			else if (this.joinAction === 'accept') {
				this.users = [];
				this.formatUsers(response.data.members);
				this.$root.banner('good', "You've joined this team");
			}
		},


		// new stats have been posted from ViewEvent
		newStats(data, entry)
		{
			var self = this;
			data.forEach(function(val) {
				self.stats.push(val);
			});
		
			this.$broadcast('updateFeed', entry);
		},

		// updated stats have been posted from ViewEvent
		updateStats(data, event)
		{
			// first erase all stats for this event
			this.stats = this.stats.filter(function(stat) {
				return stat.event_id !== event.id;
			});

			if (data.length) {
				// there were new stats to add
				data.forEach(function(val) {
					this.stats.push(val);
				}.bind(this));
			}

			// tell Stats.vue to re-compile the stats
			this.$broadcast('updateStats', this.stats);
		},

		// stats have been deleted from ViewEvent
		deleteStats(event)
		{
			// iterate through all stats, keep the ones not associated with this event
			this.stats = this.stats.filter(function(stat) {
				return stat.event_id !== event.id;
			});

			// tell Stats.vue to re-compile
			this.$broadcast('updateStats', this.stats);
		},




		newEvent(events, entry)
		{
			this.events = events;

			this.$broadcast('updateFeed', entry);
		},

		updateEvent(events, entry)
		{
			this.events = events;

			if (entry) {
				this.$broadcast('updateFeed', entry);
			}
		},

		deleteEvent(events, entry)
		{
			this.events = events;

			if (entry) {
				this.$broadcast('updateFeed', entry);
			}
		},

		

		/**
		 * A user was created/edited/deleted
		 *
		 * @param {array} members  The updated array of team members
		 */
		Team_updated_members(members)
		{
			this.users = [];
			this.formatUsers(members);
		},
	},
	

	methods: {

		makeUrl(extension)
		{
			return this.prefix + extension;
		},

		// method for assigning data after ajax call finishes
		compile(data)
		{
			this.auth = this.$root.user;
			this.team = data.team;

			// loop through all the users, create user objects
			this.users = [];
			this.formatUsers(data.members);
			
			// store meta data about team
			var meta = JSON.parse(data.team.meta);
			this.team.slogan = meta.slogan;
			this.team.homefield = meta.homefield;
			this.team.city = meta.city;
			this.$set('team.settings.statKeys', meta.stats);

			// format the backdrop image as a style tag 
			this.team.backdrop = "background-image: url('" + this.team.backdrop + "');";

			// note whether or not this user is the creator
			if (this.team.creator_id === this.auth.id) {
				this.isCreator = true;
				this.isAdmin = true;
			}

			// now that all team data is ready, set these variables
			// components are listening, will format the data as needed
			this.events = data.events;
			this.stats = data.stats;
			this.feed = data.feed;
			this.positions = data.positions;

			// tell App.vue to clear any notifications the logged in user may have
			//this.$dispatch('clearNotifications', this.team.id);
		},

		// compile meta data for users and push into this.users
		formatUsers(users)
		{
			if (! users) {
				// its possible there is a 'null' here 
				return;
			}

			if (! Array.isArray(users)) {
				users = [users];
			}

			for (var x = 0; x < users.length; x++) {
				var user = users[x];

				if (user.meta) {
					user.meta = JSON.parse(user.meta);
				}
				else {
					user.meta = {};
				}

				if (this.auth.id === user.id) {
					// save the logged-in users's data separately too
					this.isAdmin = user.isAdmin;
					this.isFan = user.isFan;
					this.isPlayer = user.isPlayer;
					this.isCoach = user.isCoach;
					this.hasRequestedToJoin = user.hasRequestedToJoin;
					this.hasBeenInvited = user.hasBeenInvited;
				}

				// mark which user is the creator
				if (this.team.creator_id === user.id) {
					user.isCreator = true;
				}

				this.users.push(user);
			}
		},


		/**
		 * User hit the 'FAN'/'UNFAN' button
		 */
		toggleFan()
		{
			this.$root.post(this.prefix + '/fan', 'Team_toggleFan');
		},


		/**
		 * User hit the 'ASK TO JOIN' or 'ACCEPT INVITATION' button
		 * 
		 * @param  {string} action  Either 'request', 'cancel', or 'accept'
		 */
		join(action)
		{
			this.joinAction = action;
			this.$root.post(this.prefix + '/join', 'Team_join', { action: action });
		},

	}, // end methods

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
	flex-flow column
	margin-bottom 35px
	background-size cover
	background-attachment fixed

.Team__pic
	flex 1
	max-width 270px
	padding-left 20px
	transform translate(0, 125px)
	@media screen and (max-width 1000px)
		margin 10px
		transform translate(0, 0px)
		align-self center
		padding 0
	img
		border-radius 50%
		border 5px solid white
		
.black-container
	display flex
	flex-flow row
	background rgba(0,0,0,0.70)
	.filler
		flex 1
		min-width 290px
		@media screen and (max-width 1000px)
			flex 0
			min-width 0px
	
.Team__info__tabs
	display flex
	flex-flow column
	justify-content flex-start
	flex 3
	padding 0
	@media screen and (max-width 1000px)
		justify-content center
		flex-flow column
		flex 1
		.filler
			flex 0
	
.Team__info
	display flex
	flex-flow row
	@media screen and (max-width 1000px)
		justify-content center
		flex-flow column
	
.Team__text
	flex 1
	display flex
	flex-flow column
	color white
	@media screen and (max-width 1000px)
		justify-content center
		text-align center
	
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
	flex 1
	margin-top 15px
	font-size 16px

.Team__buttons
	flex 1
	display flex
	flex-flow row
	align-items flex-end
	margin-top 35px
	.--members
		margin-right 5px
	.--fans
		margin-left 5px
	@media screen and (max-width 1000px)
		justify-content center
			
			
.Team__tabs
	display flex
	flex-flow row
	padding 0
	margin-top 35px
	font-size 17px
	@media screen and (max-width 1000px)
		justify-content center
	.tab
		flex-basis 110px
		display flex
		align-items center
		justify-content center
		background-color rgba(255,255,255,0.7)
		margin-right 5px
		border-top-left-radius 3px
		border-top-right-radius 3px
		a
			color link_blue
			padding 7px 8px
		&:hover
			cursor pointer
		&.--active
			background-color whitesmoke
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
	.TabButton
		justify-content center
		margin-bottom 60px
	.TabButton.--just-two
		justify-content center
		margin-bottom 20px
		input
			width 175px
			margin-left 30px
			height 30px
	
.Team__fans
	ul
		list-style none
		font-size 16px
		text-align center
		padding-left 0

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