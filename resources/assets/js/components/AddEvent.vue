
<template>
	
	<div id="addEventDiv" class="col-xs-12">
    <form @submit.prevent="createEvent()">

	    <div class="row">
        <div class="form-group">
          <div class="col-xs-12 col-sm-6">
            <label for="title">Title</label>
            <input type="text" name="title" class="form-control"
            				placeholder="vs. Georgia Tech" required v-model="title"
            				autocomplete="off">
          </div>
          <div class="col-xs-12 col-sm-6">
            <label for="eventClass">Type</label>
            <select v-model="eventClass" data-style="btn-select btn-lg"
                    name="eventClass" class="selectpicker add-event form-control show-tick">
              <option value='0' class="practice">Practice</option>    
              <option value='1' class="homeGame">Home Game</option>
              <option value='2' class="awayGame">Away Game</option>
              <option value='3' class="other">Other</option>
            </select>
          </div>
        </div>
	    </div>
	    <br>
	    <div class="row">
        <div class='col-xs-12 col-sm-6'>
          <div class="form-group">
						<!-- from - date -->
            <label for="from">Starts at</label>
            <div class='input-group date picker-from'>
          		<input type="text" name="from" class="form-control" required>
              <span class="input-group-addon">
              	<span class="glyphicon glyphicon-calendar"></span>
              </span>
            </div>
						<!-- from - time -->
            <div class='input-group date picker-from-time'>
          		<input type="text" name="from" class="form-control" required>
              <span class="input-group-addon">
              	<span class="glyphicon glyphicon-time"></span>
              </span>
            </div>
          </div>
        </div>
        <div class='col-xs-12 col-sm-6'>
          <div class="form-group">
            <label for="to">Ends at <span class="form-error" v-show="endsError">Event ends before it starts!</span></label>
            <div class='input-group date picker-to'>
              <input type="text" name="to" class="form-control" required>
              <span class="input-group-addon">
                <span class="glyphicon glyphicon-calendar"></span>
              </span>
            </div>
            <!-- to - time -->
            <div class='input-group date picker-to-time'>
              <input type="text" name="to" class="form-control" required>
              <span class="input-group-addon">
                <span class="glyphicon glyphicon-time"></span>
              </span>
            </div>
          </div>
        </div>
	    </div>
	    <br>
	    <div class="row">
        <div class="col-xs-12">
          <div class="form-group">
          	<input type="checkbox" value="1" v-model="repeats">
              <span>&nbsp;&nbsp;This event repeats...</span>
          </div>
				</div>
	    </div>
	    <div id="repeatDaysDiv" class="row" v-show="repeats" transition="slide-sm" >
        <div class="form-group">
          <div class="col-xs-12 col-sm-6">
            <label for="repeatDays">Every</label>
            <select name="repeatDays[]" class="selectpicker form-control show-tick" data-style="btn-select btn-lg"
                    data-selected-text-format="count>2" title="" multiple v-model="repeatDays">
                <option>Sunday</option>
                <option>Monday</option>
                <option>Tuesday</option>
                <option>Wednesday</option>
                <option>Thursday</option>
                <option>Friday</option>
                <option>Saturday</option>
            </select>
          </div>
          <div class="col-xs-12 col-sm-6">
            <label for="until">Until<span class="form-error" v-show="untilError">Until date must be after the end date</span></label>
            <div class='input-group date picker-until'>
              <input type="text" name="until" class="form-control">
              <span class="input-group-addon">
                <span class="glyphicon glyphicon-calendar"></span>
              </span>
            </div>
          </div>
          <br>
        </div>
	    </div>
	    <br>
	    <br>
	    <div id="eventDetailsDiv" class="row">
        <div class="col-xs-12">
          <label for="eventClass">Extra details about this event</label>
          <textarea v-autosize="details" name="details" class="form-control" maxlength="5000" rows="1"
          				 placeholder="Remember your water bottle!" v-model="details"></textarea>
        </div>
	    </div>
    	<hr>
    	<br>
	    <div class="row">
	      <div class="col-xs-6 col-xs-offset-3 col-sm-4 col-sm-offset-2">
	      	<input type="submit" class="btn btn-primary btn-block btn-md btn-first" value="SAVE">
	      </div>
	      <div class="col-xs-6 col-xs-offset-3 col-sm-4 col-sm-offset-0">
          <a id="addEventCancel" @click="discardEvent()" class="btn btn-cancel btn-block btn-md outline">CANCEL</a>
	      </div>
	    </div>
    </form>
	</div>
		

	
