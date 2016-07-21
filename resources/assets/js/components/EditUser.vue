
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
	    	<div v-if="user.isCoach || user.isPlayer" class="col-xs-6">
	        <label>Is a...</label>
	        <select data-style="btn-select btn-lg" EditUser class="selectpicker form-control show-tick"
	        				data-max-options="1" v-model="user.role" number>
	        	<option v-if="user.isGhost" value="ghost_player">Player</option>    
	          <option v-else value="player">Player</option>    
	          <option v-if="user.isGhost" value="ghost_coach">Coach</option>    
	          <option v-else value="coach">Coach</option>    
	        </select>
	      </div>
	    </div>
	    <div v-if="user.isPlayer" class="row EditUser__data">
        <div class="col-xs-6 col-xs-offset-3 col-sm-4 col-sm-offset-0">
          <label for="number">Jersey Number</label>
          <input type="text" class="form-control" :class="{'form-error' : errors.user.meta.num}"
          				v-model="user.meta.num" @keyup="errorCheck('num')" autocomplete="false" maxlength="2">
          <span v-show="errors.user.meta.num" class="form-error">{{ errors.user.meta.num }}</span>
        </div>
        <div class="col-xs-6 col-sm-4">
          <label>Primary</label>
          <select data-style="btn-select btn-lg" EditUser="position[0]" class="selectpicker form-control show-tick"
          				multiple data-max-options="1" v-model="user.meta.positions[0]">
            <option v-for="position in positions" :value="position">{{ position | uppercase }}</option>    
          </select>
        </div>
        <div class="col-xs-6 col-sm-4">
          <label>Secondary</label>
          <select data-style="btn-select btn-lg" EditUser="position[1]" class="selectpicker form-control show-tick"
          				multiple data-max-options="1" v-model="user.meta.positions[1]">
            <option v-for="position in positions" :value="position">{{ position | uppercase }}</option>    
          </select>
        </div>  
	    </div>


	    <div v-if="user.isGhost" class="row EditUser__data">
  			<div class="col-xs-6 col-sm-3">
  				<label>First Name</label>
  				<input type="text" class="form-control" maxlength="100" v-model="user.meta.firstname" required
  								:class="{'form-error' : errors.user.meta.firstname}" autocomplete="false">
  				<span v-show="errors.user.meta.firstname" class="form-error">{{ errors.user.meta.firstname }}</span>
  			</div>
  			<div class="col-xs-6 col-sm-3">
  				<label>Last Name</label>
  				<input type="text" class="form-control" maxlength="100" v-model="user.meta.lastname" required
  								:class="{'form-error' : errors.user.meta.lastname}" autocomplete="false">
  				<span v-show="errors.user.meta.lastname" class="form-error">{{ errors.user.meta.lastname }}</span>
  			</div>
  			<div class="col-xs-12 col-sm-6">
  				<label>Email</label>
  				<input type="text" class="form-control" :class="{ 'form-error' : errors.user.meta.email }" maxlength="100" v-model="user.meta.email"
  								autocomplete="false">
					<span v-show="errors.user.meta.email" class="form-error">{{ errors.user.meta.email }}</span>
					<template v-else>
						<span v-show="ghostEmail" class="input-info">Editing the email will resend an invitation</span>
  					<span v-show="! ghostEmail" class="input-info">Invite someone to take this spot!</span>
					</template>
  			</div>
			</div>
	    <div v-if="! user.isGhost" class="row">
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
		    	<a v-if="!user.new && !user.isGhost" class="btn btn-delete btn-block btn-md" @click="kick()">KICK</a>
		    	<a v-if="!user.new && user.isGhost" class="btn btn-delete btn-block btn-md" @click="kick()">DELETE</a>
		    </div>
		    <div class="col-xs-6 col-xs-offset-3 col-sm-3 col-sm-offset-0">
		    	<a class="btn btn-cancel btn-block btn-md outline"@click="cancel()">CANCEL</a>
		    </div>
	    </div>
    </form>
	</div>	
	
