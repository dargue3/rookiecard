
<template>
	
  <div class="col-xs-12">

		<!-- if user clicks this, show form to edit stats, value syncs up to ViewEvent.vue -->
  	<div v-if="editEvent" class="edit-stats-button">
			<a class="btn btn-primary" @click="editEvent = false">
				Edit Stats 
				<i id="edit-chevron" class="material-icons">chevron_right</i>
			</a>
		</div>

    <form @submit.prevent="updateEvent()">

	    <div class="row">
        <div class="form-group">
          <div class="col-xs-12 col-sm-6">
            <label for="title">Title</label>
            <input class="form-control input-lg" name="title" type="text"
            				autocomplete="off" required v-model="backup.title">
          </div>
          <div class="col-xs-12 col-sm-6 type-select">
            <label for="class">Type</label>
            <select data-style="btn-select btn-lg" name="class"
            				class="selectpicker edit-event form-control show-tick" v-model="backup.class" number>
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
        <div class="col-xs-12 col-sm-6">
          <div class="form-group">
            <label for="from">Starts at</label>
            <!-- from - date -->
            <div class='input-group date edit-picker-from'>
          		<input type="text" name="from" class="form-control" required>
              <span class="input-group-addon">
              	<span class="glyphicon glyphicon-calendar"></span>
              </span>
            </div>
            <!-- from - time -->
            <div class='input-group date edit-picker-from-time'>
              <input type="text" name="fromTime" class="form-control" required>
              <span class="input-group-addon">
                <span class="glyphicon glyphicon-time"></span>
              </span>
            </div>
          </div>
        </div>
        <div class="col-xs-12 col-sm-6">
          <div class="form-group">
            <label for="to">Ends at</label>
            <!-- to - date -->
            <div class="input-group date edit-picker-to">
              <input type="text" name="to" class="form-control" required>
              <span class="input-group-addon">
                <span class="glyphicon glyphicon-calendar"></span>
              </span>
            </div>
            <!-- to - time -->
            <div class="input-group date edit-picker-to-time">
              <input type="text" name="toTime" class="form-control" required>
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
	        <label for="details">Extra details about this event</label>
	        <textarea v-autosize="backup.details" name="details" rows="1" class="form-control" maxlength="5000"
	        					autocomplete="off" v-model="backup.details">{{ backup.details }}</textarea>
	      </div>
	    </div>
	    <hr>
	    <br>
			<div class="row edit-submit-buttons">
		    <div class="col-xs-4 col-xs-offset-4 col-sm-3 col-sm-offset-1">
		    	<input class="btn btn-primary btn-block btn-md btn-first" tabindex="4" type="submit" value="SAVE">
		    </div>
		    <div class="col-xs-4 col-xs-offset-4 col-sm-3 col-sm-offset-0">
		    	<input class="btn btn-delete btn-block btn-md" tabindex="5" 
		    					value="DELETE" @click="deleteEvent(false)">
		    </div>
		    <div class="col-xs-4 col-xs-offset-4 col-sm-3 col-sm-offset-0">
		    	<input class="btn btn-cancel btn-block btn-md outline" tabindex="6" 
		    					value="CANCEL" @click="cancel()">
		    </div>
	    </div>
		</div>
	</form>
</div>


</template>




<script>