</template>


<script>

export default  {
	
	name: 'AddEvent',

	props: [],


	data() {

		return {
			title: '',
			eventClass: '0',
			fromDate: '',
			fromTime: '',
			toDate: '',
			toTime: '',
			toPickerChange: 0,
			repeats: false,
			repeatDays: [],
			untilPickerChange: 0,
			until: '',
			details: '',
			endsError: false,
			untilError: false,
		}
		
	},


	methods: {


		//submit post request
		createEvent() {

			this.endsError = false;
			this.untilError = false;
			var error = false;

			//incase model wasn't updated (user skipped a blur and submitted)
			this.fromDate = $('.picker-from input[name="from"]').val();
			this.toDate = $('.picker-to input[name="to"]').val();
			this.until = $('.picker-until input[name="until"]').val();

			//check for end dates < start dates
			//until dates < end dates
			var momentTo = moment(this.toDate + ' ' + this.toTime, 'MMM D, YYYY h:mm a');
			var momentFrom = moment(this.fromDate + ' ' + this.fromTime, 'MMM D, YYYY h:mm a');
			var momentUntil = moment(this.until, 'MMM D, YYYY');

			if(moment(momentTo).isBefore(moment(momentFrom))) {
				this.endsError = true;
				error = true;
			}

			if(moment(momentUntil).isBefore(moment(momentFrom)) && this.repeats) {
				this.untilError = true;
				error = true;
			}


			//if no error, send the post request
			if(!error) {

				var newEvent = {
					title: this.title,
					eventClass: this.eventClass,
					fromDate: this.fromDate,
					fromTime: this.fromTime,
					toDate: this.toDate,
					toTime: this.toTime,
					until: this.until,
					repeats: this.repeats,
					repeatDays: this.repeatDays,
					details: this.details,
				};

				var self = this;
				var url = this.$parent.prefix + '/events'; 
				this.$http.post(url, newEvent)
				.then(function(response) {
					//if successful, save new data, show success banner

					self.$dispatch('newEvent', response.data.events, response.data.feed);
	
					$('#addEventModal').modal('hide');

					if(self.repeats) //plural
						var msg = "Your events have been added to the calendar";
					else
						var msg = "Your event has been added to the calendar";

					self.$root.banner('good', msg);

					self.reinitializeData();

				})
				.catch(function(response) {
					//if unsuccessful, show error message
					self.$root.banner('bad', "There was a problem adding your event... try again?");
				});
			}
			
		},

		//discard button was clicked
		discardEvent() {
			$('#addEventModal').modal('hide');

			this.reinitializeData();

		  //set datetimepickers back to normal
		  $('.picker-from').data('DateTimePicker').date(this.momentFrom);
		  $('.picker-to').data('DateTimePicker').date(this.momentTo);
		  $('.picker-until').data('DateTimePicker').date(this.momentUntil);
		  $('.picker-from-time').data('DateTimePicker').date(this.momentFrom);
		  $('.picker-to-time').data('DateTimePicker').date(this.momentTo);

		},


		//set newEvent object back to default values
		reinitializeData() {

			//initialize dates to 'tomorrow at 6:00 - 8:00 pm'
			//untilDate is used for repeating events, initialize to a week after event starts
			var fromDate 	= moment().add(1, 'day').hour(18).minute(0).second(0);
			var toDate 		= moment().add(1, 'day').hour(20).minute(0).second(0);
			var untilDate = moment().add(8, 'day').hour(20).minute(0).second(0);

	    
		  
	  	this.title =  '';
			this.eventClass =  '0';
			this.fromDate =  fromDate.format('MMM D, YYYY');
			this.fromTime =  fromDate.format('h:mm a');
			this.toDate =  toDate.format('MMM D, YYYY');
			this.toTime =  toDate.format('h:mm a');
			this.until =  untilDate.format('MMM D, YYYY');
			this.toPickerChange =  false;
			this.repeats =  false;
			this.repeatDays =  [];
			this.untilPickerChange =  false;
			this.details =  '';
			this.momentFrom =  fromDate;
			this.momentTo =  toDate;
			this.momentUntil =  untilDate;

		  this.endsError = false;
		  this.untilError = false;
			
		},



	},

	ready() {
		
		$(function() {

			this.reinitializeData();


		  $('.selectpicker').selectpicker({

		  });

		  var fromDate = this.momentFrom;
		  var toDate = this.momentTo;
		  var untilDate = this.momentUntil;

		  //datepickers for adding events, sel
		  var fromPicker  = $('.picker-from');
		  var toPicker    = $('.picker-to');
		  var untilPicker = $('.picker-until');
		  var fromPickerTime  = $('.picker-from-time');
		  var toPickerTime    = $('.picker-to-time');

		  fromPicker.datetimepicker({
		    allowInputToggle: true,
		    focusOnShow: true,
		    format: 'MMM D, YYYY',
		    defaultDate: fromDate
		  })
		  .on('dp.change', function(e) { 

		  	//when 'from' changes, save this new date into the state
		  	//set 'to' and 'until' minimum dates so they don't end before it starts
		  	this.fromDate = e.date.format('MMM D, YYYY');
		  	toPicker.data('DateTimePicker').minDate(e.date);

		  	if(!this.toPickerChange)
		  		//if the toPicker (date) hasn't been manually set yet, default it to this new fromDate 
		  		toPicker.data('DateTimePicker').date(e.date);

		  	untilPicker.data('DateTimePicker').minDate(e.date.add(1, 'week'));
		  	

		  }.bind(this));

		  toPicker.datetimepicker({
	      allowInputToggle: true,
	      focusOnShow: true,
	      format: 'MMM D, YYYY',
	      defaultDate: toDate

		  })
		  .on('dp.change', function(e) {

		  	this.toDate = e.date.format('MMM D, YYYY');
		  	this.toPickerChange = true;
		  	untilPicker.data('DateTimePicker').minDate(e.date.add(1, 'week'));
		  	

		  }.bind(this));

		  untilPicker.datetimepicker({
	      stepping: 5,
	      allowInputToggle: true,
	      focusOnShow: true,
	      format: 'MMM D, YYYY',
	      defaultDate: untilDate
		  })
		  .on('dp.change', function(e) {

		  	this.until = e.date.format('MMM D, YYYY');

		  }.bind(this));

		  fromPickerTime.datetimepicker({
	      stepping: 5,
	      allowInputToggle: true,
	      focusOnShow: true,
	      format: 'h:mm a',
	      defaultDate: fromDate
		  })
		  .on('dp.change', function(e) {

		  	this.fromTime = e.date.format('h:mm a');

		  }.bind(this));

		  toPickerTime.datetimepicker({
	      stepping: 5,
	      allowInputToggle: true,
	      focusOnShow: true,
	      format: 'h:mm a',
	      defaultDate: toDate
		  })
		  .on('dp.change', function(e) {

		  	this.toTime = e.date.format('h:mm a');

		  }.bind(this));

		  this.toPickerChange = false;
		  this.untilPickerChange = false;

		}.bind(this));
	}

};






</script>

<style lang="stylus">

@import '/resources/assets/stylus/variables.styl'

#addEventCancel
	@media screen and (max-width 767px)
		margin-left 0px
//for the colors of the 'event type' dropdown
.homeGame
	color rc_red !important
.awayGame
	color rc_yellow !important
.practice
	color rc_blue !important
.other
	color rc_green !important



</style>






