
<template>
	<div>
		<div class="page-wrapper">
			
			<div class="CreateTeam">
			

				<div v-show="page === 'info'" class="CreateTeam__title">
					<h2>Manage your team on Rookiecard</h2>
					<p>Organize your calendar, stats, and roster in one place</p>
					<p>Fully automated email notifications for new events, cancelations, and more</p>
					<p>Fans can stay updated on team activities</p>
				</div>



				<!-- Basic info -->
				<div v-show="page === 'info'">
					
					<div class="CreateTeam__header">
						<h3>Team Info</h3>
						<p>First tell us some basic info about your team</p>
						<div>
							<span>Step 1 / 3</span>
						</div>
						<hr>
					</div>	
					<div class="CreateTeam__inputs">

						<div>
							<label>Team Name</label>
							<input type="text" class="form-control" :class="{'form-error' : errors.name}" 
										required maxlength="25" placeholder="WHS Varsity Basketball" v-model="name">
							<span class="form-error">{{ errors.name }}</span>				
						</div>

						<div>
							<label>Team URL</label>
							<input type="text" class="form-control" :class="{'form-error' : errors.teamname}"
											maxlength="18" placeholder="whsbasketball16" required 
											debounce="600" v-model="teamname">
							<span v-show="errors.teamname" class="form-error">{{ errors.teamname }}</span>
							<span v-else class="input-info">rookiecard.com/team/{{ teamname }}</span>	
						</div>

					</div>

					<div class="CreateTeam__inputs">

						<div>
							<label>Sport</label>
							<select data-style="btn-select btn-lg" CreateTeam="sport" class="selectpicker form-control show-tick"
											 required v-model="sport">
	              <option value="basketball">Basketball</option>    
	              <option value="baseball" disabled>Baseball</option>    
	              <option value="softball" disabled>Softball</option>    
	              <option value="football" disabled>Football</option>    
            	</select>
							<span class="input-info">More coming soon!</span>
						</div>

						<div>
							<label>I am a...</label>
							<select data-style="btn-select btn-lg" CreateTeam="userIsA" class="selectpicker form-control show-tick"
											required v-model="userIsA">
								<option value="player">Player</option>
								<option value="coach">Coach</option>
								<option value="fan">Fan</option>
							</select>
						</div>

						<div>
							<label>Sex</label>
							<select data-style="btn-select btn-lg" class="selectpicker form-control show-tick" 
											CreateTeam="gender" v-model="gender">
								<option value="male">Men's</option>
								<option value="female">Women's</option>
								<option value="coed">Coed</option>
							</select>
						</div>
						
					</div>

					<div class="CreateTeam__inputs">

						<div>
							<label>Home Field</label>
							<input type="text" class="form-control" maxlength="50" 
											placeholder="Cowell Stadium" v-model="homefield">
						</div>


						<google-autocomplete :city.sync="city" :long.sync="long"
																	:lat.sync="lat" label="City / Town" :error="errors.city">
						</google-autocomplete>

					</div>

					<div class="CreateTeam__inputs">
						<div>
							<label>Slogan</label>
							<span class="remaining"><strong>{{ slogan.length }}</strong> / 50</span>
							<input type="text" class="form-control" maxlength="50" 
											placeholder="Home of the Warriors" v-model="slogan">
							<span class="form-error">{{ errors.slogan }}</span>
						</div>
					</div>

					

					<!-- <div class="CreateTeam__inputs">
						<div>
							<form action="/team/create/unhfootball/pic" class="dropzone" id="create-team-dropzone"></form>
						</div>
					</div> -->
					


					<div class="CreateTeam__buttons">
						<div><!-- empty as placeholder for non-existent back button --></div>
						<div>
							<a class="btn btn-primary --chevron --sm --right" @click="changePage">NEXT
								<i class="material-icons btn-chevron --right">chevron_right</i>
							</a>	
							<span class="form-error">{{ errors.page.info }}</span>
						</div>
					</div>	

				</div> <!-- end of team info -->
				



				<div v-show="page === 'stats'">

					<div class="CreateTeam__header">
						<h3>Stats</h3>
						<p>Choose the stats you want to track for your team and players</p>
						<p>These can be changed at any time</p>
						<div>
							<span>Step 2 / 3</span>
						</div>
						<hr>
					</div>	
					<div class="CreateTeam__inputs">

						<div>
							<label>Inputted by Admin</label>
							<select data-style="btn-select btn-lg" CreateTeam="userStats" class="selectpicker form-control show-tick"
											 data-selected-text-format="count" multiple required 
											 data-size="false" v-model="userSelected">
	              <option v-for="stat in userStatsList" :value="userStatKeys[$index]" 
	              				:disabled="stat.disabled">{{ stat.val }}</option>      
            	</select>
            	<p v-for="stat in userStatsList">{{ userStatsList[stat] }}</p> 
						</div>

						<div>
							<label>Calculated by Rookiecard</label>
							<select data-style="btn-select btn-lg" CreateTeam="rcStats" class="selectpicker form-control show-tick"
											 data-selected-text-format="count" multiple required 
											 data-size="false" v-model="rcSelected">
	              <option v-for="stat in rcStatsList" :value="rcStatKeys[$index]" 
	              				:disabled="stat.disabled">{{ stat.val }}</option>       
            	</select>
						</div>

					</div>

					<div class="CreateTeam__buttons">
						<div>
							<a class="btn btn-cancel --chevron --sm --left" @click="page = 'info'">
								<i class="material-icons btn-chevron --left">chevron_left</i>BACK
							</a>	
						</div>
						<div>
							<a class="btn btn-primary --chevron --sm --right" @click="changePage">NEXT
								<i class="material-icons btn-chevron --right">chevron_right</i>
							</a>	
							<span class="form-error">{{ errors.page.stats }}</span>
						</div>
					</div>		
				</div> <!-- end of stats  -->



				<div v-show="page === 'roster'">

					<div class="CreateTeam__header">
						<h3>Roster</h3>
						<p>Enter info about the players and coaches that are on this team.</p>
						<p>Your team will be populated with "ghost" users.</p>
						<p>If you'd like to invite someone to join, add their email.</p>
						<p><strong>Don't worry, you can edit all of this information at any time!</strong></p>
						<div>
							<span>Step 3 / 3</span>
						</div>
						<hr>
					</div>

					<h4 class="CreateTeam__subheader">Players</h4>
					<!-- disabled inputs to show logged-in user as a player -->
					<div v-show="userIsA == 'player'" class="CreateTeam__inputs">
						<div class="--name">
							<label>First</label>
							<input type="text" class="form-control" v-model="$root.user.firstname" disabled>
						</div>
						<div class="--name">	
							<label>Last</label>
							<input type="text" class="form-control" v-model="$root.user.lastname" disabled>
						</div>
						<div class="--email">
							<label>Email</label>
							<input type="text" class="form-control" v-model="$root.user.email" disabled>
						</div>
					</div>

					<div v-for="player in players" class="CreateTeam__inputs" transition="slide-sm">
						<div class="--name">
							<label>First Name</label>
							<input type="text" class="form-control" v-model="player.firstname" 
											:placeholder="dummy[$index].firstname" maxlength="100">
						</div>
						<div class="--name">	
							<label>Last Name</label>
							<input type="text" class="form-control" v-model="player.lastname" 
											:placeholder="dummy[$index].lastname" maxlength="100">
						</div>
						<div class="--email">
							<label>Email</label>
							<input type="text" class="form-control" v-model="player.email" 
											:class="{'form-error' : errors.players[$index].email}" :placeholder="dummy[$index].email"
											maxlength="100">
							<span class="form-error">{{ errors.players[$index].email }}</span>
						</div>	
					</div>
					<div class="add-user">
            <i @click="players.push({firstname: '', lastname: '', email: ''})"
            		class="glyphicon glyphicon-plus">
            </i>
            <i @click="players.pop()"
              	class="glyphicon glyphicon-minus">
            </i>
					</div>

					<hr class="CreateTeam__separator">

					<h4 class="CreateTeam__subheader">Coaches</h4>
					<!-- disabled inputs to show logged-in user as a coach -->
					<div v-show="userIsA == 'coach'" class="CreateTeam__inputs">
						<div class="--name">
							<label>First</label>
							<input type="text" class="form-control" v-model="$root.user.firstname" disabled>
						</div>
						<div class="--name">	
							<label>Last</label>
							<input type="text" class="form-control" v-model="$root.user.lastname" disabled>
						</div>
						<div class="--email">
							<label>Email</label>
							<input type="text" class="form-control" v-model="$root.user.email" disabled>
						</div>
					</div>

					<div v-for="coach in coaches" class="CreateTeam__inputs" transition="slide-sm">
						<div class="--name">
							<label>First Name</label>
							<input type="text" class="form-control" v-model="coach.firstname" 
											:placeholder="dummy[$index].firstname" maxlength="100">
						</div>
						<div class="--name">	
							<label>Last Name</label>
							<input type="text" class="form-control" v-model="coach.lastname" 
											:placeholder="dummy[$index].lastname" maxlength="100">
						</div>
						<div class="--email">
							<label>Email</label>
							<input type="text" class="form-control" v-model="coach.email" 
											:class="{'form-error' : errors.coaches[$index].email}" :placeholder="dummy[$index].email"
											maxlength="100">
							<span class="form-error">{{ errors.coaches[$index].email }}</span>
						</div>	
					</div>
					<div class="add-user">
            <i @click="coaches.push({firstname: '', lastname: '', email: ''})"
            		class="glyphicon glyphicon-plus">
            </i>
            <i @click="coaches.pop()"
              	class="glyphicon glyphicon-minus">
            </i>
					</div>
						  
					

					<div class="CreateTeam__buttons">
						<div>
							<a class="btn btn-cancel --chevron --sm --left" @click="page = 'stats'">BACK
								<i class="material-icons btn-chevron --left">chevron_left</i>
							</a>	
						</div>
						<div>
							<a class="btn btn-primary save" @click="save">CREATE TEAM</a>
							<span class="form-error">{{ errors.page.roster }}</span>
						</div>
					</div>		
				</div> <!-- end of stats  -->
				
			</div>
			

		</div>

			<!-- include the footer at bottom -->
		<div class="Footer --light">
	    <p>® 2016 Rookiecard LLC</p>
		</div>

	</div>	
