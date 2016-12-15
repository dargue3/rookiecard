<template>
  <div class="calendar-wrapper">
    <div class="filler"></div>

  	<div class="Calendar">
      <div class="Calendar__header">
        <div class="month-nav">
          <a chevron="prev" v-touch:tap="chevron('prev')"><i class="material-icons chevron">chevron_left</i></a>
          <h3 class="Calendar__nav"></h3>
          <a chevron="next" v-touch:tap="chevron('next')"><i class="material-icons chevron">chevron_right</i></a>
        </div>
        
        <div v-show="isAdmin" class="add-event">
          <a id="addEventTrigger">
            <i class="glyphicon glyphicon-plus"></i>
            <span>Add an Event</span>
          </a>
        </div>
      </div>
      <div v-if="differentTimezone" class="Calendar__timezone blue-container">
        <span>This team is in a different timezone than you. Dates have been adjusted to your timezone.</span>
      </div>
      <div class="Calendar__container">
          <div class="calendar"></div>
      </div>
  	</div>

    <div class="filler"></div>
  </div> 
	
</template>

<script>

export default 
{
	name: 'Calendar',

	props: ['isAdmin', 'events', 'timezone'],

	data() {

    let firstDayOfYear = moment().dayOfYear(1).hour(0).minute(0).unix() * 1000;

    return {
      calendar: '',
      options: {
        events_source: [],
        modal: '#events-modal',
        first_event: firstDayOfYear,
        onAfterViewLoad: function(view) {
          $('.Calendar__nav').text(this.getTitle());
        },
        classes: {
          months: {
            general: 'label'
          }
        }
      },
    }

	},

  watch:
  {
    events()
    {
      this.compile();
    },
  },

  events:
  {
    /**
     * Data has been fetched from the server
     */
    dataReady()
    {
      this.compile();
    },
  },

  computed:
  {
    differentTimezone()
    {
      return this.timezone !== jstz.determine().name();
    },
  },

	methods:
  {
    /**
     * Reload the calendar's data
     */
    compile()
    {
      this.calendar = $('.calendar').calendar(this.options);

      // attach a new events array
      let events = this.formatEvents();
      if (events.length) {
        var firstEvent = events[0].start;
      }
      else {
        var firstEvent = moment().dayOfYear(1).hour(0).minute(0).unix() * 1000;
      }

      this.calendar.setOptions({ 
        events_source: events,
        first_event: firstEvent
      });

      this.calendar.view();
    },

    /**
     * Format the event data for bootstrap calendar.js consumption
     * 
     * @return {array}
     */
    formatEvents() {

      var formattedEvents = [];

      for(var x = 0; x < this.events.length; x++) {
        var event = this.events[x];
        var temp = {};

        temp.id = event.id;
        temp.start = event.start * 1000;
        temp.end = event.end * 1000;
        temp.title = this.formatEventTitle(event.title, temp.start, temp.end);

        switch(event.type) {
          case 'practice':
            // practice event
            temp.class = 'event-practice';
            break;
          case 'home_game':
            // game event
            temp.class = 'event-homeGame';
            break;
          case 'away_game':
            // game event
            temp.class = 'event-awayGame';
            break;  
          case 'other':
            // other event
            temp.class = 'event-other';
            break;    
        }

        formattedEvents.push(temp);
      }

      return formattedEvents;
    },

    /**
     * Create a human readable format to use in the tooltips
     * 
     * @param  {string} title 
     * @param  {int} start 
     * @param  {int} end   
     * @return {string}       
     */
    formatEventTitle(title, start, end) {

      var startTime, endTime;    

      if(moment(start).isSame(end, 'day')) {
        // events on same day, drop date in title

        if((moment(start).hour() < 12 && moment(end).hour() < 12) ||
           (moment(start).hour() >= 12 && moment(end).hour() >= 12)) {
          // both are am or pm, drop that from string as well
          var startTime = moment(start).format('h:mm');
          var endTime   = moment(end).format('h:mm a');
        }
        else {
          var startTime = moment(start).format('h:mm a');
          var endTime   = moment(end).format('h:mm a');
        }
        return title + " — " + startTime + " – " + endTime;
      }
      else {
        return title + " — " + moment(start).format('MMM. Do h:mm a') + ' - ' + 
                moment(end).format('MMM. Do h:mm a')
      }
    },


    /**
     * Animate the chevron and move the calendar view
     * 
     * @param  {string} direction 
     * @return {void}           
     */
    chevron(direction) {
      let animateEnd = 'webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend';
      let rubberBand = 'animated rubberBand';

      this.calendar.navigate(direction);

      let chevron = $('[chevron="' + direction + '"]')

      // animate chevron
      chevron.addClass(rubberBand).one(animateEnd, function(){
        chevron.removeClass(rubberBand);
      });
    },
		
	},

  ready()
  {
    let self = this;
    $(function() {
      // hide tooltips if on mobile (they are annoying and counterintuitive)
      // give time for DOM to settle before checking
      setTimeout(function() {
        if ($(window).width() < 767) {
          $('.calendar [data-toggle="tooltip"]').tooltip('destroy');
        }
      }, 1000);
    })
  },


};


