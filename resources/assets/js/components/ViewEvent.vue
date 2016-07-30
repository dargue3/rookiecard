
<template>
		

    <div class="modal" :class="showStats ? 'stats-modal' : ''" id="viewEventModal">
    	<!-- modal window for viewing an event when clicked from the calendar -->
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>
            <h3 class="modal-title">{{ event.title }}&nbsp;</h3>
          </div>
          <div class="modal-body">
						<div class="row">


							<!-- the following shows the correct content based on date, event type, admin status, sport -->


						
							<!-- show stats if they aren't admin and is past event -->
							<rc-stats v-show="pastEventStats" type="event" :sport="team.sport" :stats="currStats" 
												:team="team" :players="players" :event="event" :team-cols="teamStatCols" :player-cols="playerStatCols"></rc-stats>


							<!-- show edit event page if admin and event is in the future -->
							<rc-edit-event v-show="canEditEvent || editEvent" :event="event" :edit-event.sync="editEvent"></rc-edit-event>



							<!-- if showing edit stats, choose the correct sport -->
							<div v-show="canEditStats">

								<rc-basketball v-if="team.sport === 'basketball'" :stats="currStats" :players="players" 
															:edit-event.sync="editEvent" :event="event" :team="team"></rc-basketball>
							</div>		


							<div v-show="pastEventNoStats" class="col-xs-12 ViewEvent">
								<div class="edit-button">
									<a class="btn btn-primary" @click="editEvent = true">Edit Event Details</a>
								</div>

								<div v-if="event.details" class="ViewEvent__details">
									<p>This event is over and wasn't set up as a Game, so there are no stats</p>
								</div>
	
							</div>										


							

							<div v-show="(futureEvent || pastEvent) && event.id" class="col-xs-12 ViewEvent">

								<div class="ViewEvent__type --{{ event.titleClass }}">{{ event.title }}</div>
								<div class="ViewEvent__time">{{ event.start | formatTimeString event.end }}</div>
								<div v-if="event.details" class="ViewEvent__details">{{ event.details }}</div>

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
import EditBasketballStats from './EditBasketballStats.vue'
import Stats from './Stats.vue'


export default  {
	
	name: 'ViewEvent',

	props: ['team', 'events', 'stats', 'players', 'admin', 'teamCols', 'playerCols'],

	components: {
		'rc-edit-event' 	: EditEvent,
		'rc-stats'				: Stats,
		'rc-basketball' 	: EditBasketballStats,
	},

	data() {
		var prefix = this.$parent.prefix;

		return {	
			prefix: prefix,
			event: {
				start: 0,
				title: '',
				type: 0,
			},
			teamStatCols: [],
			playerStatCols: [],
			editEvent: false,

			currStats: {},
		}
	},

	watch: {
		event() {
			// new event, reset this flag to hide EditEvent.vue
			this.editEvent = false;
		}
	},

	computed: {


		// FUTURE EVENTS

		// event has NOT happened yet, user is admin
		canEditEvent()
		{
			return moment().isBefore(moment.unix(this.event.start)) && this.admin;
		},

		// event has NOT happened yet, user is NOT an admin
		futureEvent()
		{
			return moment().isBefore(moment.unix(this.event.start)) && !this.admin;
		},


		// PAST EVENTS

		// event has happened, user is admin, event was a game
		canEditStats()
		{
			if(this.editEvent) {
				// user wants to specifically edit the event regardless of date
				return false;
			}
			else
				return moment().isAfter(moment.unix(this.event.start)) && this.admin &&
										(this.event.type === 'home_game' || this.event.type === 'away_game');
		},


		// event has happened, user is an admin, event was NOT a game
		pastEventNoStats()
		{
			if(this.editEvent)
				return false;
			else
				return moment().isAfter(moment.unix(this.event.start)) && this.admin  &&
										(this.event.type !== 'home_game' || this.event.type !== 'away_game');
		},


		// event has happened, user is NOT an admin, event was a game
		pastEventStats()
		{
			return moment().isAfter(moment.unix(this.event.start)) && !this.admin  &&
										(this.event.type === 'home_game' || this.event.type === 'away_game');
		},




		// event has happened, user is NOT an admin, event was NOT a game
		pastEvent()
		{
			return moment().isAfter(moment.unix(this.event.start)) && !this.admin && !this.pastEventStats;
		},


		// SOME EXTRA LOGIC FOR CHOOSING WHAT TO SHOW

		// only for choosing how wide to make the modal window
		showStats()
		{
			if(this.editEvent) {
				// user wants to specifically edit the event regardless of date
				return false;
			}
			else
				return this.pastEventStats || this.canEditStats;
		},
		
	},



	methods: {

		// find which event was clicked and display
		viewEvent(id)
		{
			// pass along event data
			var event = this.events.filter(function(event) {
				return event.id === id;
			});

			// pass along any existing user stats for this event
			var stats = this.stats.filter(function(stat) {
				return stat.event_id === id;
			});

			this.event = event[0];

			if(this.futureEvent || this.pastEvent) {
				// if just showing info about the event to a non admin, pick CSS class for title
				switch(this.event.type) {
					case 0:
						// practice
						this.event.titleClass = 'practice';
						break;
					case 1:
						// home game
						this.event.titleClass = 'home';
						break;
					case 2:
						// away game
						this.event.titleClass = 'away';
						break;
					case 3:
						// special event
						this.event.titleClass = 'other';
						break;
				}
			}
			
			this.currStats = stats;
			
			// show modal
      this.$root.showModal('viewEventModal')
    },
	},

	ready() {

		// attach jquery listeners for click on events
    // wait long enough to ensure calendar is fully loaded
    setTimeout(function() {
    		// for clicks on calendar events
        $('.Calendar__container').on('click touchstart', 'a.event-trigger', function(e) {
          this.viewEvent($(e.target).data('event-id'));
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
	div
		display flex
		flex-flow row wrap
		justify-content center
		text-align center
		font-size 25px
		margin-bottom 25px
		
.ViewEvent__details
	font-weight bold
	
.ViewEvent__type.--practice
	color rc_blue
.ViewEvent__type.--home
	color rc_red
.ViewEvent__type.--away
	color rc_yellow
.ViewEvent__type.--special
	color rc_green					

.modal
	padding 0
.stats-modal
	.modal-dialog
		width 90%


</style>