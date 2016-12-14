<template>
	<div>
		<div v-show="requestFinished" transition="fade-slow">
		<!-- container for template -->

			<!-- no results for team, show message -->
			<div v-cloak v-if="notFound" class="team-not-found text-center">
				<h3>This team doesn't exist, you could create it <a v-link="{name: 'team', params: {name: 'create'}}">here</a></h3>
				<br>
				<h4>If you think this is an error, try refreshing the page.</h4>
			</div>

			<!-- wrapper div around non-modal content for blurring -->
			<div v-else class="Team for-blurring">
			

	    	<div class="Team__details" :style="backdropPhoto">
					
					<div class="Team__pic">
						<img width="250" height="250" :src="team.pic">
					</div>
					
					<div class="black-container">
						
						<div class="filler"></div>						

						<div class="Team__info__tabs">

							<div class="filler"></div>
							
							<div class="Team__info">
								<div class="Team__text">
									<h1 class="Team__name">
										<span :class="{'text-typing -white' : focused.name }">{{ team.name }}</span>
									</h1>
									<span class="team-record">{{ team.sport | capitalize }}, {{ team.record }}</span>
									<div class="Team__slogan">
										<span :class="{'text-typing -white' : focused.slogan }">{{ team.slogan }}</span>
									</div>
									<div v-show="showLocation" class="Team__location">
										<span>
											<i class="material-icons no-highlight">place</i>
											<span v-if="team.homefield">
												<span :class="{'text-typing -white' : focused.homefield }">{{ team.homefield }}</span><span v-show="team.homefield">,</span>
											</span>
											<span :class="{'text-typing -white' : focused.city }">{{ team.city }}</span>
										</span>
									</div>	
								</div>

								<div class="Team__right_half">
									<div class="Team__buttons">
										<div class="btn-counter -members">
											<template v-if="! isMember">
												<span v-show="hasBeenInvited" class="btn-text -icon -green" v-touch:tap="respondingToInvitation()">
													<i class="material-icons">drafts</i><span>RESPOND TO INVITE</span>
												</span>
												<span v-show="hasRequestedToJoin" class="btn-text -icon -red" v-touch:tap="join('cancel')">
													<i class="material-icons">clear</i><span>CANCEL</span>
												</span>
												<span v-show="! hasBeenInvited && ! hasRequestedToJoin" class="btn-text -icon -blue" v-touch:tap="join('request')">
													<i class="material-icons">person_add</i><span>ASK TO JOIN</span>
												</span>
											</template>
											<span v-else class="btn-text -icon -not-a-button">
												<i class="material-icons">grade</i><span>MEMBERS</span>
											</span>
											<span class="btn-count">
												<span>{{ players.length + coaches.length }}</span>
											</span>
										</div>

										<div class="btn-counter -fans">
											<template v-if="! isMember">
												<span v-show="! isFan" class="btn-text -icon -blue" @click="toggleFan">
													<i class="material-icons">favorite</i><span>FAN</span>
												</span>
												<span v-show="isFan" class="btn-text -icon -blue" @click="toggleFan">
													<i class="material-icons">favorite_border</i><span>UNFAN</span>
												</span>
											</template>
											<span v-else class="btn-text -icon -not-a-button">
												<i class="material-icons">favorite</i><span>FANS</span>
											</span>
											<span class="btn-count">
												<span>{{ fans.length }}</span>
											</span>
										</div>
									</div>
								</div> <!-- end  Team__buttons -->
								
							</div> <!-- end Team__info -->

							<div class="Team__tabs">
								<div class="tab" :class="{'-active' : tab === 'calendar'}" v-touch:tap="tab = 'calendar'">
									<a>CALENDAR</a>			
								</div>
								<div class="tab" :class="{'-active' : tab === 'stats'}" v-touch:tap="tab = 'stats'">
									<a>STATS</a>	
								</div>
								<div class="tab" :class="{'-active' : tab === 'roster'}" v-touch:tap="tab = 'roster'">
									<a>ROSTER</a>
									<span v-show="usersThatWantToJoin.length && isAdmin" class="notifications">{{ usersThatWantToJoin.length }}</span>
								</div>
								<div v-show="isAdmin" class="tab" :class="{'-active' : tab === 'settings'}" v-touch:tap="tab = 'settings'">
									<a>SETTINGS</a>
									<span v-show="! settingsSaved && isAdmin" class="notifications">&#33;</span>
								</div>
							</div>	
						</div>
					</div>
				</div> <!-- end team well -->



				
				<div> <!-- begin calendar/roster/stats/newsfeed container -->


				  <div class="row">
			      <div v-show="tab === 'calendar'" class="col-xs-12 Team__calendar">

		        	<calendar :is-admin="isAdmin" :events="events" :timezone="team.timezone"></calendar>

			      </div>
			    </div>



			    <div class="row">
			      <div class="col-xs-12 text-center Team__stats" v-show="tab === 'stats'">

							<div class="TabButton -two stats-nav">
								<div class="first" :class="{'active' : statsTab === 'recent'}" v-touch:tap="statsTab = 'recent'">
									<span>Recent</span>
								</div>
								<div class="second" :class="{'active' : statsTab === 'season'}" v-touch:tap="statsTab = 'season'">
									<span>Season</span>
								</div>

							</div>
			      	
							<div v-show="statsTab === 'recent'">

								<stats v-if="stats.length" type="teamRecent" :stat-keys="team.settings.statKeys" :sport="team.sport"
													:raw-stats="stats" :players="players" :paginate="10" :team-record.sync="team.record" :centered="true">
		        		</stats>

		        		<div v-else class="text-center">
									<h4>No stats yet&hellip;</h4>
								</div>

							</div>


							<div v-show="statsTab === 'season'" class="stats-with-filters">

								<div class="stat-filters">
									<div v-show="stats.length" class="TabButton -two -small">
										<div class="first" :class="{'active' : showStatTotals === false}" v-touch:tap="showStatTotals = false">
											<span>Averages</span>
										</div>
										<div class="second" :class="{'active' : showStatTotals === true}" v-touch:tap="showStatTotals = true">
											<span>Totals</span>
										</div>
									</div>
									<input type="text" class="form-control -white" placeholder="Search by name&hellip;" v-model="statSearch">
								</div>
								
								<stats v-if="stats.length" type="playerTeamSeason" :stat-keys="team.settings.statKeys" :total.sync="showStatTotals" 
			        						:sport="team.sport" :raw-stats="stats" :players="players" :search="statSearch" :centered="true"
			        						table-bottom-label="TEAM">
		        		</stats>
			        	
		        		<div v-else class="text-center">
									<h4>No stats yet&hellip;</h4>
								</div>
		        	</div>
							
			      </div>
			    </div>



			    <div class="row">
			      <div v-show="tab === 'roster'" class="col-xs-12">

			        <roster :users="users" :edit-user.sync="editUser" :is-admin="isAdmin"></roster>		

			      </div>
			    </div>


			     <div v-if="requestFinished" class="row">
			      <div v-show="tab === 'settings'"class="col-xs-12">
		        	
		        	<settings :team.sync="team" :is-admin="isAdmin" :saved.sync="settingsSaved"
		        						:focused.sync="focused"></settings>

			      </div>
			    </div>
		    </div>

				
				<div class="row">
					<div class="col-xs-12 Team__feed">

						<div class="row">
							<div class="col-xs-12">

								<!-- <news-feed type="team" :feed="feed" :users="users"></news-feed> -->

							</div>
						</div>
					</div>
				</div>
				
				<!-- include the footer at bottom -->
				<div class="Footer">
			    <p>® 2017 Rookiecard LLC</p>
				</div>

			</div>
		  <!--  end of blurring wrapper --> 
		  <!-- keep modals below here so the background blurs properly -->



	    <!-- inside here is complex logic handling what happens when an event is clicked on from calendar or news feed -->
			<view-event :is-admin="isAdmin" :events="events" :stats="stats" :team="team" 
									:players="players">
			</view-event>


	    <!-- modal for editing a player in the roster -->
			<div class="modal" id="rosterModal" role="dialog" aria-hidden="true">
	      <div class="modal-dialog">
	        <div class="modal-content">
	          <div class="modal-top">
		        	<div class="left title">
		        		<h3 v-show="(editUser.member_id) && !editUser.new" class="modal-title">{{ editUser.firstname + ' ' + editUser.lastname }}</h3>
	            	<h3 v-show="editUser.new && editUser.isPlayer" class="modal-title">Add a Player</h3>
	            	<h3 v-show="editUser.new && editUser.isCoach" class="modal-title">Add a Coach</h3>
		        	</div>
		          <div class="right">
		          	<span class="close" data-dismiss="modal" aria-hidden="true">&times;</span>
		          </div>
		        </div>
	          <div class="modal-body">
	          	<div class="row">
	            
								<edit-user v-if="editUser.member_id || editUser.new" :user="editUser" 
															:positions="positions" :users="users"></edit-user>

							</div>
	          </div>
	        </div>
	      </div>
	    </div>


	    <!-- modal window for adding events -->
	    <div class="modal" id="joinTeamModal" role="dialog" aria-hidden="true">
	      <div class="modal-dialog">
	        <div class="modal-content">
	          <div class="modal-top">
		        	<div class="left title">
		        		<h3>Join Team?</h3>
		        	</div>
		          <div class="right">
		          	<span class="close" data-dismiss="modal" aria-hidden="true">&times;</span>
		          </div>
		        </div>
	          <div class="modal-body">

	            <div class="row JoinTeam__msg">
								<div class="col-xs-12">
									<span>An admin has invited you to join this team</span>
								</div>
	            </div>
	            <div class="row JoinTeam__buttons">
						    <div class="col-xs-6 col-xs-offset-3 col-sm-3 col-sm-offset-2">
						    	<a class="btn btn-primary btn-block btn-md" v-touch:tap="join('accept')">JOIN</a>
						    </div>
						    <div class="col-xs-6 col-xs-offset-3 col-sm-3 col-sm-offset-1">
						    	<a class="btn btn-delete btn-block btn-md outline" v-touch:tap="join('decline')">DECLINE</a>
						    </div>
							</div>
	          </div>
	        </div>
	      </div>
	    </div>



	    <!-- modal for cropping a photo -->
			<div class="modal" id="cropModal" role="dialog" aria-hidden="true">
	      <div class="modal-dialog">
	        <div class="modal-content">
	          <div class="modal-top">
		        	<div class="left title">
		        		<h3>Crop Photo</h3>
		        	</div>
		          <div class="right">
		          	<span class="close" data-dismiss="modal" aria-hidden="true">&times;</span>
		          </div>
		        </div>
	          <div class="modal-body">
	          	<div class="row">
	            	<div class="croppie-wrapper">
	            		<div id="croppie" class="croppie"></div>
									<div class="save-button-wrapper -center -with-divider">
										<div class="save-button-group -one">
		            			<div>
		            				<a class="btn btn-primary" v-touch:tap="$broadcast('TeamSettings_cropped')">
		            					<span v-show="! loading_save">CROP</span>
		            					<spinner v-show="loading_save" color="white"></spinner>
		            				</a>
		            			</div>
		            		</div>
									</div>
	            		
	            	</div>
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
import Roster 		from './Roster.vue';
import EditUser 	from './EditUser.vue';
import Stats 			from '../Stats/Stats.vue';
import NewsFeed 	from '../App/NewsFeed.vue';
import ViewEvent 	from '../App/ViewEvent.vue';
import Settings 	from './Settings/TeamSettings.vue';

