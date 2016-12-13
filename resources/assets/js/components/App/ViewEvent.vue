
<template>
  <div id="viewEventModal" class="modal" :class="makeModalWider ? 'stats-modal' : ''" >
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-top">
        	<div class="left title">
        		<h3>{{ modalTitle }}</h3>
        	</div>
          <div class="right">
          	<template v-if="viewing !== 'addingNewEvent'"> 
          		<!-- series of links to change state of ViewEvent -->
	          	<div class="navbar-toggle" :class="showDropdown ? '-showing' : '-not-showing'" v-touch:tap="showDropdown = ! showDropdown">
			          <span class="icon-bar"></span>
			          <span class="icon-bar"></span>
			        </div>
			        <div class="modal-dropdown" :class="showDropdown ? '-showing' : '-not-showing'">
			        	<span v-show="canShowEventDetails && ! showingEvent" class="dropdown-link" v-touch:tap="viewing = 'showingEvent'">View Event</span>
	          		<span v-show="canEditEvent" class="dropdown-link" v-touch:tap="viewing = 'editingEvent'">Edit Event</span>
		          	<span v-show="canShowStats && ! showingStats" class="dropdown-link" v-touch:tap="viewing = 'showingStats'">View Stats</span>
		          	<span v-show="canEditStats" class="dropdown-link" v-touch:tap="viewing = 'editingStats'">Edit Stats</span>
		          	<span v-show="canAddStats" class="dropdown-link" v-touch:tap="viewing = 'editingStats'">Add Stats</span>
			        </div>
	          	<span v-show="canShowEventDetails && ! showingEvent" class="link" v-touch:tap="viewing = 'showingEvent'">View Event</span>
          		<span v-show="canEditEvent" class="link" v-touch:tap="viewing = 'editingEvent'">Edit Event</span>
	          	<span v-show="canShowStats && ! showingStats" class="link" v-touch:tap="viewing = 'showingStats'">View Stats</span>
	          	<span v-show="canEditStats" class="link" v-touch:tap="viewing = 'editingStats'">Edit Stats</span>
	          	<span v-show="canAddStats" class="link" v-touch:tap="viewing = 'editingStats'">Add Stats</span>
          	</template>
          	<span class="close" data-dismiss="modal" aria-hidden="true">&times;</span>
          </div>
        </div>
        <div class="modal-body">
					<div class="ViewEvent">

						<template v-if="viewing === 'showingStats'">

							<stats v-if="eventStats.length" type="playerTeamSeason" :stat-keys="team.settings.statKeys" :event="true"
		        					:sport="team.sport" :raw-stats="eventStats" :players="players" table-bottom-label="TEAM" :centered="true">
											
											<!-- this is inserted above the stat table -->
		        					<div class="outcome">
												<span class="away" :class="{ 'win' : ! homeWon}">
													{{ awayTeam }} &mdash; {{ awayScore }}
												</span>
												<span class="home" :class="{ 'win' : homeWon}">
													{{ homeTeam }} &mdash; {{ homeScore }}
												</span>
											</div>
	        		</stats>

							<!-- show 'no stats yet' if there are none saved -->
	        		<div v-else class="ViewEvent">
								<div v-if="! isAdmin" class="details -no-stats">
									<span>No stats posted yet... bug an admin to post them!</span>
								</div>
								<div v-else class="details -no-stats">
									<span>Click 'Add Stats' to report this event's stats</span>
								</div>
							</div>		

						</template>

						<!-- event hasn't happened yet -->
						<template v-if="viewing === 'showingEvent'">
								
										<div class="ViewEvent">
											<div class="type -{{ event.type }}">
												<span>{{ type }}</span>
											</div>
											<div class="time">
												<span>{{ time(event) }}</span>
											</div>
											<div v-if="event.details" class="details">
												<span>{{ event.details }}</span>
											</div>
										</div>

						</template>		
						

						<!-- admin is editing an event -->
						<edit-event v-if="viewing === 'editingEvent'" :saved-event="event" 
												:new-title.sync="newTitle"></edit-event>


						<!-- admin is editing stats for this event -->
						<edit-stats v-if="viewing === 'editingStats'" :event-stats="eventStats" :players="players"
												:event="event" :team="team"></edit-stats>


						<!-- admin is creating a new event -->
						<edit-event v-if="viewing === 'addingNewEvent'" :new-title.sync="newTitle"></edit-event>

					</div>
      	</div>
      </div>
    </div>
  </div>
</template>


<script>

import Stats from '../Stats/Stats.vue'
import EditEvent from '../Team/EditEvent.vue'
import EditStats from '../Stats/EditStats.vue'

