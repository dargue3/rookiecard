
<template>
  <div id="viewEventModal" class="modal" :class="showStats ? 'stats-modal' : ''" >
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>
          <h3 class="modal-title">{{ modalTitle }}&nbsp;</h3>
        </div>
        <div class="modal-body">
					<div class="row ViewEvent">

						<!-- the following shows the correct content based on date, event type, admin status, sport -->
					
						<!-- show stats if they aren't admin and is past event -->
						<template v-if="pastEventStats">
							<stats type="playerTeamSeason" :stat-keys="team.settings.statKeys" :event="true"
		        					:sport="team.sport" :raw-stats="eventStats" :players="players" table-bottom-label="TEAM">

		        					<div class="outcome">
												<span class="away" :class="{ 'win' : ! homeWon}">
													{{ awayTeam }} &mdash; {{ awayScore }}
												</span>
												<span class="home" :class="{ 'win' : homeWon}">
													{{ homeTeam }} &mdash; {{ homeScore }}
												</span>
											</div>
	        		</stats>
						</template>
						

						<!-- show edit event page if admin and event is in the future -->
						<edit-event v-if="canEditEvent || editingPastEvent" :saved-event="event" 
												:editing-past-event.sync="editingPastEvent">
						</edit-event>


						<!-- show add event page if clicked "Add an Event" -->
						<edit-event v-if="newEvent" :new-title.sync="newTitle"></edit-event>


						<!-- show the form for adding stats to an event -->
						<div v-if="canEditStats" class="col-xs-12">
							<edit-stats :event-stats="eventStats" :players="players" :editing-past-event.sync="editingPastEvent" 
													:event="event" :team="team">
							</edit-stats>
						</div>		


						<div v-if="pastEventNoStats && ! newEvent" class="col-xs-12 ViewEvent">

							<div class="edit-button">
								<a class="btn btn-primary" v-touch:tap="editingPastEvent = true">Edit Event Details</a>
							</div>

							<div v-if="event.details" class="details">
								<span>This event is over and wasn't set up as a game, so there are no stats</span>
							</div>

						</div>										


						<div v-if="(futureEvent || pastEvent) && event.id" class="col-xs-12 ViewEvent">

							<div class="type --{{ event.type }}">
								<span>{{ type }}</span>
							</div>
							<div class="time">
								<span>{{ time(event) }}</span>
							</div>
							<div v-if="event.details" class="details">
								<hr>
								<span>{{ event.details }}</span>
							</div>

						</div>

					</div>
      	</div>
      </div>
    </div>
  </div>
</template>


<script>

import EditEvent from './EditEvent.vue'
import EditStats from './EditStats.vue'
import Stats from './Stats.vue'

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
			editingPastEvent: false,
			eventStats: [],
			newTitle: '',
			score: '',
		}
	},

	watch:
	{
		event()
		{
			this.editingPastEvent = false;
		},
	},

	events:
	{
		ViewEvent_cancel()
		{
			$('#viewEventModal').modal('hide');

			this.event = {
				start: 0,
				title: '',
				type: 0,
				id: 0,
			}
		},

		ViewEvent_view(id)
		{
			this.viewEvent(id);
		},

		ViewEvent_score(score)
		{
			this.score = score;
		},
	},

	computed:
	{
		/**
		 * Compute what to show as the title of the modal
		 */
		modalTitle()
		{
			if (this.event.title) {
				return this.event.title
			}
			else if (this.newTitle.length){
				return this.newTitle
			}
			else {
				return 'Add an Event';
			}
		},

		/**
		 * No event clicked, just show Add Event form
		 */
		newEvent()
		{
			return this.event.id === 0;
		},


		/**
		 * Event has NOT happened yet, user is admin
		 */
		canEditEvent()
		{
			return moment().isBefore(moment.utc(this.event.start * 1000)) && this.isAdmin;
		},

		/**
		 * Event has NOT happened yet, user is NOT an admin
		 */
		futureEvent()
		{
			return moment().isBefore(moment.utc(this.event.start * 1000)) && !this.isAdmin;
		},

		/**
		 * Event has happened, user is admin, event was a game
		 */
		canEditStats()
		{
			if (this.editingPastEvent) {
				// user wants to specifically edit the event regardless of date
				return false;
			}
			else {
				return moment().isAfter(moment.utc(this.event.start * 1000)) && this.isAdmin &&
										(this.event.type === 'home_game' || this.event.type === 'away_game');
			}
		},


		/**
		 * Event has happened, user is an admin, event was NOT a game
		 */
		pastEventNoStats()
		{
			if (this.editingPastEvent) {
				return false;
			}
			else {
				return moment().isAfter(moment.utc(this.event.start * 1000)) && this.isAdmin  &&
										(this.event.type !== 'home_game' && this.event.type !== 'away_game');
			}
		},


		/**
		 * Event has happened, user is NOT an admin, event was a game
		 */
		pastEventStats()
		{
			return moment().isAfter(moment.utc(this.event.start * 1000)) && !this.isAdmin  &&
										(this.event.type === 'home_game' || this.event.type === 'away_game');
		},


		/**
		 * Event has happened, user is NOT an admin, event was NOT a game
		 */
		pastEvent()
		{
			return moment().isAfter(moment.utc(this.event.start * 1000)) && !this.isAdmin && !this.pastEventStats;
		},

		/**
		 * Only for choosing how wide to make the modal window
		 */
		showStats()
		{
			if (this.editingPastEvent) {
				// user wants to specifically edit the event regardless of date
				return false;
			}
			else {
				return this.pastEventStats || this.canEditStats;
			}
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
      	return
			}

			// find the event data and stats for clicked event
			this.event = this.events.filter(event => event.id === id)[0];
			this.eventStats = this.stats.filter(stat => stat.event_id === id);

			if (! this.event) {
				// not viewing an event
				this.event = {
					start: 0,
					title: '',
					type: 0,
					id: 0,
				}
			}
			

			this.$broadcast('EditEvent_view', this.event);

      this.$root.showModal('viewEventModal');
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

.edit-button
	position relative
	display flex
	flex-flow row
	justify-content center
	.btn
		padding-left 14px
	#edit-chevron
		position absolute
		top 17px
		right -4px
		font-size 30px

.ViewEvent
	display flex
	flex-flow column
	align-items center
	.time
	.type
		font-size 30px
		margin-bottom 30px
		text-align center
		&.--practice
			color rc_blue
		&.--home_game
			color rc_red
		&.--away_game
			color rc_yellow
		&.--other
			color rc_green					
	.details
		font-size 18px
		text-align center
	
.outcome
	display flex
	align-items center
	font-size 25px
	color rc_med_gray
	margin-bottom 5px
	width 100%
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
	
.modal
	.stats-wrapper
		padding 15px
		
.type.--practice
	color rc_blue
.type.--home_game
	color rc_red
.type.--away_game
	color rc_yellow
.type.--other
	color rc_green					

.modal
	padding 0
.stats-modal
	.modal-dialog
		width 90%


</style>