</script>




<style lang="stylus">

@import '/resources/assets/stylus/variables.styl'

.calendar-wrapper
  display flex 
  flex-flow row
  .filler
    flex 1

.Calendar
  display flex
  flex-flow row wrap
  flex-basis 775px
  padding 0 15px 3em 15px

.Calendar__header
  flex-basis 100%
  display flex
  justify-content center
  margin-top 15px
  +mobile()
    flex-flow column
    align-items center
  .month-nav
    display flex
    user-select none
    flex 1
    +mobile()
      justify-content center
  .add-event
    display flex
    align-items center
    justify-content flex-end
    font-size 16px
    flex 1
    +mobile()
      margin-top 65px

.Calendar__nav
  margin 0
  margin-top 11px
  width 190px
  text-align center     
  
.Calendar__timezone
  display flex
  flex-flow row
  justify-content center
  align-items center
  text-align center
  margin-top 15px
  width 100%
  height 50px
  font-weight bold

.Calendar__container
  flex-basis 100%
  margin-top 45px
  max-width 775px
  background whitesmoke
  +mobile()
    margin-top 30px
  .calendar
    background lighten(whitesmoke, 40%)

div
  .cal-row-head .cal-cell1
    background whitesmoke



a[chevron="prev"]
a[chevron="next"]
  position relative
  -webkit-animation-duration 0.2s
  -animation-duration 0.2s
  .chevron
    font-size 44px
    &:hover
      cursor pointer
    


// the following classes are overwriting the classes in bootstrap-calendar css
#cal-day-box .day-highlight.dh-event-awayGame
  border 1px solid rc_yellow
#cal-day-box .day-highlight.dh-event-homeGame
  border 1px solid rc_red
#cal-day-box .day-highlight.dh-event-practice
  border 1px solid rc_blue
#cal-day-box .day-highlight.dh-event-other
  border 1px solid rc_green
  
.event-homeGame
  background-color rc_red
.event-awayGame
  background-color rc_yellow
.event-practice
  background-color rc_blue
.event-other
  background-color rc_green

.day-highlight.dh-event-homeGame:hover,
.day-highlight.dh-event-homeGame
  background-color rc_red
  opacity 0.5
.day-highlight.dh-event-awayGame:hover,
.day-highlight.dh-event-awayGame
  background-color rc_yellow
  opacity 0.5
.day-highlight.dh-event-practice:hover,
.day-highlight.dh-event-practice
  background-color rc_blue
  opacity 0.5
.day-highlight.dh-event-other:hover,
.day-highlight.dh-event-other
  background-color rc_green
  opacity 0.5

</style>