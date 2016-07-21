<template>
  <div class="calendar-wrapper">
    <div class="filler"></div>

  	<div class="Calendar">
      <div class="Calendar__nav">

        <div class="nav">
          <a chevron="prev" @click="chevron('prev')"><i class="material-icons chevron">chevron_left</i></a>
          <h3 class="Calendar__header"></h3>
          <a chevron="next" @click="chevron('next')"><i class="material-icons chevron">chevron_right</i></a>
        </div>
        
        <div class="add-event">
          <a v-show="admin" @click="$root.showModal('addEventModal')">
            <i class="glyphicon glyphicon-plus"></i>
            <span>Add an Event</span>
          </a>
        </div>
    
      </div>
      <div class="Calendar__container">
          <div class="calendar"></div>
      </div>
  	</div>

    <div class="filler"></div>
  </div> 
	
</template>

<script>
var animateEnd = 'webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend';
var rubberBand = 'animated rubberBand';

export default 
{
	name: 'Calendar',

	props: ['admin', 'events'],

	data() {

    var firstDayOfYear = moment().dayOfYear(1).hour(0).minute(0).unix() * 1000;

    return {
      calendar: '',
      options: {
        events_source: [],
        modal: '#events-modal',
        first_event: firstDayOfYear,
        onAfterViewLoad: function(view) {
          $('.Calendar__header').text(this.getTitle());
        },
        classes: {
          months: {
            general: 'label'
          }
        }
      },
    }

	},

  watch: {
    events() {
      this.compile();
    }
  },

  ready() {

    var self = this;
    $(function() {

      // attach the calendar when the DOM is ready
      self.calendar = $('.calendar').calendar(self.options);

      // hide tooltips if on mobile (they are annoying and counterintuitive)
      // give time for DOM to settle before checking
      setTimeout(function() {
        if(window.innerWidth < 767) {
          $('.calendar [data-toggle="tooltip"]').tooltip('destroy');
        }
      }, 1000);

    })
  },

	methods: {

    // events array changed, reload the calendar data
    compile() {

      // attach a new events array
      var events = this.formatEvents();
      if(events.length)
        var firstEvent = events[0].start;
      else
        var firstEvent = moment().dayOfYear(1).hour(0).minute(0).unix() * 1000;

      this.calendar.setOptions({ 
        events_source: events,
        first_event: firstEvent
      });

      this.calendar.view();
    },

    // format events for calendar
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

    // formats the title with an appropriate date string
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

    // animate click and switch month
    chevron(direction) {
      this.calendar.navigate(direction);

      var chevron = $('[chevron="' + direction + '"]')

      // animate chevron
      chevron.addClass(rubberBand).one(animateEnd, function(){
        chevron.removeClass(rubberBand);
      });
    },
		
	},


};


</script>




<style lang="stylus">

.calendar-wrapper
  display flex 
  flex-flow row
  .filler
    flex 1

.Calendar
  display flex
  flex-flow row wrap
  flex-basis 775px
  padding-bottom 3em

.Calendar__nav
  flex-basis 100%
  display flex
  justify-content center
  margin-top 15px
  .nav
    display flex
    flex 1
  .add-event
    a
      float right
    margin 10px 15px 0px 0px
    font-size 16px
    flex 1

.Calendar__header
  margin 0
  margin-top 9px
  width 190px
  text-align center     

.Calendar__container
  flex-basis 100%
  margin-top 45px
  max-width 775px
  background whitesmoke
  padding 0px 15px
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
  &:hover
    cursor pointer
  .chevron
    font-size 44px
    


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
  opacity 0.75
.day-highlight.dh-event-awayGame:hover,
.day-highlight.dh-event-awayGame
  background-color rc_yellow
  opacity 0.75
.day-highlight.dh-event-practice:hover,
.day-highlight.dh-event-practice
  background-color rc_blue
  opacity 0.75
.day-highlight.dh-event-other:hover,
.day-highlight.dh-event-other
  background-color rc_green
  opacity 0.75

</style>