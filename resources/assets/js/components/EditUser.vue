
<template>
	<div class="col-xs-12 EditUser">

		<div v-show="confirmKick || user.deniedByAdmin" class="EditUser__confirm">
			<!-- show this div when user is confirming a kick on someone -->
			<div class="row kick">
				<h3>{{ kickMsg }}</h3>
				<p>{{ kickText }}</p>
			</div>
			<div class="row EditUser__buttons">
		    <div class="col-xs-6 col-xs-offset-3 col-sm-3 col-sm-offset-2">
		    	<a class="btn btn-delete btn-block btn-md" @click="confirm(true)">
		    		<span v-show="! loading_delete" >{{ kickButton }}</span>
						<spinner v-show="loading_delete" color="white"></spinner>
		    	</a>
		    </div>
		    <div class="col-xs-6 col-xs-offset-3 col-sm-3 col-sm-offset-1">
		    	<a class="btn btn-cancel btn-block btn-md outline" @click="confirm(false)">CANCEL</a>
		    </div>
		  </div>
		</div>

    <form v-else @submit.prevent="save()">
    	<div v-if="! user.new" class="row EditUser__role">

	    	<div v-if="user.isCoach || user.isPlayer" class="col-xs-6">
	        <label>Is a&hellip;</label>
	        <select data-style="btn-select btn-lg" EditUser="role" class="selectpicker form-control show-tick"
	        				data-max-options="1" v-model="user.role">  
	          <option value="player">Player</option> 
	          <option value="coach">Coach</option>    
	        </select>
	      </div>

	      <div v-if="user.acceptedByAdmin" class="col-xs-6">
	        <label>Replacing ghost&hellip;</label>
	        <select data-style="btn-select btn-lg" EditUser="replace" class="selectpicker form-control show-tick"
	        				v-model="user.replace">
	        	<option value="no">Don't replace any</option>
	        	<option v-for="ghost in ghosts" :value="ghost.member_id">{{ ghost.name }}</option>
	        </select>
	        <span class="input-info">They will inherit that ghost's stats</span>
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
		    	<a class="btn btn-primary btn-block btn-md" @click="save()">
		    		<spinner v-show="loading_save" color="white"></spinner>
		    		<span v-show="! loading_save">SAVE</span>
		    	</a>
		    </div>
		    <div class="col-xs-6 col-xs-offset-3 col-sm-3 col-sm-offset-0">
		    	<a v-if="!user.new && !user.isGhost && !user.acceptedByAdmin" class="btn btn-delete btn-block btn-md" @click="kick()">KICK</a>
		    	<a v-if="!user.new && user.isGhost && !user.acceptedByAdmin" class="btn btn-delete btn-block btn-md" @click="kick()">DELETE</a>
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

	props: ['user', 'users', 'positions'],

	mixins: [ Validator ],

	data() {
		
		return {
			ghostEmail: false,
			ghosts: [],
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
			loading_save: false,
			loading_delete: false,
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
		/**
		 * If a different user is clicked, reload all the data
		 */
		user(newUser, oldUser)
		{
			if (newUser.id !== oldUser.id) {
				this.initialize();
			}
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
			let msg = "User info saved";
			if (this.user.acceptedByAdmin) {
				msg = "User joined team"
			}

			$('#rosterModal').modal('hide');
			this.$dispatch('Team_updated_members', response.data.members);
			this.$root.banner('good', msg);
			this.loading_save = false;
		},

		EditUser_new(response)
		{
			$('#rosterModal').modal('hide');
			this.$dispatch('Team_updated_members', response.data.members);
			this.$root.banner('good', "User created");	
			this.loading_save = false;
		},

		EditUser_kick(response)
		{
			let msg = 'User kicked, replaced with ghost'

			if (this.user.deniedByAdmin) {
				msg = 'Player denied'
			}
			else if (this.user.isGhost) {
				msg = 'Ghost deleted';
			}
			else if (this.user.isFan) {
				msg = 'Fan removed';
			}
			
			this.$dispatch('Team_updated_members', response.data.members);

			$('#rosterModal').modal('hide');
			this.confirmKick = false;
			this.$root.banner('good', msg);	
			this.loading_delete = false;
		},

		EditUser_failed(response)
		{
			this.loading_save = false;

			this.$root.errorMsg(response.data.error);
		},
	},

	methods: {

		// whenever the data reloads, reset the input elements and some logic
		initialize()
		{
			this.confirmKick = false;

			if (this.user.deniedByAdmin) {
				this.kick();
				return;
			}

			if (this.user.acceptedByAdmin) {
				this.user.replace = 'no';
				this.sortGhosts();
			}

			if (this.user.isGhost) {
				this.ghostEmail = false;
				if (typeof this.user.meta.email === 'string' && this.user.meta.email.length) {
					this.ghostEmail = true;
				}
			}

			setTimeout(function() {
				this.renderPickers();
			}.bind(this), 10)
			

			this.setErrorChecking();
		},

		setErrorChecking()
		{
			this.resetErrorChecking(); // reset any previous error checks

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

			let picker = $('.selectpicker[EditUser="role"]');
			picker.selectpicker().selectpicker('render').selectpicker('refresh');
			picker.on('changed.bs.select', function(e) {
				newValue = e.currentTarget.value;
				if (newValue === 'player') {
					this.user.isPlayer = true;
					this.user.isCoach = false;
				}
				else if (newValue === 'coach') {
					this.user.isCoach = true;
					this.user.isPlayer = false;
				}
			}.bind(this))
			

			// only show this selectpicker when admin is accepting a new player onto the team
			if (this.user.acceptedByAdmin) {
				let picker = $('.selectpicker[EditUser="replace"]');
				picker.selectpicker().selectpicker('render').selectpicker('refresh');
			}

			$('.selectpicker[EditUser="positions[0]"]').selectpicker({noneSelectedText: 'None'}).selectpicker('render');
			$('.selectpicker[EditUser="positions[1]"]').selectpicker({noneSelectedText: 'None'}).selectpicker('render');
		},


		sortGhosts()
		{
			if (this.role === 'player') {
				this.ghosts = this.users.filter((user) => {
					return user.isGhost && user.isPlayer;
				});
			}
			else if (this.role === 'coach') {
				this.ghosts = this.users.filter((user) => {
					return user.isGhost && user.isCoach;
				});
			}
		},


		/**
		 * Persist changes to user to the database
		 */
		save()
		{
			if (this.errorCheck() > 0) {
				return;
			}

			this.loading_save = true;

			if(this.user.new) {
				this.newUser();
			}
			else {
				this.updateUser();
			}
		},


		/**
		 * The user is new
		 */
		newUser()
		{
			var self = this;
			var url = this.$parent.prefix + '/member'; 
			var data = {
				firstname: this.user.meta.firstname,
				lastname: this.user.meta.lastname,
				role: this.user.role,
				email: this.user.meta.email,
				meta: {
					num: this.user.meta.num,
					positions: this.user.meta.positions,
				},
			} 

			this.$root.post(url, 'EditUser_new', data, 'EditUser_failed');
		},


		/**
		 * The user already existed and is being updated
		 */
		updateUser()
		{
			let data = {
				meta: this.user.meta,
				isGhost: this.user.isGhost,
				role: this.user.role,
				admin: this.user.isAdmin,
			} 

			if (this.user.acceptedByAdmin) {
				// they were accepted by the team admin to join the team
				data.requestedToJoin = true;
				data.replace = this.user.replace;
			}

			let url = this.$parent.prefix + '/member/' + this.user.member_id;
			this.$root.put(url, 'EditUser_update', data, 'EditUser_failed');
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
				if (this.user.deniedByAdmin) {
					// hide the whole popup
					this.cancel();
				}
				return;
			}

			this.loading_delete = true;
			this.$root.delete(this.$parent.prefix + '/member/' + this.user.member_id, 'EditUser_kick');
		},


		// change the popup so they can confirm their kick on a player
		kick()
		{
			if (this.user.deniedByAdmin) {
				// they asked to join but are being shot down as we speak
				this.kickMsg = `Deny ${this.user.firstname} from joining the team?`
				this.kickText = '';
				this.kickButton = 'DENY';
			}

			else if (this.user.isFan) {
				// they're a fan
				this.kickMsg = `Remove ${this.user.firstname} as a fan?`
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
				this.kickMsg = `Remove ${this.user.firstname} from the team?`
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