</template>

<script>

/*Dropzone.options.createTeamDropzone = {
	paramName: 'pic',
	dictDefaultMessage: 'Drag and drop a file or click here',
	headers: {'X-CSRF-TOKEN': $('#_token').attr('value') },
	maxFiles: 1,
	maxFilesize: 10,
};*/


import GoogleTypeahead 	from './GoogleTypeahead.vue'
import StatsSelection 	from '../mixins/StatsSelection.js'
import Validator 				from '../mixins/Validator.js'

export default  {
	
	name: 'CreateTeam',

	mixins: [StatsSelection, Validator],

	props: [],

	components:
	{
		'google-autocomplete' : GoogleTypeahead
	},

	created()
	{
		this.$root.get(this.prefix + '/dummy/' + this.gender, 'CreateTeam_dummy');

		this.attachErrorChecking();
	},

	data()
	{
		return {
			prefix: this.$root.prefix + 'team/create',
			page: 'info',
			name: '',
			teamname: '',
			slogan: '',
			gender: 'male',
			homefield: '',
			city: '',
			long: '',
			lat: '',
			sport: 'basketball',
			userIsA: 'fan',
			location: {city: {zip: '24'}},
			players: [{firstname: '', lastname: '', email: ''}],
			coaches: [{firstname: '', lastname: '', email: ''}],
			dummy: [{firstname: 'Ghosty', lastname: 'McGhostFace', email: 'ghost@rookiecard.com'}],
		}
	}, 

	methods: {

		save() {

			if (this.errorCheck() > 0) {
				this.setPageError('Correct errors before submitting');
				return;
			}

			// build up object of all the team data
			var data = {
				name: 			this.name,
				teamname: 	this.teamname,
				slogan: 		this.slogan,
				gender: 		this.gender,
				homefield: 	this.homefield,
				city: 			this.city,
				long: 			this.long,
				lat: 				this.lat,
				sport: 			this.sport,
				userIsA: 		this.userIsA,
				players: 		this.players,
				coaches: 		this.coaches,
				numPlayers: this.numPlayers,
				numCoaches: this.numCoaches,
				userStats: 	this.userSelected,
				rcStats: 		this.rcSelected,
			}

			this.$root.post(this.prefix, 'CreateTeam_submit', data);
		},


		changePage()
		{
			var errors = this.errorCheck();

			if (! errors) {

				this.setPageError('');

				if (this.page === 'info') {
					this.page = 'stats';
				}
				else if (this.page === 'stats') {
					this.page = 'roster';
				}
			}
			else {
				this.setPageError('Correct errors before continuing');
			}
		},

		// tell Validator.js which fields to error check
		attachErrorChecking()
		{
			var msg = ['Enter a team URL', 'Use 18 characters or less', 'Use only letters and numbers'];
			this.registerErrorChecking('teamname', 'required|max:18|alpha_num', msg);
			this.registerErrorChecking('name', 'required', ['Enter a name']);
			this.registerErrorChecking('city', 'required', ['Search for your city']);
							
			this.registerErrorChecking('players.*.email', 'email', ['Invalid email']);
			this.registerErrorChecking('coaches.*.email', 'email', ['Invalid email']);

			// register a few manual messages to set if need be
			this.manualErrorChecking('page.info');
			this.manualErrorChecking('page.stats');
			this.manualErrorChecking('page.roster');
		},

		/**
		 * Set an error below the "next" button
		 */
		setPageError(error) 
		{
			this.$set('errors.page.' + this.page, error);
		},
	},

	events:
	{
		// store dummy names and emails for placeholders
		CreateTeam_dummy(response)
		{
			this.dummy = response.data.dummy;
		},

		// was the teamname available?
		CreateTeam_available(response)
		{
			if (response.data.available) {
				this.errors.teamname = '';
			}
			else {
				this.errors.teamname = 'Already taken, try another';
			}
		},

		// route the user to the newly created team
		CreateTeam_submit(response)
		{
			// use a delay because it felt TOO fast without one
			setTimeout(function() {
				this.$router.go('/team/' + response.data.team.teamname);
			}.bind(this), 750);
		},

		
		initSelectPicker()
		{
			var userPicker = $('[CreateTeam="userStats"]');
			var rcPicker = $('[CreateTeam="rcStats"]');

			userPicker.selectpicker({});
			rcPicker.selectpicker({});

			userPicker.selectpicker('val', this.userSelected);
			rcPicker.selectpicker('val', this.rcSelected);
			userPicker.selectpicker('refresh');
			rcPicker.selectpicker('refresh');

			// set up listeners to tell StatsSelection mixin to update on change
			userPicker.on('changed.bs.select', function(e, clickedIndex, newValue, oldValue) {
				this.setDependencies();
			}.bind(this))

			rcPicker.on('changed.bs.select', function(e, clickedIndex, newValue, oldValue) {
				this.setDependencies();
			}.bind(this))


		},

		renderSelectPicker()
		{
			var userPicker = $('[CreateTeam="userStats"]');
			var rcPicker = $('[CreateTeam="rcStats"]');

			userPicker.selectpicker('refresh');
			rcPicker.selectpicker('refresh');
			userPicker.selectpicker('val', this.userSelected);
			rcPicker.selectpicker('val', this.rcSelected);
			userPicker.selectpicker('render');
			rcPicker.selectpicker('render');
		},
	},

	watch:
	{
		// if they've changed the sport, update the stats associated with it too
		sport()
		{
			this.initSelections(this.sport);
		},

		gender()
		{
			this.$root.get(this.prefix + '/dummy/' + this.gender, 'CreateTeam_dummy');
		},

		teamname()
		{
			if (! this.errors.teamname && this.teamname.length) {
				// ask the server if this teamname is available
				var url = this.prefix + '/' + this.teamname;
				this.$root.post(url, 'CreateTeam_available');
			}
		}
	},

	ready()
	{
		// calling StatsSelection mixin function
		this.initSelections(this.sport);

		$(function() {

			$('[CreateTeam="sport"]').selectpicker({});
			$('[CreateTeam="numPlayers"]').selectpicker({});
			$('[CreateTeam="numCoaches"]').selectpicker({});
			$('[CreateTeam="gender"]').selectpicker({});
			$('[CreateTeam="userIsA"]').selectpicker({});

		}.bind(this))
	}

};

