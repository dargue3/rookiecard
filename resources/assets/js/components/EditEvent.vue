
<template>
	
	<div class="col-xs-12">
    <form @submit.prevent="save()">

			<div v-show="editingPastEvent" class="edit-button">
				<a class="btn btn-primary --chevron --med --right" v-touch:tap="editingPastEvent = false">
					Edit Stats
					<i class="material-icons btn-chevron --right">chevron_right</i>
				</a>
			</div>

	    <div class="row">
        <div class="form-group">
          <div class="col-xs-12 col-sm-6">
            <label>Title</label>
            <input type="text" class="form-control" :class="{'form-error' : errors.title}"
            				placeholder="vs. Georgia Tech" maxlength="50" v-model="title"
            				autocomplete="off">
            <span v-show="errors.title" class="form-error">{{ errors.title }}</span>
          </div>
          <div class="col-xs-12 col-sm-6">
            <label>Type</label>
            <select v-model="type" data-style="btn-select btn-lg"
                    class="selectpicker form-control show-tick" EditEvent="type">
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
            <div class="input-group date" EditEvent="fromDate">
          		<input type="text" class="form-control" :class="{'form-error' : errors.start }">
              <span class="input-group-addon">
              	<span class="glyphicon glyphicon-calendar"></span>
              </span>
            </div>
						<!-- from - time -->
            <div class="input-group date" EditEvent="fromTime">
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
          	<!-- to - date -->
            <label>Ends at</label>
            <div class="input-group date" EditEvent="toDate">
              <input type="text" class="form-control" :class="{'form-error' : errors.end }">
              <span class="input-group-addon">
                <span class="glyphicon glyphicon-calendar"></span>
              </span>
            </div>
            <!-- to - time -->
            <div class="input-group date" EditEvent="toTime">
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
	    <div v-show="! savedEvent" class="row EditEvent__repeats">
        <div class="col-xs-12">
          <div class="switch-container">
						<input type="checkbox" bootstrap-switch="EditEvent">
						<span class="switch-label">This event repeats&hellip;</span>
					</div>
				</div>
	    </div>
	    <div v-show="! savedEvent && repeats" class="row EditEvent__days" transition="slide-sm" >
        <div class="col-xs-12 col-sm-6" :class="{'form-error' : errors.days }">
          <label for="days">Every</label>
          <select name="days[]" class="selectpicker form-control show-tick" EditEvent="days" data-style="btn-select btn-lg"
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
          <div class="input-group date" EditEvent="until">
            <input type="text" class="form-control" :class="{'form-error' : errors.until }">
            <span class="input-group-addon">
              <span class="glyphicon glyphicon-calendar"></span>
            </span>
          </div>
          <span v-show="errors.until" class="form-error">{{ errors.until }}</span>
        </div>
	    </div>
	    <div class="row">
        <div class="col-xs-12">
          <label>Extra details about this event</label>
          <textarea v-autosize="details" name="details" class="form-control" maxlength="5000" rows="1"
          				 placeholder="Remember your water bottle!" v-model="details"></textarea>
        </div>
	    </div>
    	<hr>
	    <div class="EditEvent__buttons">
	      <div class="save-button-group" :class="savedEvent ? '--three' : '--two'">
	      	<div>
	      		<a class="btn btn-primary" v-touch:tap="save()">
	      			<span v-show="! loading_save">SAVE</span>
	      			<spinner v-show="loading_save" color="white"></spinner>
	      		</a>
	      	</div>
	      	<div v-if="savedEvent">
	      		<a class="btn btn-delete" v-touch:tap="destroy()">
	      			<span v-show="! loading_delete">DELETE</span>
	      			<spinner v-show="loading_delete" color="white"></spinner>
	      		</a>
	      	</div>
	      	<div>
	      		<a class="btn btn-cancel" v-touch:tap="cancel()">CANCEL</a>
	      	</div>
	      </div>
	    </div>
    </form>
	</div>
		
</template>


<script>

