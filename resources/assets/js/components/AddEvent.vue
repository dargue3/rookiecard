
<template>
	
	<div id="addEventDiv" class="col-xs-12">
    <form @submit.prevent="save()">

	    <div class="row">
        <div class="form-group">
          <div class="col-xs-12 col-sm-6">
            <label>Title</label>
            <input type="text" class="form-control" :class="{'form-error' : errors.title }"
            				placeholder="vs. Georgia Tech" maxlength="50" v-model="title"
            				autocomplete="off">
            <span v-show="errors.title" class="form-error">{{ errors.title }}</span>
          </div>
          <div class="col-xs-12 col-sm-6">
            <label>Type</label>
            <select v-model="type" data-style="btn-select btn-lg"
                    class="selectpicker form-control show-tick" AddEvent>
              <option value="practice" class="practice">Practice</option>    
              <option value="home_game" class="homeGame">Home Game</option>
              <option value="away_game" class="awayGame">Away Game</option>
              <option value="other" class="other">Other</option>
            </select>
          </div>
        </div>
	    </div>
	    <br>
	    <div class="row">
        <div class='col-xs-12 col-sm-6'>
          <div class="form-group">
						<!-- from - date -->
            <label>Starts at</label>
            <div class="input-group date" AddEvent="fromDate">
          		<input type="text" class="form-control" :class="{'form-error' : errors.start }">
              <span class="input-group-addon">
              	<span class="glyphicon glyphicon-calendar"></span>
              </span>
            </div>
						<!-- from - time -->
            <div class="input-group date" AddEvent="fromTime">
          		<input type="text" class="form-control" :class="{'form-error' : errors.start }">
              <span class="input-group-addon">
              	<span class="glyphicon glyphicon-time"></span>
              </span>
            </div>
            <span v-show="errors.start" class="form-error">{{ errors.start }}</span>
          </div>
        </div>
        <div class='col-xs-12 col-sm-6'>
          <div class="form-group">
            <label>Ends at</label>
            <div class="input-group date" AddEvent="toDate">
              <input type="text" class="form-control" :class="{'form-error' : errors.end }">
              <span class="input-group-addon">
                <span class="glyphicon glyphicon-calendar"></span>
              </span>
            </div>
            <!-- to - time -->
            <div class="input-group date" AddEvent="toTime">
              <input type="text" class="form-control" :class="{'form-error' : errors.end }">
              <span class="input-group-addon">
                <span class="glyphicon glyphicon-time"></span>
              </span>
            </div>
            <span v-show="errors.end" class="form-error">{{ errors.end }}</span>
          </div>
        </div>
	    </div>
	    <br>
	    <div class="row">
        <div class="col-xs-12">
          <div class="switch-container">
						<input type="checkbox" bootstrap-switch="AddEvent">
						<span class="switch-label">This event repeats...</span>
					</div>
				</div>
	    </div>
	    <div id="repeatDaysDiv" class="row" v-show="repeats" transition="slide-sm" >
        <div class="form-group">
          <div class="col-xs-12 col-sm-6" :class="{'form-error' : errors.days }">
            <label for="days">Every</label>
            <select name="days[]" class="selectpicker form-control show-tick" data-style="btn-select btn-lg"
                    data-selected-text-format="count>2" title="" multiple v-model="days">
                <option>Sunday</option>
                <option>Monday</option>
                <option>Tuesday</option>
                <option>Wednesday</option>
                <option>Thursday</option>
                <option>Friday</option>
                <option>Saturday</option>
            </select>
            <span v-show="errors.days" class="form-error">{{ errors.days }}</span>
          </div>
          <div class="col-xs-12 col-sm-6">
            <label for="until">Until</label>
            <div class="input-group date" AddEvent="until">
              <input type="text" class="form-control" :class="{'form-error' : errors.until }">
              <span class="input-group-addon">
                <span class="glyphicon glyphicon-calendar"></span>
              </span>
            </div>
            <span v-show="errors.until" class="form-error">{{ errors.until }}</span>
          </div>
          <br>
        </div>
	    </div>
	    <br>
	    <br>
	    <div id="eventDetailsDiv" class="row">
        <div class="col-xs-12">
          <label>Extra details about this event</label>
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

	props: ['newEventTitle'],


	data() {

		return {
			title: '',
			type: 'practice',
			fromDate: '',
			fromTime: '',
			toDate: '',
			toTime: '',
			toPickerChange: false,
			repeats: false,
			days: [],
			untilPickerChange: false,
			until: '',
			details: '',
			endsError: false,
			untilError: false,
			errors: {
				title: '',
				start: '',
				end: '',
				until: '',
				days: '',
			},
			switchInit: false,
		}
	},

	watch:
	{
		title()
		{
			this.newEventTitle = this.title;
		},
	},


	methods:
	{
		/**
		 * Save the new event to the database
		 */
		save()
		{
			let errors = this.errorCheck();

			if (errors) {
				// errors are displayed, let them fix
				return;
			}

			// if no error, send the post request

			let momentTo = moment(this.toDate + ' ' + this.toTime, 'MMM D, YYYY h:mm a');
			let momentFrom = moment(this.fromDate + ' ' + this.fromTime, 'MMM D, YYYY h:mm a');
			let momentUntil = moment(this.until, 'MMM D, YYYY');

			let newEvent = {
				title: this.title,
				type: this.type,
				start: momentFrom.unix(),
				end: momentTo.unix(),
				details: this.details,
			};

			if (this.repeats) {
				// if the event repeats, add this extra data with the request	
				newEvent.until = momentUntil.unix();
				newEvent.repeats = true;
				newEvent.days = this.days;
			}

			let self = this;
			let url = this.$parent.prefix + '/event'; 
			this.$http.post(url, newEvent)
				.then(function(response) {
					if (! response.data.ok) {
						throw response.data.error;
					}

					self.$dispatch('newEvent', response.data.events, response.data.feed);

					$('#addEventModal').modal('hide');

					if (self.repeats) {
						// plural
						let msg = "Events saved";
					}
					else {
						let msg = "Event saved";
					}

					self.$root.banner('good', msg);

					self.reinitializeData();
					self.resetPickers();
				})
				.catch(function(response) {
					// with a validated request, an error is thrown but laravel let's us supply an error message
					self.$root.errorMsg(response.data.error);
				});
		
		},


		// make sure there are no errors before saving data
		errorCheck() {
			let errors = 0;

			if (!this.title.length) {
				errors++;
				this.errors.title = 'Enter a title';
			}
			else {
				this.errors.title = '';
			}

			if (!this.toDate.length || !this.toTime.length)  {
				errors++;
				this.errors.end = 'Choose an end date and time';
			}
			else {
				this.errors.end = '';
			}

			if (!this.fromDate.length || !this.fromTime.length) {
				errors++;
				this.errors.start = 'Choose an end date and time';
			}
			else {
				this.errors.start = '';
			}

			if (this.repeats) {
				if (!this.days.length) {
					errors++;
					this.errors.days = 'Which days does it repeat?';
				}
				else {
					this.errors.days = '';
				}
				if (!this.until.length) {
					errors++;
					this.errors.until = 'When does it repeat until?'
				}
				else {
					this.errors.until = '';
				}
			}

			if (errors) {
				// if any of these failed, solve those issues first
				return errors;
			}


			// check for end dates < start dates
			// until dates < end dates
			let momentTo = moment(this.toDate + ' ' + this.toTime, 'MMM D, YYYY h:mm a');
			let momentFrom = moment(this.fromDate + ' ' + this.fromTime, 'MMM D, YYYY h:mm a');
			let momentUntil = moment(this.until, 'MMM D, YYYY');

			if (!momentTo.isAfter(momentFrom)) {
				errors++;
				this.errors.end = 'Ends before it starts';
			}
			else {
				this.errors.end = '';
			}

			if (!momentUntil.isAfter(momentTo) && this.repeats) {
				errors++;
				this.errors.until = 'Stops repeating before the event ends';
			}
			else {
				this.errors.until = '';
			}

			return errors;
		},

		// discard button was clicked
		discardEvent() {
			$('#addEventModal').modal('hide');

			this.reinitializeData();

			this.resetPickers();

		},

		resetPickers() {
			// set datetimepickers back to normal
		  $('div[AddEvent="fromDate"]').data('DateTimePicker').date(this.momentFrom);
		  $('div[AddEvent="toDate"]').data('DateTimePicker').date(this.momentTo);
		  $('div[AddEvent="until"]').data('DateTimePicker').date(this.momentUntil);
		  $('div[AddEvent="fromTime"]').data('DateTimePicker').date(this.momentFrom);
		  $('div[AddEvent="toTime"]').data('DateTimePicker').date(this.momentTo);
		},


		// set newEvent object back to default values
		reinitializeData() {

			// initialize dates to 'tomorrow at 6:00 - 8:00 pm'
			// untilDate is used for repeating events, initialize to a week after event starts
			let fromDate 	= moment().add(1, 'day').hour(18).minute(0).second(0);
			let toDate 		= moment().add(1, 'day').hour(20).minute(0).second(0);
			let untilDate = moment().add(8, 'day').hour(20).minute(0).second(0);

	  	this.title =  '';
			this.eventClass =  '0';
			this.fromDate =  fromDate.format('MMM D, YYYY');
			this.fromTime =  fromDate.format('h:mm a');
			this.toDate =  toDate.format('MMM D, YYYY');
			this.toTime =  toDate.format('h:mm a');
			this.until =  untilDate.format('MMM D, YYYY');
			this.toPickerChange =  false;
			this.untilPickerChange =  false;
			this.repeats =  false;
			this.days =  [];
			this.details =  '';
			this.momentFrom =  fromDate;
			this.momentTo =  toDate;
			this.momentUntil =  untilDate;

		  for (let key in this.errors) {
		   	this.errors[key] = '';
		  }

		  if (this.switchInit) {
				$('input[bootstrap-switch="AddEvent"]').bootstrapSwitch('state', false);
		  }
			
		},



	},

	ready() {
		
		$(function() {

			this.reinitializeData();


		  $('.selectpicker[AddEvent]').selectpicker();

		  let fromDate = this.momentFrom;
		  let toDate = this.momentTo;
		  let untilDate = this.momentUntil;

		  // datepickers for adding events, sel
		  let fromPicker  = $('div[AddEvent="fromDate"]');
		  let toPicker    = $('div[AddEvent="toDate"]');
		  let untilPicker = $('div[AddEvent="until"]');
		  let fromPickerTime  = $('div[AddEvent="fromTime"]');
		  let toPickerTime    = $('div[AddEvent="toTime"]');

		  fromPicker.datetimepicker({
		    allowInputToggle: true,
		    focusOnShow: true,
		    format: 'MMM D, YYYY',
		    defaultDate: fromDate
		  })
		  .on('dp.change', function(e) { 
		  	// when this picker changes, change data for the other two for some behind the scenes magic
		  	
		  	let toPickerChangeStatus = this.toPickerChange;
		  	
		  	if (! e.date) {
		  		// invalid date, delete it and skip
		  		this.fromDate = '';
		  		return;
		  	}

				// when 'from' changes, save this new date into the state
		  	this.fromDate = e.date.format('MMM D, YYYY');

		  	// set the 'to' date 
		  	toPicker.data('DateTimePicker').minDate(e.date);
		  	if (! toPickerChangeStatus) {
		  		// if 'to' date hasn't been manually set yet, default it to this new 'from' date 
		  		toPicker.data('DateTimePicker').date(e.date.add(2, 'hour'));
		  	}

		  	this.toPickerChange = toPickerChangeStatus;
		  	
		  	// set the 'until' date minimum
		  	untilPicker.data('DateTimePicker').minDate(e.date.add(1, 'week'));
		  }.bind(this));

		  toPicker.datetimepicker({
	      allowInputToggle: true,
	      focusOnShow: true,
	      format: 'MMM D, YYYY',
	      defaultDate: toDate
		  })
		  .on('dp.change', function(e) {

		  	if (!e.date) {
		  		// invalid date, throw it out and skip
		  		this.toDate = '';
		  		return;
		  	}

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
		  	if (! e.date) {
		  		// invalid date, skip and throw out
		  		this.until = '';
		  		return;
		  	}

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
		  	if (! e.date) {
		  		// invalid time, throw out and skip
		  		this.fromTime = '';
		  		return;
		  	}

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
		  	if (! e.date) {
		  		// invalid time, throw out and skip
		  		this.toTime = '';
		  		return;
		  	}

		  	this.toTime = e.date.format('h:mm a');
		  }.bind(this));

		  this.toPickerChange = false;
		  this.untilPickerChange = false;

		  let self = this;
		  let options = {
				state: false,
				onText: 'YES',
				offText: 'NO',
				onSwitchChange: function(e, state) {
					this.repeats = state;
				}.bind(this)
			};

		  $('input[bootstrap-switch="AddEvent"]').bootstrapSwitch(options);
		  this.switchInit = true;

		}.bind(this));
	}

};






</script>

<style lang="stylus">

@import '/resources/assets/stylus/variables.styl'

#addEventCancel
	@media screen and (max-width 767px)
		margin-left 0px
		
// for the colors of the 'event type' dropdown
.homeGame
	color rc_red !important
.awayGame
	color rc_yellow !important
.practice
	color rc_blue !important
.other
	color rc_green !important

div[AddEvent="fromTime"]
div[AddEvent="toTime"]
	margin-top 10px


</style>