export default  {
	
	name: 'ViewEvent',

	props: ['team', 'events', 'stats', 'players', 'isAdmin'],

	components:
	{
		EditEvent,
		Stats,
		EditStats,
	},

	data()
	{
		let prefix = this.$parent.prefix;

		return {	
			prefix: prefix,
			event: {
				start: 0,
				title: '',
				type: 0,
				id: 0,
			},
			viewing: 'showingEvent', // possible: 'addingNewEvent', 'showingEvent', 'showingStats', 'editingEvent', 'editingStats'
			eventStats: [],
			newTitle: '',
			score: '',
			showDropdown: false,
		}
	},

	events:
	{
		/**
		 * The modal popup has been dismissed
		 */
		ViewEvent_cancel()
		{
			$('#viewEventModal').modal('hide');
		},


		/**
		 * An event to be viewed has been clicked on
		 */
		ViewEvent_view(id)
		{
			this.viewEvent(id);
		},


		/**
		 * This team's score for this event has been calculated
		 */
		ViewEvent_score(score)
		{
			this.score = score;
		},
	},

	watch:
	{
		viewing()
		{
			this.showDropdown = false;
		},
	},

	computed:
	{
		/**
		 * Compute what to show as the title of the modal
		 */
		modalTitle()
		{
			if (this.viewing === 'editingEvent' || this.viewing === 'addingNewEvent') {
				if (this.newTitle.length) {
					return this.newTitle
				}
				else {
					return 'Add an Event';
				}
			}
			else {
				return this.event.title
			}
		},


		/**
		 * Event has happeend already
		 */
		eventHasHappened()
		{
			return moment().isAfter(moment.utc(this.event.start * 1000));
		},


		/**
		 * Event is a home/away game
		 */
		eventIsAGame()
		{
			return this.event.type === 'home_game' || this.event.type === 'away_game';
		},


		/**
		 * Show the button to edit the event?
		 */
		canEditEvent()
		{
			return this.isAdmin && this.viewing !== 'addingNewEvent' && this.viewing !== 'editingEvent';
		},


		/**
		 * Show the button to edit existing stats?
		 */
		canEditStats()
		{
			return this.isAdmin && this.eventIsAGame && this.eventHasHappened && 
							this.eventStats.length && this.viewing !== 'editingStats';
		},


		/**
		 * Show the button to add new stast?
		 */
		canAddStats()
		{
			return this.isAdmin && this.eventIsAGame && this.eventHasHappened && 
							! this.eventStats.length && this.viewing !== 'editingStats';
		},


		/**
		 * Show the button to view event details?
		 */
		canShowEventDetails()
		{
			return this.viewing !== 'showingEvent' && this.viewing !== 'addingNewEvent'; 
		},


		/**
		 * Show the button to view event stats?
		 */
		canShowStats()
		{
			return this.eventIsAGame && this.eventHasHappened && this.viewing !== 'showingStats' &&
							(! this.isAdmin || this.eventStats.length);
		},


		/**
		 * When showing stat tables, make the modal window wider
		 */
		makeModalWider()
		{
			return this.viewing === 'editingStats' || (this.viewing === 'showingStats' && this.eventStats.length);
		},


		/**
		 * Calculate who was the away team
		 */
		awayTeam()
		{
			if (this.event.type === 'home_game') {
				return JSON.parse(this.eventStats[0].meta).opp
			}
			else if (this.event.type === 'away_game') {
				return this.team.name;
			}
		},


		/**
		 * Calculate who was the home team
		 */
		homeTeam()
		{
			if (this.event.type === 'away_game') {
				return JSON.parse(this.eventStats[0].meta).opp
			}
			else if (this.event.type === 'home_game') {
				return this.team.name;
			}
		},


		/**
		 * Whether or not the home team won
		 */
		homeWon()
		{
			let oppScore = JSON.parse(this.eventStats[0].meta).oppScore

			if (this.homeTeam === this.team.name) {
				if (this.score > oppScore) {
					return true;
				}
				return false
			}
			else {
				if (this.score > oppScore) {
					return false;
				}
				return true
			}
		},


		homeScore()
		{
			if (this.homeTeam === this.team.name) {
				return this.score
			}
			else {
				return JSON.parse(this.eventStats[0].meta).oppScore
			}
		},


		awayScore()
		{
			if (this.homeTeam === this.team.name) {
				return JSON.parse(this.eventStats[0].meta).oppScore
			}
			else {
				return this.score
			}
		},


		/**
		 * Return a formatted string representing the score
		 */
		outcome()
		{
			if (this.event.type === 'away_game') {
				let oppScore = JSON.parse(this.eventStats[0].meta).oppScore
				return `${this.score} - ${oppScore}`;
			}

			let oppScore = JSON.parse(this.eventStats[0].meta).oppScore
			return `${oppScore} - ${this.score}`;
		},


		type()
		{
			switch (this.event.type) {
				case 'practice': return 'Practice';
				case 'home_game': return 'Home Game';
				case 'away_game': return 'Away Game';
				case 'other': return 'Special Event';
			}
		},
		
	},



	methods:
	{
		/**
		 * An event was clicked, gather the data and stats associated with it
		 *
		 * @param {int} id  The id of the clicked event
		 */
		viewEvent(id)
		{
			if (this.event.id === id && id !== 0) {
				// don't do anything if this is the same event that was clicked previously
      	this.$root.showModal('viewEventModal')
      	// set the url to /event/${event_id}
      	this.$root.url(`/team/${this.team.teamname}/event/${id}`, {event: this.event.id});
      	return
			}

			this.viewing = 'showingEvent';

			// find the event data and stats for clicked event
			this.event = this.events.filter(event => event.id === id)[0];
			this.eventStats = this.stats.filter(stat => stat.event_id === id);

			let url_ext = this.decideWhatToShow();

			this.$root.url(`/team/${this.team.teamname}/event/${url_ext}`, {event: url_ext});
			
			this.$broadcast('EditEvent_view', this.event);

      this.$root.showModal('viewEventModal');
    },


    /**
     * Depending on the event data, pick what the user is first shown
     */
    decideWhatToShow()
    {
    	if (! this.event) {
    		this.event = {
					start: 0,
					title: '',
					type: 0,
					id: 0,
				}

				this.viewing = 'addingNewEvent'
				return 'create'; // show url as /event/create
    	}

    	if (this.canEditStats || this.canAddStats) {
				this.viewing = 'editingStats';
			}

    	if (this.canShowStats) {
				this.viewing = 'showingStats'
			}

			// if none of these hit, this.viewing === 'showingEvent'

    	return this.event.id;
    },


    /**
     * Format the start and end times to human readable
     *
     * @param {object} event
     */
    time(event)
    {
    	let startTime, endTime;  
    	let start = event.start * 1000;
    	let end = event.end * 1000;

      if (moment(start).isSame(end, 'day')) {
        // events on same day, drop date in title

        if ((moment(start).hour() < 12 && moment(end).hour() < 12) ||
           (moment(start).hour() >= 12 && moment(end).hour() >= 12)) {
          // both are am or pm, drop that from string as well
          startTime = moment(start).format('MMM. Do h:mm');
          endTime   = moment(end).format('h:mm a');
        }
        else {
          startTime = moment(start).format('MMM. Do h:mm a');
          endTime   = moment(end).format('h:mm a');
        }
        return startTime + " – " + endTime;
      }
      else {
        return moment(start).format('MMM. Do h:mm a') + ' - ' + 
                moment(end).format('MMM. Do h:mm a')
      }
    },
	},

	/**
	 * Attach jQuery listeners for a click on the calendar or news feed
   * Wait long enough to ensure DOM is fully loaded
	 */
	ready()
	{
		
    setTimeout(function() {
    		// for clicks on calendar events
        $('.Calendar__container').on('click touchstart', 'a.event-trigger', function(e) {
          this.viewEvent($(e.target).data('event-id'));
        }.bind(this)); 

        $('.Calendar').on('click touchstart', '#addEventTrigger', function(e) {
          this.viewEvent(0);
        }.bind(this));
        
        // for clicks on news feed event links
        $('.Feed').on('click touchstart', 'a.event-trigger', function(e) {
          this.viewEvent($(e.target).data('event-id'));
        }.bind(this));   
    }.bind(this), 1000);
	},

};