export default  {
	
	name: 'EditEvent',

	props: ['newTitle', 'savedEvent', 'editingPastEvent'],


	data() {

		return {
			title: '',
			type: '',
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
			loading_save: false,
			loading_delete: false,
			switchInit: false,
			pickersSet: false,
		}
	},

	watch:
	{
		title()
		{
			this.newTitle = this.title;
		},

		savedEvent()
		{
			this.reinitialize();
		},
	},

	ready()
	{
		this.reinitialize();
	},


	events:
	{
		EditEvent_saved(response)
		{
			this.$dispatch('Team_updated_events', response.data.events);
			this.$dispatch('ViewEvent_cancel');

			let msg = "Event saved"
			if (this.repeats) {
				// plural
				msg = "Events saved";
			}
			else if (this.savedEvent) {
				msg = "Event updated";
			}

			this.$root.banner('good', msg);

			this.reinitialize();
		},

		EditEvent_deleted(response)
		{
			this.$dispatch('Team_updated_events', response.data.events);
			this.$dispatch('ViewEvent_cancel');

			this.$root.banner('good', "Event deleted");

			this.reinitialize();
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

			let momentTo = moment(this.toDate + ' ' + this.toTime, 'MMM D, YYYY h:mm a');
			let momentFrom = moment(this.fromDate + ' ' + this.fromTime, 'MMM D, YYYY h:mm a');
			if (! this.savedEvent) {
				let momentUntil = moment(this.until, 'MMM D, YYYY');
			}

			let data = {
				title: this.title,
				type: this.type,
				start: momentFrom.unix(),
				end: momentTo.unix(),
				details: this.details,
			};

			if (this.repeats) {
				// if the event repeats, add this extra data with the request	
				data.until = momentUntil.unix();
				data.repeats = true;
				data.days = this.days;
			}

			this.loading_save = true;

			let url = this.$parent.prefix + '/event';

			if (this.savedEvent) {
				this.$root.put(url + '/' + this.savedEvent.id, 'EditEvent_saved', data);
			}
			else {
				this.$root.post(url, 'EditEvent_saved', data);
			}
		},


		destroy()
		{
			this.loading_delete = true;
			let url = `${this.$parent.prefix}/event/${this.savedEvent.id}`
			this.$root.delete(url, 'EditEvent_deleted');
		},

		// discard button was clicked
		cancel()
		{
			this.$dispatch('ViewEvent_cancel');
			this.reinitialize();
		},


		// set newEvent object back to default values
		reinitialize()
		{
			if (this.savedEvent) {
				return this.initializeWithSavedEvent();
			}

			// initialize dates to 'tomorrow at 6:00 - 8:00 pm'
			// untilDate is used for repeating events, initialize to a week after event starts
			let fromDate 	= moment().add(1, 'day').hour(18).minute(0).second(0);
			let toDate 		= moment().add(1, 'day').hour(20).minute(0).second(0);
			let untilDate = moment().add(8, 'day').hour(20).minute(0).second(0);

	  	this.title =  '';
	  	this.type = 'home_game';
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
			this.loading_save = false;
			this.loading_delete = false;

		  for (let key in this.errors) {
		   	this.errors[key] = '';
		  }

		  if (this.switchInit) {
				$('input[bootstrap-switch="EditEvent"]').bootstrapSwitch('state', false);
		  }

		  this.setupPickers();
		},

		initializeWithSavedEvent()
		{
			let event = JSON.parse(JSON.stringify(this.savedEvent));

			let fromDate = moment(event.start * 1000);
			let toDate = moment(event.end * 1000);

			this.title = event.title;
			this.type = event.type;
			this.momentUntil = moment();
			this.momentFrom = fromDate
			this.momentTo 	= toDate
			this.fromDate =  fromDate.format('MMM D, YYYY');
			this.fromTime =  fromDate.format('h:mm a');
			this.toDate =  toDate.format('MMM D, YYYY');
			this.toTime =  toDate.format('h:mm a');
			this.details = event.details;
			this.toPickerChange =  false;
			this.untilPickerChange =  false;
			this.loading_save = false;
			this.loading_delete = false;

			this.setupPickers();
		},


		setupPickers()
		{
			if (this.pickersSet) {
				// don't reset listeners if done once already
				this.resetPickers();
				return;
			}

			$(function() {

				this.pickersSet = true;

			  let fromDate = this.momentFrom;
			  let toDate = this.momentTo;
			  if (! this.savedEvent) {
			  	var untilDate = this.momentUntil;
			  }
			  // datepickers for adding events, sel
			  let fromPicker  = $('div[EditEvent="fromDate"]');
			  let toPicker    = $('div[EditEvent="toDate"]');
			  let fromPickerTime  = $('div[EditEvent="fromTime"]');
			  let toPickerTime    = $('div[EditEvent="toTime"]');
			  if (! this.savedEvent) {
			  	var untilPicker = $('div[EditEvent="until"]');
			  }

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
			  	if (! this.savedEvent) {
				  	untilPicker.data('DateTimePicker').minDate(e.date.add(22, 'hours'));
				  	untilPicker.data('DateTimePicker').date(e.date.add(6, 'days'));
				  }
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
			  	if (! this.savedEvent) {
				  	untilPicker.data('DateTimePicker').minDate(e.date.add(24, 'hours'));
				  	untilPicker.data('DateTimePicker').date(e.date.add(1, 'week'));
			  	}
			  }.bind(this));

			  if (! this.savedEvent) {
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
				  		if (! this.savedEvent) {
				  			this.until = '';
				  		}
				  		return;
				  	}
				  	if (! this.savedEvent) {
				  		this.until = e.date.format('MMM D, YYYY');
				  	}
				  }.bind(this));
				}

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

			  $('input[bootstrap-switch="EditEvent"]').bootstrapSwitch(options);
			  this.switchInit = true;

			  this.resetPickers();

			}.bind(this));
		},


		resetPickers()
		{
			$('.selectpicker[EditEvent="type"]').selectpicker('refresh').selectpicker('val', this.type);
			$('.selectpicker[EditEvent="days"]').selectpicker('refresh');

			// set datetimepickers back to normal
		  $('div[EditEvent="fromDate"]').data('DateTimePicker').date(this.momentFrom);
		  $('div[EditEvent="toDate"]').data('DateTimePicker').date(this.momentTo);
		  $('div[EditEvent="fromTime"]').data('DateTimePicker').date(this.momentFrom);
		  $('div[EditEvent="toTime"]').data('DateTimePicker').date(this.momentTo);
			if (! this.savedEvent) {
				$('div[EditEvent="until"]').data('DateTimePicker').date(this.momentUntil);
			}
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

			if (! momentTo.isAfter(momentFrom)) {
				errors++;
				this.errors.end = 'Ends before it starts';
			}
			else {
				this.errors.end = '';
			}

			if (! momentUntil.isAfter(momentTo) && this.repeats) {
				errors++;
				this.errors.until = 'Stops repeating before the event ends';
			}
			else {
				this.errors.until = '';
			}

			return errors;
		},
	},
};






</script>

<style lang="stylus">

@import '/resources/assets/stylus/variables.styl'

		
.EditEvent__buttons
	display flex
	justify-content center
	
.EditEvent__days
	margin-bottom 30px
		
// for the colors of the 'event type' dropdown
.homeGame
	color rc_red !important
.awayGame
	color rc_yellow !important
.practice
	color rc_blue !important
.other
	color rc_green !important

div[EditEvent="fromTime"]
div[EditEvent="toTime"]
	margin-top 10px


</style>






