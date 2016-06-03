
<template>
  <div class="calendar-wrapper">
    <div class="filler"></div>

  	<div class="Calendar">

      <div id="calendarNav" class="row">
        <div class="col-xs-12 col-sm-6 Calendar__nav no-highlight ">
          <table id="calNav">
            <tr>
              <td id="chevLeft" @click="chevClick('Left')" data-cal-nav="prev">
                <a><i class="material-icons chevron">chevron_left</i></a>
              </td>
              <td id="calNavHeaderTable">
                <!-- h3 tag dynamically set by calendar.js -->
                <h3 class="Calendar__header"></h3>
              </td>
              <td id="chevRight" @click="chevClick('Right')" data-cal-nav="next">
                <a><i class="material-icons chevron">chevron_right</i></a>
              </td>
            </tr>
          </table>
        </div>
        <div class="col-xs-12 col-sm-6 Calendar__nav">
          <table id="addEventContainer">
            <tr>
              <td id='addEventIconDiv'>
                <a v-show="admin" id='addEventTrigger' @click="$root.showModal('addEventModal')">
                  <i id="addEventIcon" class="glyphicon glyphicon-plus"></i>
                  <span id="addEventText">Add an Event</span>
                </a>
              </td>
            </tr>
          </table>
        </div>
      </div>
      <div class="row">
          <div class="col-xs-12 Calendar__container">
              <div class="calendar"></div>
          </div>
      </div>

  	</div>
  </div> 
	
</template>




<script>

var animateEnd = 'webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend';
var rubberBand = 'animated rubberBand';

export default  {
	
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
          var month = this.getTitle();
          $('.Calendar__header').text(month);
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

      //attach the calendar when the DOM is ready
      self.calendar = $('.calendar').calendar(self.options);

      //hide tooltips if on mobile (they are annoying and counterintuitive)
      //give time for DOM to settle before checking
      setTimeout(function() {
        if(window.innerWidth < 767) {
          $('.calendar [data-toggle="tooltip"]').tooltip('destroy');
        }
      }, 1000);

    })
  },

	methods: {

    //events array changed, reload the calendar data
    compile() {

      //attach a new events array
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

    //format events for calendar
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
          case 0:
            //practice event
            temp.class = 'event-practice';
            break;
          case 1:
            //game event
            temp.class = 'event-homeGame';
            break;
          case 2:
            //game event
            temp.class = 'event-awayGame';
            break;  
          case 3:
            //other event
            temp.class = 'event-other';
            break;    
        }

        formattedEvents.push(temp);
      }

      return formattedEvents;
    },

    //formats the title with an appropriate date string
    formatEventTitle(title, start, end) {

      var startTime, endTime;    

      if(moment(start).isSame(end, 'day')) {
        //events on same day, drop date in title

        if((moment(start).hour() < 12 && moment(end).hour() < 12) ||
           (moment(start).hour() >= 12 && moment(end).hour() >= 12)) {
          //both are am or pm, drop that from string as well
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

    //animate click and switch month
    chevClick(direction) {
      
      var chevron = $('#chev' + direction);
      this.calendar.navigate(chevron.data('cal-nav'));

      //animate
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
  flex 3
  padding-bottom 3em

.Calendar__nav
  margin-top 15px
  .chevron
    font-size 44px
    margin-top 7px

.Calendar__header
  margin 0
  width 190px
  text-align center       

.Calendar__container
  margin-top 45px
  max-width 775px
  background whitesmoke
  .calendar
    background lighten(whitesmoke, 40%)

div
  .cal-row-head .cal-cell1
    background whitesmoke

#calendarNav
  height 54px
  div
    padding-left 0

table#calNav
  @media only screen and (max-width 767px)
    margin auto

#calNavHeaderTable
  padding 0

#addEventContainer
  float right
  margin-top 17px
  @media only screen and (max-width 767px)
    text-align center
    margin auto
    margin-top 15px
    margin-bottom 15px
    float none

#addEventIcon
  margin 0 auto

#addEventText
  position relative
  font-size 16px
  left 3px

#addEventIconDiv
  margin-top 4px

#addEventIconDiv
  width 100%
  text-align right
    
#addEventDiv
  padding-bottom 15px 

#chevRight
#chevLeft
  position relative
  -webkit-animation-duration 0.2s
  -animation-duration 0.2s
  &:hover
    cursor pointer
    


//the following classes are overwriting the classes in bootstrap-calendar css
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