export default  {
	
	name: 'EditEvent',

	props: ['event', 'events', 'editEvent'],


	data() {
	
		return {
			fromDate: '',
			fromTime: '',
			toDate: '',
			toTime: '',
			backup: {},
			toPickerChange: false,
		}
	},

	watch: {
		event(val, old) {
			//wait for an new event to be clicked
			if(val === old) 
				return
			else
				this.initialize();
		},
	},

	methods: {

		//save button was hit
		updateEvent() {
		
    	this.fromDate = $('.edit-picker-from input[name="from"]').val();
			this.toDate = $('.edit-picker-to input[name="to"]').val();

    	//make new date strings 
    	this.backup.start = this.fromDate + " " + this.fromTime;
    	this.backup.end = this.toDate + " " + this.toTime;

    	var self = this;
    	var url = this.$parent.prefix + '/events';
			this.$http.put(url, this.backup).then(function(response) {
				//if good post, update events with this new edit

				//turn date back into UTC timestamp
				self.backup.start = parseInt(moment(self.backup.start, 'MMM D, YYYY h:mm a').format('X'));
				self.backup.end = parseInt(moment(self.backup.end, 'MMM D, YYYY h:mm a').format('X'));

				if(response.data.feed)
					var data = response.data.feed;
				else
					var data = null;
				self.$dispatch('updateEvent', self.backup, data);
	
				//hide the modal
				$('#viewEventModal').modal('hide');

				//show success banner
				self.$root.banner('good', "This event has been updated");

			})
			.catch(function(response) {
				self.$root.banner('bad', "There was a server problem, try refreshing the page.");
			});
		},

		//delete button was hit
		deleteEvent(confirmed) {

			if(this.editEvent && !confirmed) {
				//prompt user 'are you sure?' because there may be attached stats
				this.promptForDelete();
				return;
			}

			var self = this;
    	var url = this.$parent.prefix + '/events';
    	this.$http.delete(url, this.event).then(function(response) {

    		if(response.data.feed)
					var data = response.data.feed;
				else
					var data = null;
				self.$dispatch('deleteEvent', self.event, data);
				$('#viewEventModal').modal('hide');

				//show success banner
				self.$root.banner('good', "This event has been deleted");
			})
			.catch(function(response) {
				//show error
				self.$root.banner('bad', "There was a server problem... try refreshing the page?");
			});
		},

		//display a popup with a yes or no for deleting this event
		promptForDelete() {
			swal({   
				title: 'Delete Event?',
				text: 'Are you sure you want to delete this event? This will also delete any associated stats!',
				type: "warning",
				showCancelButton: true,
				confirmButtonColor: '#C90019',
				cancelButtonColor: 'whitesmoke',
				confirmButtonText: 'DELETE',
				cancelButtonText: 'CANCEL',
				allowOutsideClick: true,
				closeOnConfirm: true
			}, function(confirm) {
				if(confirm)
					//confirm delete
					this.deleteEvent(true);
			}.bind(this));
		},

		//cancel button was hit
		cancel() {
			this.event = this.backup;
			this.editEvent = false;
			$('#viewEventModal').modal('hide');
		},


		//initialize data and get date/time pickers ready
		initialize() {

			//make a backup of event
			this.backup = JSON.parse(JSON.stringify(this.event));

			//init moment instances, milliseconds
			this.fromDate = moment(this.event.start * 1000).format('MMM D, YYYY');
			this.fromTime = moment(this.event.start * 1000).format('h:mm a');
			this.toDate 	= moment(this.event.end * 1000).format('MMM D, YYYY');
			this.toTime 	= moment(this.event.end * 1000).format('h:mm a');

			//initialize the jquery and event data
			$(function() {

				//select picker is tricky to initialize to current value, trust that this works
				var selectList = '.type-select div.bootstrap-select li';
			  $('.selectpicker.edit-event').selectpicker({});
			  $(selectList + '.selected').removeClass('selected');
			  var selected = $(selectList + '[data-original-index="' + this.event.class + '"]').addClass('selected');
			  var text = selected.find('a').text()
			  $('.type-select div.bootstrap-select span.filter-option').text(text)

			  //datepickers for adding events, sel
			  var fromPicker  		= $('.edit-picker-from');
			  var toPicker    		= $('.edit-picker-to');
			  var fromPickerTime  = $('.edit-picker-from-time');
			  var toPickerTime    = $('.edit-picker-to-time');

			  fromPicker.datetimepicker({
			    allowInputToggle: true,
			    focusOnShow: true,
			    format: 'MMM D, YYYY'
			  })
			  .on('dp.change', function(e) { 

			  	//when 'from' changes, save this new date into the state
			  	//set 'to' and 'until' minimum dates so they don't end before it starts
			  	this.fromDate = e.date.format('MMM D, YYYY');
			  	toPicker.data('DateTimePicker').minDate(e.date);

			  	if(!this.toPickerChange)
			  		//if the toPicker (date) hasn't been manually set yet, default it to this new fromDate 
			  		toPicker.data('DateTimePicker').date(e.date);

			  }.bind(this));

			  toPicker.datetimepicker({
		      allowInputToggle: true,
		      focusOnShow: true,
		      format: 'MMM D, YYYY'
			  })
			  .on('dp.change', function(e) {
			  	this.toPickerChange = true;
			  	this.toDate = e.date.format('MMM D, YYYY');
			  }.bind(this));

			  fromPickerTime.datetimepicker({
		      stepping: 5,
		      allowInputToggle: true,
		      focusOnShow: true,
		      format: 'h:mm a'
			  })
			  .on('dp.change', function(e) {
			  	this.fromTime = e.date.format('h:mm a');
			  }.bind(this));

			  toPickerTime.datetimepicker({
			      stepping: 5,
			      allowInputToggle: true,
			      focusOnShow: true,
			      format: 'h:mm a'
			  })
		   	.on('dp.change', function(e) {
			  	this.toTime = e.date.format('h:mm a');
			  }.bind(this));

			  //initialize dates and times
			  fromPicker.data('DateTimePicker').date(this.fromDate);
			  toPicker.data('DateTimePicker').date(this.toDate);
			  fromPickerTime.data('DateTimePicker').date(this.fromTime);
			  toPickerTime.data('DateTimePicker').date(this.toTime);


			}.bind(this));
		}		
	},



};

</script>




<style lang="stylus">

@import '/resources/assets/stylus/variables.styl'

	
.edit-stats-button
	position relative
	display flex
	flex-flow row
	justify-content flex-end
	@media screen and (max-width 767px)
		justify-content center
	.btn
		padding-left 14px
	#edit-chevron
		position absolute
		top 17px
		right -4px
		font-size 30px
	
.edit-submit-buttons
	margin-bottom 20px




</style>