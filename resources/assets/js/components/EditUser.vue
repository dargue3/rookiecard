
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
		    	<a class="btn btn-delete btn-block btn-md" @click="confirm(true)">{{ kickButton }}</a>
		    </div>
		    <div class="col-xs-6 col-xs-offset-3 col-sm-3 col-sm-offset-1">
		    	<a class="btn btn-cancel btn-block btn-md outline" @click="confirm(false)">CANCEL</a>
		    </div>
		  </div>
		</div>

    <form v-else @submit.prevent="save()">
    	<div v-if="! user.new" class="row EditUser__role">
	    	<div v-if="user.isCoach || user.isPlayer" class="col-xs-6">
	        <label>Is a...</label>
	        <select data-style="btn-select btn-lg" EditUser="role" class="selectpicker form-control show-tick"
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
          				v-model="user.meta.num" autocomplete="false" maxlength="2">
          <span v-show="errors.user.meta.num" class="form-error">{{ errors.user.meta.num }}</span>
        </div>
        <div class="col-xs-6 col-sm-4">
          <label>Primary</label>
          <select data-style="btn-select btn-lg" EditUser="positions[0]" class="selectpicker form-control show-tick"
          				multiple data-max-options="1" v-model="user.meta.positions[0]">
            <option v-for="position in positions" :value="position">{{ position | uppercase }}</option>    
          </select>
        </div>
        <div class="col-xs-6 col-sm-4">
          <label>Secondary</label>
          <select data-style="btn-select btn-lg" EditUser="positions[1]" class="selectpicker form-control show-tick"
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
			originalRole: null,
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

	ready()
	{
		this.initialize();
	},

	computed:
	{
		role()
		{
			return this.user.role;
		},
	},

	watch:
	{
		// if user changed, set inputs to correct new states
		user()
		{
			this.originalRole = this.user.role
			this.initialize();
		},

		// if role changed, set inputs to correct new states
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

		EditUser_new(response)
		{
			$('#rosterModal').modal('hide');
			this.$dispatch('Team_updated_members', response.data.members);
			this.$root.banner('good', "User created");	
		},

		EditUser_kick(response)
		{
			var msg = 'User kicked, replaced with ghost'
			if(this.user.isGhost) {
				msg = 'Ghost deleted';
			}
			else if(this.user.isFan) {
				msg = 'Fan removed';
			}

			$('#rosterModal').modal('hide');
			this.confirmKick = false;
			this.$dispatch('Team_updated_members', response.data.members);
			this.$root.banner('good', msg);	
		},
	},

	methods: {

		// whenever the data reloads, reset the input elements and some logic
		initialize()
		{
			this.confirmKick = false;

			if (this.originalRole === null) this.originalRole = this.user.role

			if(this.user.isGhost) {
				this.ghostEmail = false;
				if(this.user.meta.email.length) {
					this.ghostEmail = true;
				}
			}

			if (this.user.role.includes('player')) {
				this.user.isPlayer = true;
				this.user.isCoach = false;
			}
			if (this.user.role.includes('coach')) {
				this.user.isPlayer = false
				this.user.isCoach = true;
			}

			setTimeout(function() {
				this.renderPickers();
			}.bind(this), 10)
			

			this.setErrorChecking();
		},

		setErrorChecking()
		{
			this.registerErrorChecking('user.meta.num', 'jersey', 'Choose between 00-99');

			//  extra details to check if editing a ghost
			if (this.user.isGhost) {
				this.registerErrorChecking('user.meta.firstname', 'required', 'Enter a first name');
				this.registerErrorChecking('user.meta.lastname', 'required', 'Enter a last name');
				this.registerErrorChecking('user.meta.email', 'email', 'Invalid email');
			}
		},


		renderPickers()
		{
			$('input[bootstrap-switch="EditUser"]').bootstrapSwitch(this.adminOptions);
			$('input[bootstrap-switch="EditUser"]').bootstrapSwitch('state', this.user.isAdmin);

			$('.selectpicker[EditUser="role"]').selectpicker().selectpicker('render');

			$('.selectpicker[EditUser="positions[0]"]').selectpicker({noneSelectedText: 'None'}).selectpicker('render');
			$('.selectpicker[EditUser="positions[1]"]').selectpicker({noneSelectedText: 'None'}).selectpicker('render');
		},


		// send ajax request to save data
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


		// send post request to server to save new user
		newUser()
		{
			var self = this;
			var url = this.$parent.prefix + '/member'; 
			var data = {
				firstname: this.user.meta.firstname,
				lastname: this.user.meta.lastname,
				email: this.user.meta.email,
				role: this.user.role,
			} 
			
			this.$root.post(url, 'EditUser_new', data);
		},


		// send put request to server to update user
		updateUser()
		{
			var url = this.$parent.prefix + '/member/' + this.user.member_id;
			var switchRole = false;
			if (this.user.role !== this.originalRole) switchRole = true;
			var data = {
				meta: this.user.meta,
				isGhost: this.user.isGhost,
				role: switchRole,
				admin: this.user.isAdmin,
			} 
			this.$root.put(url, 'EditUser_update', data);
		},


		// close modal
		cancel()
		{
			$('#rosterModal').modal('hide');
		},


		/**
		 * The user has confirmed their choice to kick a user
		 *
		 * @param {boolean} confirm
		 */
		confirm(confirm)
		{
			if (! confirm) {
				// they hit cancel
				this.confirmKick = false;
				return;
			}

			this.$root.delete(this.$parent.prefix + '/member/' + this.user.member_id, 'EditUser_kick');
		},


		// change the popup so they can confirm their kick on a player
		kick()
		{
			if (this.user.isFan) {
				// they're a fan
				this.kickMsg = 'Remove ' + this.user.firstname + ' as a fan?';
				this.kickText = '';
				this.kickButton = 'REMOVE';
			}

			else if (this.user.isGhost) {
				// they're a ghost, stats will be deleted too
				this.kickMsg = 'Delete this ghost?';

				if (this.user.isPlayer) {
					this.kickText = 'If you delete this ghost, all associated stats will be deleted as well.';
				}
				else {
					this.kickText = '';
				}
				
				this.kickButton = 'DELETE';
			}

			else {
				// they're a player
				this.kickMsg = 'Kick ' + this.user.firstname + ' from the team?';
				this.kickText = "They will be replaced with a ghost user";
				this.kickButton = 'KICK';
			}

			this.confirmKick = true;
		},
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


