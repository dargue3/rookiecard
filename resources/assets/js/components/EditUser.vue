
<template>
	<div class="col-xs-12 EditUser">
    <form @submit.prevent>
    	<!-- only showing this section if user is a player -->
	    <div v-show="user.role < 2" class="row EditUser__data">
        <div class="form-group">
          <div class="col-xs-12 col-sm-6">
            <label for="number">Jersey Number</label>
            <input type="text" class="form-control" :class="errors.num ? 'form-error' : ''"
            				v-model="user.meta.num" @keyup="errorCheck('num')">
            <span v-show="errors.num" class="form-error">Choose a number between 00 and 99</span>
          </div>
          <div class="col-xs-12 col-sm-6">
            <label for="eventClass">Position</label>
            <select data-style="btn-select btn-lg" EditUser class="selectpicker form-control show-tick"
            					multiple v-model="user.meta.positions">
              <option v-for="position in positions" :value="position">{{ position | uppercase }}</option>    
            </select>
          </div>
        </div>
	    </div>
	    <div class="row">
        <div class="col-xs-12">
          <div class="switch-container">
						<input type="checkbox" bootstrap-switch="EditUser--admin">
						<span class="switch-label">Admin</span>
					</div>
				</div>
	    </div>
    	<hr>
	    <div class="row EditUser__buttons">
		    <div class="col-xs-4 col-xs-offset-4 col-sm-3 col-sm-offset-1">
		    	<a class="btn btn-primary btn-block btn-md" @click="save()">SAVE</a>
		    </div>
		    <div class="col-xs-4 col-xs-offset-4 col-sm-3 col-sm-offset-0">
		    	<a class="btn btn-delete btn-block btn-md" @click="kick()">KICK</a>
		    </div>
		    <div class="col-xs-4 col-xs-offset-4 col-sm-3 col-sm-offset-0">
		    	<a class="btn btn-cancel btn-block btn-md outline"@click="cancel()">CANCEL</a>
		    </div>
	    </div>
    </form>
	</div>	
	
</template>


<script>


export default  {
	
	name: 'EditUser',

	props: ['user', 'positions'],


	data() {
		
		return {

			errors: {
				num: false
			},
			adminOptions: {
				state: this.user.admin,
				onText: 'YES',
				offText: 'NO',
				onSwitchChange: function(e, state) {
					this.user.admin = state;
				}.bind(this)
			},
		}
	},

	watch: {

		//if user changed, set inputs to correct new states
		user() {
			//parameters to switch function are: edit 'state', set to admin status
			$('input[bootstrap-switch="EditUser--admin"]').bootstrapSwitch('state', this.user.admin);

			//re-render selectpicker to detect change in array
			$('.selectpicker[EditUser]').selectpicker('render');
		},


	},

	methods: {

		//send ajax request to save data
		save() {
			
			var errors = this.finalErrorCheck();

			if(!errors) {

				this.$dispatch('updateUser', this.user);

				$('#rosterModal').modal('hide');

				var self = this;
				var url = this.$parent.prefix + '/user'; 
				this.$http.put(url, {user: this.user})
				.then(function(response) {
					//if successful, save new data, show success banner
					self.$root.banner('good', "User data has been saved");
				})
				.catch(function(response) {
					//if unsuccessful, show error message
					self.$root.banner('bad', "There was a problem editing this user... refresh the page and try again.");
				});
			}

		},

		//close modal
		cancel() {
			$('#rosterModal').modal('hide');
		},

		//show popup asking to confirm the kick, send event to Team if they do
		kick() {
			var self = this;
			swal({   
				title: 'Kick Player?',
				text: 'Are you sure you want to kick ' + self.user.firstname + ' from the team?',
				type: "warning",
				showCancelButton: true,
				confirmButtonColor: '#C90019',
				cancelButtonColor: 'whitesmoke',
				confirmButtonText: 'KICK',
				cancelButtonText: 'CANCEL',
				allowOutsideClick: true,
				closeOnConfirm: true
			}, function(confirm) {
				if(confirm) {
					//send event to kick user
					self.$dispatch('deleteUser', self.user);
					$('#rosterModal').modal('hide');
				}
			});
		},


		errorCheck(input) {
			switch(input) {

				case 'num':
					var num = this.user.meta.num
					//check that the jersey number is between 00 - 99
					if(isNaN(num))
						this.errors.num = true;

					else if(parseInt(num) > 99 || parseInt(num) < 0)
						this.errors.num = true;

					else if(num.length > 2)
						this.errors.num = true;

					else
						this.errors.num = false;

					break;
			}
		},

		//because you could feasibly type and submit so fast the keyup doesn't check,
		//do one final round of error checking
		finalErrorCheck() {
			this.errorCheck('num');

			var errors = false;
			for (var error in this.errors) {
				if(this.errors[error])
					errors = true;
			}

			return errors;
		},


	},

	//initialize inputs with jquery
	ready() {

		$(function() {

			$('.selectpicker[EditUser]').selectpicker();

			$('input[bootstrap-switch="EditUser--admin"]').bootstrapSwitch(this.adminOptions);

		}.bind(this));
			


	},

};

</script>


<style lang="stylus">
	
.EditUser
	background white	

.EditUser__data
	margin-bottom 25px
	
.EditUser__buttons
	margin-bottom 12px
</style>