</script>


<style lang="stylus">

// import color variables
@import '/resources/assets/stylus/variables.styl'

.edit-event
	display flex
	justify-content flex-end
	align-items center
	width 100%
	height 30px
	font-size 18px
	border-bottom 3px solid rc_super_lite_gray
	margin-bottom 20px
	padding-bottom 5px
	&.-center
		justify-content center
	a
		margin-left 25px
	

.ViewEvent
	display flex
	flex-flow column
	align-items center
	width 100%
	margin 0 auto
	.time
	.type
		font-size 30px
		margin-bottom 30px
		text-align center
		&.-practice
			color rc_blue
		&.-home_game
			color rc_red
		&.-away_game
			color rc_yellow
		&.-other
			color rc_green					
	.details
		font-size 18px
		text-align center
		width 100%
		border-top 3px solid rc_super_lite_gray
		padding-top 15px
		&.-no-stats
			margin 25px 0
			padding-top 0
			width 100%
			border-top none
	
.outcome
	display flex
	align-items center
	font-size 25px
	color rc_lite_gray
	margin-bottom 5px
	width 100%
	white-space nowrap
	overflow visible
	.away
		padding-right 15px
		padding-top 2px
		border-right 2px solid rc_super_lite_gray
	.home
		padding-left 15px
		padding-top 2px
		border-left 1px solid rc_super_lite_gray
	.win
		color rc_win
	.separator
		font-size 40px
		color rc_lite_gray
	.-no-border
		border 0
	
.modal
	.stats-wrapper
		padding 15px
		
.type.-practice
	color rc_blue
.type.-home_game
	color rc_red
.type.-away_game
	color rc_yellow
.type.-other
	color rc_green					

.modal
	padding 0
.stats-modal
	.modal-dialog
		width 90%
		+mobile()
			width 95%


</style>