export default  {
	
	name: 'Team',

	props: [],

	components:
	{
		'calendar'		: Calendar,
		'stats'				: Stats,
		'view-event'	: ViewEvent,
		'roster'			: Roster,	
		'news-feed'		: NewsFeed,	
		'edit-user'		: EditUser,	
		'settings'		: Settings,	
	},

	route:
	{
		// since each team page is so unique, it's not worth trying to reuse the components
		canReuse: false,
	},

	data()
	{
		let prefix = this.$parent.prefix + '/team/';
		let teamname = this.$route.params.name;

		// set new title
		document.title = teamname;

		return {
			prefix: prefix + teamname,
			requestFinished: false,
			notFound: false,
			showStatTotals: false,
			statSearch: '',
			tab: 'calendar',
			statsTab: 'recent',
			user: {},
			team: {
				meta: {},
				settings: {},
				tempPic: undefined,
				tempBackdrop: undefined,
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
			newEventTitle: '',
			settingsSaved: true,
			focused: {
				name: false,
				slogan: false,
				homefield: false,
				city: false,
			},
		}
	},

	created()
	{
		this.$root.get(this.prefix, 'Team_requestSuccess', [], 'Team_requestFail');

		this.$root.unblur();
	},

	computed:
	{
		/**
		 * Format the backdrop image into a style tag
		 */
		backdropPhoto()
		{
			return `background-image: url('${this.team.backdrop}');`
		},


		/**
		 * Is the logged-in user a member of this team?
		 */
		isMember()
		{
			return this.isPlayer || this.isCoach;
		},


		/**
		 * Is the logged-in user not affiliated with this team at all?
		 */
		isUnaffiliated()
		{
			return ! this.isMember && ! this.isFan
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
		 * Whether or not to show the team's location
		 */
		showLocation()
		{
			if (! this.team.homefield && ! this.team.city) {
				return false;
			}

			if (this.isUnaffiliated && this.team.settings.onlyMembersCanViewLocation) {
				return false;
			}
			
			return true;
		},



		/**
		 * Create list of players
		 */
		players()
		{
			return this.users.filter(user => user.isPlayer);
		},

		/**
		 * Create list of coaches
		 */
		coaches()
		{
			return this.users.filter(user => user.isCoach);
		},

		/**
		 * Create list of fans
		 */
		fans()
		{
			return this.users.filter(user => user.isFan);
		},

		/**
		 * Create a list of users that have requested to join the team
		 */
		usersThatWantToJoin()
		{
			return this.users.filter(user => user.hasRequestedToJoin);
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
				this.checkUrlForStateChange();
			}.bind(this), 125);
		},


		// team data has arrived from the back-end
		Team_requestFail(response)
		{
			this.requestFinished = true;
			this.notFound = true;
			this.checkUrlForStateChange();
		},


		/**
		 * A modal window was up, but is now minimized
		 */
		App_modal_minimized()
		{
			if (window.history.state && this.requestFinished) {
				// there was a URL state change with whatever modal was open but now is minimized
				// change the URL to just being '/team/teamname' again
				this.$root.url(`/team/${this.$route.params.name}`)
			}
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


		/**
		 * The user has changed their membership with the team in some way
		 * Either accepting/denying an invite, or sending/canceling request to join
		 */
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
				this.$dispatch('App_notAFan', this.team); // remove them as a fan in the nav dropdown just in case
				$('#joinTeamModal').modal('hide');
			}
			else if (this.joinAction === 'decline') {
				this.hasBeenInvited = false;
				this.$root.banner('good', "Invitation declined");
				this.$dispatch('App_notInvited', this.team); // remove "invited to" section of nav dropdown
				$('#joinTeamModal').modal('hide');
			}
		},

		Team_view_event(id)
		{
			this.$broadcast('ViewEvent_view', id);
		},


		/**
		 * The team's info and settings were updated
		 */
		Team_updated_team(team)
		{
			this.formatTeam(team);

			this.prefix = `${this.$parent.prefix}/team/${team.teamname}`;

			this.$root.url(`/team/${team.teamname}`);

			this.$broadcast('Stats_recompile');
		},


		/**
		 * An event was created/edited/deleted
		 *
		 * @param {array} events  	The new collection of events for this team
		 */
		Team_updated_events(events)
		{
			this.events = events;
		},


		/**
		 * Stats were created/edited/deleted
		 *
		 * @param {array} stats  The new collection of stats for this team
		 */
		Team_updated_stats(stats)
		{
			this.stats = stats;
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

			// delay to allow new users object time to propogate
			setTimeout(function() {
				// need to recompile stats to include roster changes
				this.$broadcast('Stats_recompile');
			}.bind(this), 100);
		},
	},
	

	methods:
	{
		/**
		 * Data has arrived from server, set all of team data
		 */
		compile(data)
		{
			// get the logged-in user's details from App.vue
			this.user = this.$root.user;
			
			// save the team's info and meta data
			this.formatTeam(data.team);

			// loop through all the users, create user objects
			this.users = [];
			this.formatUsers(data.members);
			
			// now that all team data is ready, set these variables
			// components are listening, will format the data as needed
			this.$set('events', data.events);
			this.$set('stats', data.stats);
			this.$set('feed', data.feed);
			this.$set('positions', data.positions);
		},


		/**
		 * Reorganize the team data from server
		 */
		formatTeam(team)
		{
			this.$set('team.name', team.name);
			this.$set('team.teamname', team.teamname);
			this.$set('team.pic', team.pic);
			this.$set('team.backdrop', team.backdrop);
			this.$set('team.season', team.season);
			this.$set('team.creator_id', team.creator_id);
			this.$set('team.lat', team.lat);
			this.$set('team.long', team.long);
			this.$set('team.sport', team.sport);
			this.$set('team.meta', team.meta);

			// store meta data about team
			let meta = JSON.parse(team.meta);
			
			this.$set('team.slogan', meta.slogan);
			this.$set('team.city', meta.city);
			this.$set('team.homefield', meta.homefield);
			this.$set('team.timezone', meta.tz);
			this.$set('team.record', '0-0');

			// store settings
			this.$set('team.settings.statKeys', meta.settings.statKeys);
			this.$set('team.settings.onlyMembersCanViewLocation', meta.settings.onlyMembersCanViewLocation);
			this.$set('team.settings.onlyMembersCanViewRoster', meta.settings.onlyMembersCanViewRoster);
			this.$set('team.settings.onlyMembersCanViewEvents', meta.settings.onlyMembersCanViewEvents);
			this.$set('team.settings.membersAreInviteOnly', meta.settings.membersAreInviteOnly);
			this.$set('team.settings.fansRequireAcceptance', meta.settings.fansRequireAcceptance);

			this.$set('team.settings.notifyOnNewEvent', meta.settings.notifyOnNewEvent);
			this.$set('team.settings.notifyOnEditedEvent', meta.settings.notifyOnEditedEvent);
			this.$set('team.settings.notifyOnDeletedEvent', meta.settings.notifyOnDeletedEvent);
			this.$set('team.settings.notifyOnNewStats', meta.settings.notifyOnNewStats);
			this.$set('team.settings.notifyOnNewMember', meta.settings.notifyOnNewMember);

			// note whether or not this user is the creator
			if (this.team.creator_id === this.user.id) {
				this.isCreator = true;
				this.isAdmin = true;
			}
		},


		/**
		 * Compile the meta data and push each user into this.users
		 */
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

				if (this.user.id === user.id) {
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


		/**
		 * User is responding to the invitation, show confirm/deny popup
		 */
		respondingToInvitation()
		{
			this.$root.showModal('joinTeamModal');
		},


		/**
		 * Depending on what the URL is, user may want to see data in particular
		 */
		checkUrlForStateChange()
		{
			// does the $route have an event_id parameter set?
			if (this.$route.params.event_id) {
				this.displayEvent(parseInt(this.$route.params.event_id));
			}
		},


		/**
		 * According to the URL, should be showing the user an event modal
		 */
		displayEvent(id)
		{
			let showingEvent = false;

			// see if event_id exists in any of team's events
			for (var index in this.events) {
				if (this.events[index].id === id) {
					showingEvent = true;
					// show it after small delay to allow page to keep up
					setTimeout(function() {
						this.$broadcast('ViewEvent_view', id);
					}.bind(this), 500)
				}
			}
			if (! showingEvent) {
				// that event doesn't belong to them, get rid of that section of URL
				this.$root.url(`/team/${this.$route.params.name}`);
			}
		},

	}, // end methods

	ready()
	{
		this.$root.unblur();
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
	+tablet()
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
		+tablet()
			flex 0
			min-width 0px
	
.Team__info__tabs
	display flex
	flex-flow column
	justify-content flex-start
	flex 3
	padding 0
	+tablet()
		justify-content center
		flex-flow column
		flex 1
		.filler
			flex 0
	
.Team__info
	display flex
	flex-flow row
	+tablet()
		justify-content center
		flex-flow column
	
.Team__text
	display flex
	flex 1
	flex-flow column
	color white
	+tablet()
		justify-content center
		align-items center
		text-align center
		margin-top 40px
	
.Team__name		
	flex-basis 1
	font-size 42px
	+tablet()
		font-size 35px
		margin-top -15px
.team-record
	font-size 25px
	+tablet()
		font-size 23px
	
.Team__location
	padding-left 22px
	margin-top 12px
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
	margin-top 9px
	font-size 16px
	font-style italic

.Team__right_half
	flex 1
	display flex
	flex-flow column
	justify-content flex-end
	margin-top 35px
	.-members
		margin-right 5px
	.-fans
		margin-left 5px
	+tablet()
		justify-content center
		margin-top 10px	
		
.Team__buttons
	display flex
	flex-flow row
	margin-bottom 6px
	+tablet()
		justify-content center
		margin-top 20px
	
.Team__record
	font-size 50px
	color rc_yellow
			
.Team__tabs
	display flex
	flex-flow row
	padding 0
	margin-top 35px
	font-size 17px
	+tablet()
		justify-content center
		margin-top 30px
	+mobile()
		font-size 14px
	.tab
		flex-basis 110px
		display flex
		align-items center
		justify-content center
		position relative
		background-color rgba(255,255,255,0.7)
		margin-right 5px
		border-top-left-radius 3px
		border-top-right-radius 3px
		+the-last-one()
			margin-right 5px
		+tablet()
			+the-first-one()
				margin-left 5px
		a
			color link_blue
			padding 7px 8px
			margin-top 3px
		.notifications
			position absolute
			display flex
			justify-content center
			align-items center
			top -12px
			right -4px
			height 25px
			width 25px
			background rc_red
			color white
			border-radius 50%
				
		&:hover
			cursor pointer
		&.-active
			background-color whitesmoke
			a
			&:hover
				cursor default
				color black
				
.stats-with-filters
	.stats-overflow
		margin-top 0
					
				

.Team__feed
	background rc_two_tone
	margin-top 4em
		
.Team__stats
	padding 0 2em
	.stats-nav
		justify-content center
		margin-bottom 60px
		+mobile()
			margin-bottom 30px
	.stat-filters
		display flex
		flex-flow row nowrap
		justify-content center
		align-items center
		margin-top 0
		margin-bottom 10px
		+mobile()
			flex-flow column nowrap
			align-items center
			margin-bottom 20px
		.TabButton
			margin 0
			height 30px
		input
			width 173px
			margin-left 30px
			height 30px
			+mobile()
				margin-top 15px
				margin-left 0
	
			
.JoinTeam__msg
	margin-bottom 30px
	font-size 18px
	div
		text-align center
	
.JoinTeam__buttons
	margin-bottom 15px
		

.team-not-found
	margin-top 80px

stats
	padding 2em	







</style>