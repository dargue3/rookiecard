
<template>
	
    <div id="viewEventModal" class="modal" :class="showStats ? 'stats-modal' : ''" >
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
							<stats v-if="pastEventStats" type="event" :sport="team.sport" 
												:stats="eventStats" :team="team" :players="players" :event="event"
												:keys="statKeys">
							</stats>

							<!-- show edit event page if admin and event is in the future -->
							<edit-event v-if="canEditEvent || editingPastEvent" :event="event" :editing-past-event.sync="editingPastEvent">
							</edit-event>


							<!-- if showing edit stats, choose the correct sport -->
							<div v-if="canEditStats">
								<edit-stats v-if="team.sport === 'basketball'" :event-stats="eventStats" :players="players" 
														:edit-event.sync="editingPastEvent" :event="event" :team="team" :keys="statKeys">
								</edit-stats>
							</div>		


							<div v-if="pastEventNoStats" class="col-xs-12 ViewEvent">

								<div class="edit-button">
									<a class="btn btn-primary" @click="editingPastEvent = true">Edit Event Details</a>
								</div>

								<div v-if="event.details" class="ViewEvent__details">
									<p>This event is over and wasn't set up as a Game, so there are no stats</p>
								</div>

							</div>										


							

							<div v-if="(futureEvent || pastEvent) && event.id" class="col-xs-12 ViewEvent">

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
import EditStats from './EditStats.vue'
import Stats from './Stats.vue'


export default  {
	
	name: 'ViewEvent',

	props: ['team', 'events', 'stats', 'players', 'isAdmin', 'statKeys'],

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
			},
			editingPastEvent: false,
			eventStats: [],
		}
	},

	watch:
	{
		event()
		{
			this.editingPastEvent = false;
		},
	},

	computed:
	{
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
			if(this.editingPastEvent) {
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
			if(this.editingPastEvent) {
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
			if(this.editingPastEvent) {
				// user wants to specifically edit the event regardless of date
				return false;
			}
			else
				return this.pastEventStats || this.canEditStats;
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
			// don't do anything if this is the same event that was clicked previously
			if (this.event.id === id) {
      	this.$root.showModal('viewEventModal')
      	return
			}

			this.event = this.events.filter(event => event.id === id)[0];
			this.eventStats = this.stats.filter(stat => stat.event_id === id);

			if(this.futureEvent || this.pastEvent) {
				// if just showing info about the event to a non admin, pick CSS class for title
				switch(this.event.type) {
					case 0:
						this.event.titleClass = 'practice';
						break;
					case 1:
						this.event.titleClass = 'home';
						break;
					case 2:
						this.event.titleClass = 'away';
						break;
					case 3:
						this.event.titleClass = 'other';
						break;
				}
			}
			
			// show modal
      this.$root.showModal('viewEventModal')
    },
	},

	ready()
	{
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