</script>

<style lang="stylus">
	
@import '/resources/assets/stylus/variables.styl'

.page-wrapper 
	display flex
	flex-flow row
	justify-content center

.CreateTeam
	flex 1
	display flex
	flex-flow row wrap
	margin-top 40px
	margin-bottom 100px
	padding 20px
	background white
	max-width 750px
	div
	hr
		flex-basis 100%
		
.CreateTeam__header
	display flex
	flex-flow row wrap
	margin 25px 20px 0px 25px
	h3
		flex-basis 100%
		margin-bottom 20px
	div
		margin-top 10px
		flex-basis 100%
		span
			color rc_dark_gray
	p
		font-size 15px

.CreateTeam__subheader 
	margin-left 20px
	&:first-child
		margin-top 20px		
		
.CreateTeam__title
	text-align center
	margin-bottom 10px
	h2
		margin-bottom 20px
	p
		font-size 15px
		color rc_dark_gray	
			
	
.CreateTeam__inputs
	display flex
	flex-flow row
	margin-top 25px
	@media screen and (max-width 767px)
		margin-top 50px
	.remaining
		font-size 13px
		color rc_med_gray
		float right	
	div
		flex 1
		margin 5px 20px
		@media screen and (max-width 767px)
			flex-basis 100%
	div.--smallSelect
		flex none
		flex-basis 75px
	div.--name
		flex-basis 25%
	div.--email
		flex-basis 50%	
	div.dropdown-menu
		&.open
			margin 0px
			.bs-actionsbox
				margin 5px 0px
			.btn-group
				margin-left 0px	
			.text-muted
				color rc_blue
		.disabled
			a
				color rc_lite_gray

			
.CreateTeam__buttons
	display flex
	flex-flow row
	margin-top 50px
	div
		flex 1
	a.--right
		float right
		margin-right 20px
	a.--left
		float left	
		margin-left 20px
	a.save
		float right
		margin-right 20px	
	span.form-error
		float right
		margin-right 20px
		margin-top 10px
		
.CreateTeam__separator
	margin-right 20px
	margin-left 20px		
	
.add-user
	.glyphicon:hover
		cursor pointer
	.glyphicon-minus
		color rc_red_hover
		margin-left 10px
	.glyphicon-plus
		color link_blue
		margin-right 10px
	margin 25px	
	text-align center
	font-size 20px
	

</style>