</template>


<script>

import Validator from './../mixins/Validator.js';

export default  {
	
	name: 'EditUser',

	props: ['user', 'positions'],

	mixins: [ Validator ],

	data() {
		
		return {
			ghostEmail: false,
			adminOptions: {
				state: this.user.isAdmin,
				onText: 'YES',
				offText: 'NO',
				onSwitchChange: function(e, state) {
					this.user.isAdmin = state;
				}.bind(this)
			},
			confirmKick: false,
			kickButton: '',
			kickMsg: '',
			kickText: '',
		}
	},

	beforeCompile()
	{
			this.setErrorChecking();
	},

	computed: {
		role()
		{
			return this.user.role;
		},
	},

	watch: {

		//if user changed, set inputs to correct new states
		user()
		{
			this.initialize();
		},

		//if role changed, set inputs to correct new states
		role()
		{
			this.initialize();
		},


	},

	events:
	{
		EditUser_update(response)
		{
			$('#rosterModal').modal('hide');
			this.$dispatch('Team_updated_members', response.data.members);
			this.$root.banner('good', "User saved");
		},
	},

	methods: {

		//whenever the data reloads, reset the input elements and some logic
		initialize()
		{
			this.confirmKick = false;

			if(this.user.isGhost) {
				if(this.user.meta.email) {
					this.ghostEmail = true;
				}
				else {
					this.ghostEmail = false;
				}
			}

			$('input[bootstrap-switch="EditUser"]').bootstrapSwitch(this.adminOptions);
			$('input[bootstrap-switch="EditUser"]').bootstrapSwitch('state', this.user.isAdmin);

			$('.selectpicker[EditUser]').selectpicker({
				noneSelectedText: 'None'
			}).selectpicker('refresh');

			this.setErrorChecking();
		},

		setErrorChecking()
		{
			this.registerErrorChecking('user.meta.num', 'jersey', 'Choose between 00-99');

			// extra details to check if editing a ghost
			if (this.user.isGhost) {
				this.registerErrorChecking('user.meta.firstname', 'required', 'Enter a first name');
				this.registerErrorChecking('user.meta.lastname', 'required', 'Enter a last name');
				this.registerErrorChecking('user.meta.email', 'email', 'Invalid email');
			}
		},


		//send ajax request to save data
		save()
		{
			if (this.errorCheck() > 0) {
				return;
			}

			if(this.user.new) {
				this.newUser();
			}
			else {
				this.updateUser();
			}
		},


		//send post request to server to save new user
		newUser()
		{
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
		updateUser()
		{
			$('#rosterModal').modal('hide');

			var self = this;
			var url = this.$parent.prefix + '/member/' + this.user.member_id;
			var switchRole = false;
			if (this.user.isPlayer && (this.user.role === 'coach' || this.user.role === 'ghost_coach')) switchRole = true;
			if (this.user.isCoach && (this.user.role === 'player' || this.user.role === 'ghost_player')) switchRole = true;
			var data = {
				meta: this.user.meta,
				isGhost: this.user.isGhost,
				role: switchRole,
				admin: this.user.isAdmin,
			} 
			this.$root.put(url, 'EditUser_update', data);
		},


		//close modal
		cancel()
		{
			$('#rosterModal').modal('hide');
		},


		//show popup asking to confirm the kick, send event to Team if they do
		kick(confirm)
		{
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

			if(this.user.ghost) {
				var msg = 'Ghost deleted';
			}
			else if(this.user.isFan) {
				var msg = 'Fan removed';
			}
			else {
				var msg = 'User kicked, replaced with ghost';
			}

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
		confirm()
		{
			if(this.user.isFan) {
				//this is a fan
				this.kickMsg = 'Remove ' + this.user.firstname + ' as a fan?';
				this.kickText = '';
				this.kickButton = 'REMOVE';
			}

			else if(this.user.isGhost) {
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


