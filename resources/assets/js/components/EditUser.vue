
<template>
	<div class="col-xs-12 EditUser">


		<div v-show="confirmKick" class="EditUser__confirm">
			<!-- show this div when user is confirming a kick on someone -->
			<div class="row kick">
				<h3>{{ kickMsg }}</h3>
				<p>{{ kickText }}</p>
			</div>
			<div class="row EditUser__buttons">
		    <div class="col-xs-6 col-xs-offset-3 col-sm-3 col-sm-offset-2">
		    	<a class="btn btn-delete btn-block btn-md" @click="kick(true)">{{ kickButton }}</a>
		    </div>
		    <div class="col-xs-6 col-xs-offset-3 col-sm-3 col-sm-offset-1">
		    	<a class="btn btn-cancel btn-block btn-md outline" @click="kick(false)">CANCEL</a>
		    </div>
		  </div>
		</div>

    <form v-else @submit.prevent="save()">
    	<div v-if="!user.new" class="row EditUser__role">
	    	<div v-if="user.role < 4" class="col-xs-6">
	        <label>Is a...</label>
	        <select data-style="btn-select btn-lg" EditUser class="selectpicker form-control show-tick"
	        				data-max-options="1" v-model="user.role" number>
	        	<option v-if="user.ghost" value="ghost_player">Player</option>    
	          <option v-else value="player">Player</option>    
	          <option v-if="user.ghost" value="ghost_coach">Coach</option>    
	          <option v-else value="coach">Coach</option>    
	        </select>
	      </div>
	    </div>
	    <div v-if="user.role < 2" class="row EditUser__data">
        <div class="col-xs-6 col-xs-offset-3 col-sm-4 col-sm-offset-0">
          <label for="number">Jersey Number</label>
          <input type="text" class="form-control" :class="{'form-error' : errors.num}"
          				v-model="user.meta.num" @keyup="errorCheck('num')" autocomplete="false">
          <span v-show="errors.num" class="form-error">{{ errors.num }}</span>
        </div>
        <div class="col-xs-6 col-sm-4">
          <label>Primary</label>
          <select data-style="btn-select btn-lg" EditUser class="selectpicker form-control show-tick"
          				multiple data-max-options="1" v-model="user.meta.positions[0]">
            <option v-for="position in positions" :value="position">{{ position | uppercase }}</option>    
          </select>
        </div>
        <div class="col-xs-6 col-sm-4">
          <label>Secondary</label>
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
  				<input type="text" class="form-control" :class="{ 'form-error' : this.errors.email }" maxlength="100" v-model="user.meta.ghost.email"
  								autocomplete="false">
					<span v-show="errors.email" class="form-error">{{ errors.email }}</span>
  				<span v-show="!errors.email && ghostEmail" class="input-info">Editing the email will resend an invitation</span>
  				<span v-show="!errors.email && !ghostEmail" class="input-info">Sends an invitation to join the team</span>
  			</div>
			</div>
	    <div v-if="!user.ghost" class="row">
        <div class="col-xs-6">
          <div class="switch-container">
						<input type="checkbox" bootstrap-switch="EditUser">
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
			confirmKick: false,
			kickButton: '',
			kickMsg: '',
			kickText: '',
			errors: {
				num: '',
				email: '',
				name: '',
			},
		}
	},

	computed: {
		role() {
			return this.user.role;
		},

		//whether or not this user is a fan
		isFan() {
			return this.user.role === 4 || this.user.role === 45 || 
							this.user.role === 46 || this.user.role === 47;
		}
	},

	watch: {

		//if user changed, set inputs to correct new states
		user() {

			this.initialize();

		},

		//if role changed, set inputs to correct new states
		role() {

			this.initialize();

		},


	},

	methods: {

		//whenever the data reloads, reset the input elements and some logic
		initialize() {

			this.confirmKick = false;

			if(this.user.ghost) {
				if(this.user.meta.ghost.email)
					this.ghostEmail = true;
				else
					this.ghostEmail = false;
			}

			$('input[bootstrap-switch="EditUser"]').bootstrapSwitch(this.adminOptions);
			$('input[bootstrap-switch="EditUser"]').bootstrapSwitch('state', this.user.admin);

			$('.selectpicker[EditUser]').selectpicker({
				noneSelectedText: 'None'
			});

		},


		//send ajax request to save data
		save() {
			
			var errors = this.errorCheck('all');

			if(errors)
				return;

			if(this.user.new) {
				this.newUser();
			}
			else {
				this.updateUser();
			}
		},


		//send post request to server to save new user
		newUser() {
			var self = this;
			var url = this.$parent.prefix + '/member'; 
			var data = { 
				name: this.user.meta.ghost.name,
				email: this.user.meta.ghost.email,
				role: this.user.role
			};

			this.$http.post(url, data)
				.then(function(response) {
					if(!response.data.ok)
						throw response.data.error;
				
					$('#rosterModal').modal('hide');
					self.$dispatch('newUser', response.data.user);
					self.$root.banner('good', "User created");	
				})
				.catch(function(error) {
					self.$root.errorMsg(error);
				});
		},


		//send put request to server to update user
		updateUser() {

			$('#rosterModal').modal('hide');

			var self = this;
			var url = this.$parent.prefix + '/user'; 
			var data = { user: this.user };
			this.$http.put(url, data)
				.then(function(response) {
					if(!response.data.ok)
						throw response.data.error;

					$('#rosterModal').modal('hide');
					this.$dispatch('updateUser', response.data.user);
					//if successful, save new data, show success banner
					self.$root.banner('good', "User saved");
					
				})
				.catch(function(error) {
					self.$root.errorMsg(error);
				});
		},


		//close modal
		cancel() {
			$('#rosterModal').modal('hide');
		},


		//show popup asking to confirm the kick, send event to Team if they do
		kick(confirm) {

			if(typeof confirm !== 'boolean') {
				//they need to first confirm their decision to kick
				this.confirm();
				return;
			}

			if(!confirm) {
				//they don't want to kick
				this.confirmKick = false;
				return;
			}

			if(this.user.ghost)
				var msg = 'Ghost deleted';
			else if(this.isFan)
				var msg = 'Fan removed';
			else
				var msg = 'User kicked, replaced with ghost';

			//tell server about new changes
			var data = { user: this.user };
			var self = this;
			this.$http.delete(this.$parent.prefix + '/user', data)
				.then(function(response) {
					if(!response.data.ok) 
						throw response.data.error;

					var user = response.data.user;
					if(!user) {
						user = { deleted: true, member_id: self.user.member_id };
					}

					self.confirmKick = false;

					self.$dispatch('deleteUser', user);
					self.$root.banner('good', msg);
					$('#rosterModal').modal('hide');
					
				})
				.catch(function(error) {
					self.$root.errorMsg(error);
				});	

				return;
		},


		//change the popup so they can confirm their kick on a player
		confirm() {
			if(this.isFan) {
				//this is a fan
				this.kickMsg = 'Remove ' + this.user.firstname + ' as a fan?';
				this.kickText = '';
				this.kickButton = 'REMOVE';
			}

			else if(this.ghost) {
				//they're a ghost, stats will be deleted too
				this.kickMsg = 'Delete this ghost?';
				this.kickText = 'If you delete this ghost, all associated stats will be deleted as well.';
				this.kickButton = 'DELETE';
			}

			else {
				//they're kick a player
				this.kickMsg = 'Kick ' + this.user.firstname + ' from the team?';
				this.kickText = "They will be replaced with a ghost user";
				this.kickButton = 'KICK';
			}


			this.confirmKick = true;
			
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
				else {
					this.errors.num = '';
				}
			}

			if((input === 'email' || input === 'all') && (role === 1 || role === 3)) {
				//check that the email is valid
				if(this.user.meta.ghost.email.length && !this.$root.validateEmail(this.user.meta.ghost.email)) {
					errors++;
					this.errors.email = 'Not a valid email';
				}
				else {
					this.errors.email = '';
				}
			}

			if((input === 'name' || input === 'all') && this.user.ghost) {
				//check that they've added a name
				if(!this.user.meta.ghost.name.length) {
					errors++;
					this.errors.name = 'Enter a name';
				}
				else {
					this.errors.name = '';
				}
			}

			return errors;
		},


	},

	//initialize inputs with jquery
	ready() {

		var self = this;

		this.initialize();

		$(function() {

			$('.selectpicker[EditUser]').selectpicker({
				noneSelectedText: 'None'
			});

			$('input[bootstrap-switch="EditUser"]').bootstrapSwitch(self.adminOptions);

		});
			


	},

};

</script>


<style lang="stylus">
	
.EditUser
	background white	
	
.EditUser__role
	margin-bottom 25px	

.EditUser__data
	margin-bottom 25px
	
.EditUser__buttons
	margin-bottom 12px
	
.EditUser__confirm
	.kick
		width 100%
		text-align center
		margin-bottom 35px
	
</style>


