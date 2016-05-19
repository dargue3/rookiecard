
<template>
	<div class="col-xs-12 EditUser">
    <form @submit.prevent="save()">
    	<!-- only showing this section if user is a player -->
	    <div v-if="user.role < 2" class="row EditUser__data">
        <div class="col-xs-6 col-xs-offset-3 col-sm-4 col-sm-offset-0">
          <label for="number">Jersey Number</label>
          <input type="text" class="form-control" :class="{'form-error' : errors.num}"
          				v-model="user.meta.num" @keyup="errorCheck('num')" autocomplete="false">
          <span v-show="errors.num" class="form-error">{{ errors.num }}</span>
        </div>
        <div class="col-xs-6 col-sm-4">
          <label>Position</label>
          <select data-style="btn-select btn-lg" EditUser class="selectpicker form-control show-tick"
          				multiple data-max-options="1" v-model="user.meta.positions[0]">
            <option v-for="position in positions" :value="position">{{ position | uppercase }}</option>    
          </select>
        </div>
        <div class="col-xs-6 col-sm-4">
          <label>Position</label>
          <select data-style="btn-select btn-lg" EditUser class="selectpicker form-control show-tick"
          				multiple data-max-options="1" v-model="user.meta.positions[1]">
            <option v-for="position in positions" :value="position">{{ position | uppercase }}</option>    
          </select>
        </div>  
	    </div>


	    <div v-if="user.ghost" class="row EditUser__data">
  			<div class="col-xs-12 col-sm-6">
  				<label>Name</label>
  				<input type="text" class="form-control" maxlength="100" v-model="user.meta.ghost.name" required
  								:class="{'form-error' : errors.name}" autocomplete="false">
  				<span v-show="errors.name" class="form-error">{{ errors.name }}</span>
  			</div>
  			<div class="col-xs-12 col-sm-6">
  				<label>Email</label>
  				<input type="text" class="form-control" maxlength="100" v-model="user.meta.ghost.email"
  								autocomplete="false">
					<span v-show="errors.email" class="form-error">{{ errors.email }}</span>
  				<span v-show="!errors.email && ghostEmail" class="input-info">Editing the email will resend an invitation</span>
  				<span v-show="!errors.email && !ghostEmail" class="input-info">Sends an invitation to join the team</span>
  			</div>
			</div>
	    <div v-if="!user.ghost" class="row">
        <div class="col-xs-12">
          <div class="switch-container">
						<input type="checkbox" bootstrap-switch="EditUser--admin">
						<span class="switch-label">Team Admin</span>
					</div>
				</div>
	    </div>



    	<hr>
	    <div class="row EditUser__buttons">
		    <div class="col-xs-6 col-xs-offset-3 col-sm-3 col-sm-offset-1">
		    	<a class="btn btn-primary btn-block btn-md" @click="save()">SAVE</a>
		    </div>
		    <div class="col-xs-6 col-xs-offset-3 col-sm-3 col-sm-offset-0">
		    	<a v-if="!user.new && !user.ghost" class="btn btn-delete btn-block btn-md" @click="kick()">KICK</a>
		    	<a v-if="!user.new && user.ghost" class="btn btn-delete btn-block btn-md" @click="kick()">DELETE</a>
		    </div>
		    <div class="col-xs-6 col-xs-offset-3 col-sm-3 col-sm-offset-0">
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
			ghostEmail: false,
			adminOptions: {
				state: this.user.admin,
				onText: 'YES',
				offText: 'NO',
				onSwitchChange: function(e, state) {
					this.user.admin = state;
				}.bind(this)
			},
			errors: {
				num: '',
				email: '',
				name: '',
			},
		}
	},

	watch: {

		//if user changed, set inputs to correct new states
		user() {

			if(this.user.ghost) {
				if(this.user.meta.ghost.email)
					this.ghostEmail = true;
				else
					this.ghostEmail = false;
			}

			//parameters to switch function are: edit 'state', set to admin status
			$('input[bootstrap-switch="EditUser--admin"]').bootstrapSwitch('state', this.user.admin);

			//re-render selectpicker to detect change in array
			$('.selectpicker[EditUser]').selectpicker('render');
		},


	},

	methods: {

		//send ajax request to save data
		save() {
			
			var errors = this.errorCheck('all');

			if(errors)
				return;


			if(this.user.new)
				this.newUser();
			else
				this.updateUser();
		},

		//send post request to server to save new user
		newUser() {
			var self = this;
			var url = this.$parent.prefix + '/user'; 
			this.$http.post(url, this.user)
				.then(function(response) {
					//if successful, save new data, show success banner
					if(response.data.ok) {
						self.$dispatch('newUser', response.data.user);

						$('#rosterModal').modal('hide');
						
						self.$root.banner('good', "User created");
					}
					else {
						/*for(var key in errors) {
							this.errors[key] = response.data.errors[key];
							
						}*/
						self.$root.banner('bad', "Correct the errors and try again")
					}
					
				})
				.catch(function(response) {
					self.$root.errorMsg();
				});
		},

		//send put request to server to update user
		updateUser() {
			this.$dispatch('updateUser', this.user);

			$('#rosterModal').modal('hide');

			var self = this;
			var url = this.$parent.prefix + '/user'; 
			this.$http.put(url, {user: this.user})
				.then(function(response) {
					//if successful, save new data, show success banner
					self.$root.banner('good', "User saved");
				})
				.catch(function(response) {
					self.$root.errorMsg();
				});
		},

		//close modal
		cancel() {
			$('#rosterModal').modal('hide');
		},

		//show popup asking to confirm the kick, send event to Team if they do
		kick() {
			var self = this;

			var title = 'Kick Player?';
			var text = 'Are you sure you want to kick ' + self.user.firstname + ' from the team? They will become a ghost and their stats will be kept';
			var buttonText = 'KICK'

			if(this.user.ghost) {
				//if user is a ghost, reword the popup
				var title = 'Delete Ghost?';
				var text = 'Are you sure you want to delete this ghost? All stats will also be deleted';
				var buttonText = 'DELETE'
			}

			swal({   
				title: title,
				text: text,
				type: "warning",
				showCancelButton: true,
				confirmButtonColor: '#C90019',
				cancelButtonColor: 'whitesmoke',
				confirmButtonText: buttonText,
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
			var errors = 0;
			var role = this.user.role

			if((input === 'num' || input === 'all') && role <= 1) {
				//check that the jersey number is between 00 - 99
				if(!this.$root.validateJerseyNum(this.user.meta.num)) {
					errors++;
					this.errors.num = 'Not a valid number';
				}
				else
					this.errors.num = '';
			}

			if((input === 'email' || input === 'all') && (role === 1 || role === 3)) {
				//check that the jersey number is between 00 - 99
				if(this.user.meta.ghost.email.length && !this.$root.validateEmail(this.user.meta.ghost.email)) {
					errors++;
					this.errors.email = 'Not a valid email';
				}
				else
					this.errors.email = '';
			}

			if((input === 'name' || input === 'all') && this.user.ghost) {
				//check that the jersey number is between 00 - 99
				if(!this.user.meta.ghost.name.length) {
					errors++;
					this.errors.name = 'Enter a name';
				}
				else
					this.errors.name = '';
			}



			return errors;
		},


	},

	//initialize inputs with jquery
	ready() {

		if(this.user.ghost) {
			if(this.user.meta.ghost.email)
				this.ghostEmail = true;
			else
				this.ghostEmail = false;
		}

		$(function() {

			$('.selectpicker[EditUser]').selectpicker({
				noneSelectedText: 'None'
			});

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