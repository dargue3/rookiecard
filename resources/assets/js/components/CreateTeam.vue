
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
							<span v-show="errors.name" class="form-error">{{ errors.name }}</span>				
						</div>

						<div>
							<label>Team Username</label>
							<input type="text" class="form-control" :class="{'form-error' : errors.teamname}"
											maxlength="18" @keyup="availability | debounce 750" placeholder="whsbasketball16" 
											required v-model="teamname">
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
            	<span v-show="errors.sport" class="form-error">{{ errors.sport }}</span>
							<span v-else class="input-info">More coming soon!</span>
						</div>

						<div>
							<label>Gender</label>
							<select data-style="btn-select btn-lg" class="selectpicker form-control show-tick" 
											CreateTeam="gender" v-model="gender">
								<option value="male">Men</option>
								<option value="female">Women</option>
								<option value="coed">Coed</option>
							</select>
							<span v-show="errors.gender" class="form-error">{{ errors.gender }}</span>
						</div>
						
					</div>

					<div class="CreateTeam__inputs">

						<div>
							<label>Home Field</label>
							<input type="text" class="form-control" maxlength="25" 
											placeholder="Cowell Stadium" v-model="location.homefield">
							<span v-show="errors.homefield" class="form-error">{{ errors.homefield }}</span>
						</div>


						<google-autocomplete :city.sync="location.city" :long.sync="location.long"
																	:lat.sync="location.lat" label="City / Town" :error="errors.location">
						</google-autocomplete>

					</div>

					<div class="CreateTeam__inputs">
						<div>
							<label>Slogan</label>
							<span class="remaining"><strong>{{ slogan.length }}</strong> / 50</span>
							<input type="text" class="form-control" maxlength="50" 
											placeholder="Home of the Warriors" v-model="slogan">
							<span v-show="errors.slogan" class="form-error">{{ errors.slogan }}</span>
						</div>
					</div>

					

					<!-- <div class="CreateTeam__inputs">
						<div>
							<form action="/team/create/unhfootball/pic" class="dropzone" id="create-team-dropzone"></form>
						</div>
					</div> -->
					


					<div class="CreateTeam__buttons">
						<div><!-- empty as placeholder for non-existant back button --></div>
						<div>
							<a class="btn btn-primary --chevron --sm --right" @click="changePage">NEXT
								<i class="material-icons btn-chevron --right">chevron_right</i>
							</a>	
							<span v-show="errors.totals.info > 0" class="form-error">Correct errors on page before continuing</span>
						</div>
					</div>	

				</div> <!-- end of team info -->
				



				<div v-show="page === 'stats'">
					<!-- stats -->

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
	              <option v-for="stat in rcStatsList" :value="rcStatKeys[$index]" :disabled="stat.disabled"
	              				:data-subtext="stat.subtext">{{ stat.val }}</option>       
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
							<span v-show="errors.totals.stats > 0" class="form-error">Correct errors on page before continuing</span>
						</div>
					</div>		
				</div> <!-- end of stats  -->



				<div v-show="page === 'roster'">
					<!-- stats -->

					<div class="CreateTeam__header">
						<h3>Roster</h3>
						<p>Enter info about the players and coaches that will be apart of this team.</p>
						<p>If you'd like to invite someone to this team, enter their email.</p>
						<p>If you leave an email field blank, a "ghost user" will be used instead.</p>
						<p><strong>Don't worry, you can edit all of these settings at any time!</strong></p>
						<div>
							<span>Step 3 / 3</span>
						</div>
						<hr>
					</div>

					<h4 class="CreateTeam__subheader">Who are you?</h4>
					<div class="CreateTeam__inputs">
						<div class="--addPlayers">
							<label>I am a..</label>
							<select data-style="btn-select btn-lg" CreateTeam="userIsA" class="selectpicker form-control show-tick"
											required v-model="userIsA">
								<option value="player">Player</option>
								<option value="coach">Coach</option>
								<option value="fan">Fan</option>
							</select>
						</div>
						<hr class="CreateTeam__separator">
					</div>

					<h4 class="CreateTeam__subheader">Add Players</h4>
					<div class="CreateTeam__inputs">
						<div class="--addPlayers">
							<label>Number of Players</label>
							<select data-style="btn-select btn-lg" CreateTeam="numPlayers" class="selectpicker form-control show-tick"
											v-model="numPlayers">
								<option v-for="n in 50" :value="n + 1">{{ n + 1 }}</option>
							</select>
						</div>
					</div>
					<div v-for="n in numPlayers" class="CreateTeam__inputs">
						<div class="--name">
							<label>Name</label>
							<input type="text" class="form-control" v-model="players[$index].name" 
											:class="{'form-error' : errors.players[$index].name}" placeholder="Leonardo DaVinci"
											maxlength="100">
							<span v-show="errors.players[$index]" class="form-error">{{ errors.players[$index].name }}</span>
						</div>
						<div class="--email">
							<label>Email</label>
							<input type="text" class="form-control" v-model="players[$index].email" 
											:class="{'form-error' : errors.players[$index].email}" placeholder="leodavinc@gmail.com"
											maxlength="100">
							<span v-show="errors.players[$index].email" class="form-error">{{ errors.players[$index].email }}</span>
						</div>	
					</div>
					<hr class="CreateTeam__separator">
					<h4 class="CreateTeam__subheader">Add Coaches</h4>
					<div class="CreateTeam__inputs">

						<div class="--addPlayers">
							<label>Number of Coaches</label>
							<select data-style="btn-select btn-lg" CreateTeam="numCoaches" class="selectpicker form-control show-tick"
											v-model="numCoaches">
								<option v-for="n in 10" :value="n + 1">{{ n + 1 }}</option>
							</select>
						</div>
					</div>
					<div v-for="n in numCoaches" class="CreateTeam__inputs">
						<div class="--name">
							<label>Name</label>
							<input type="text" class="form-control" v-model="coaches[$index].name" 
											:class="{'form-error' : errors.coaches[$index].name}" placeholder="Nikola Tesla"
											maxlength="100">
							<span v-show="errors.coaches[$index]" class="form-error">{{ errors.coaches[$index].name }}</span>
						</div>
						<div class="--email">
							<label>Email</label>
							<input type="text" class="form-control" v-model="coaches[$index].email" 
											:class="{'form-error' : errors.coaches[$index].email}" placeholder="tesla@gmail.com"
											maxlength="100">
							<span v-show="errors.coaches[$index].email" class="form-error">{{ errors.coaches[$index].email }}</span>
						</div>
					</div>
						  
					

					<div class="CreateTeam__buttons">
						<div>
							<a class="btn btn-cancel --chevron --sm --left" @click="page = 'stats'">BACK
								<i class="material-icons btn-chevron --left">chevron_left</i>
							</a>	
						</div>
						<div>
							<a class="btn btn-primary save" @click="save">CREATE TEAM</a>
							<span v-show="errors.totals.roster > 0" class="form-error">Correct errors on page before saving</span>
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
import Stats 						from './Stats.vue'

export default  {
	
	name: 'CreateTeam',

	mixins: [StatsSelection],

	props: [],

	components: {
		'google-autocomplete' : GoogleTypeahead,
		'rc-stats'							: Stats,
	},

	data() {

		var players = [];
		var coaches = [];
		var playerErrors = [];
		var coachErrors = [];

		//initialize arrays of players/coaches for v-for/v-model
		for(var x = 1; x <= 50; x++) {
			players.push({
				name: 'Kobe Bryant',
				email: 'kbryant24@gmail.com',
				role: 1,
			},
			{
				name: 'Chris Paul',
				email: 'cp3@gmail.com',
				role: 1,
			});
			coaches.push({
				name: 'Bryan Klapes',
				email: '',
				role: 3
			});
			playerErrors.push({
				name: '',
				email: '',
			});
			coachErrors.push({
				name: '',
				email: '',
			});
		}
		
		return {
			prefix: this.$root.prefix,
			page: 'roster',
			name: '',
			teamname: 'whsbasketball',
			slogan: 'Home of Warriors Basketball',
			gender: '0',
			location: {
				homefield: '',
				city: 'Hampton, NH',
				long: -70.8389219,
				lat: 42.9375932
			},
			sport: 'basketball',
			userIsA: 'fan',
			numPlayers: 2,
			numCoaches: 1,
			players: players,
			coaches: coaches,
			errors: {
				totals: {
					info: 0,
					stats: 0,
					roster: 0,
				},
				name: '',
				teamname: '',
				sport: '',
				gender: '',
				location: '',
				homefield: '',
				slogan: '',
				players: playerErrors,
				coaches: coachErrors,
			},
		}
	}, 

	methods: {

		save() {
			this.errors.totals.roster = this.errorCheck(this.page);

			if(this.errors.totals.roster > 0)
				return;

			//build up object of all the team data
			var data = {
				name: 			this.name,
				teamname: 	this.teamname,
				slogan: 		this.slogan,
				gender: 		this.gender,
				homefield: 	this.location.homefield,
				city: 			this.location.city,
				long: 			this.location.long,
				lat: 				this.location.lat,
				sport: 			this.sport,
				userIsA: 		this.userIsA, 
				numPlayers: this.numPlayers,
				numCoaches: this.numCoaches,
				userStats: 	this.userSelected,
				rcStats: 		this.rcSelected,
			}
			var players = [];
			var coaches = [];
			for(var x = 0; x < this.numPlayers; x++) {
				players.push(this.players[x]);
			}
			for(var x = 0; x < this.numCoaches; x++) {
				coaches.push(this.coaches[x]);
			}
			data.players = players;
			data.coaches = coaches;

			//send the post request to the server
			var self = this;
			var url = this.prefix + 'team/create';
			this.$http.post(url, data)
				.then(function(response) {
	
					//felt like this process was *too* quick, add artifical delay
					setTimeout(function() {
						//route the user to their newly created team
						self.$router.go('/team/' + response.data.team.teamname);
					}, 750);							
				})
				.catch(function(response) {
					self.parseErrors(response.data.error);
				});
		},


		//if there were errors returned from the server when creating the team,
		//bind them to the inputs and show the correct page
		parseErrors(errors) {
			this.$root.banner('bad', "Correct the errors and try again");
			var changed = false;

			//errors is structured like 
			//errors: { teamname : ['error1', 'error2']}
			for(var key in errors) {

				if(key === 'lat' || key === 'long' || key === 'city')
					key = 'location';

				this.errors[key] = errors[key];

				//if there are errors on the first page, jump there
				if(key === 'name' || key === 'teamname' || key === 'sport' ||
						key === 'gender' || key === 'location' || key === 'slogan' || key === 'homefield') {
					this.page = 'info';
					changed = true;
				}
				else if(!changed && (key === 'players' || key === 'coaches')) {
					this.page = 'roster';
					changed = true;
				}
			}

		},


		changePage() {
			this.errors.totals[this.page] = this.errorCheck(this.page);

			if(!this.errors.totals[this.page]) {
				if(this.page === 'info')
					this.page = 'stats';
				else if(this.page === 'stats')
					this.page = 'roster';
				else
					this.$root.banner('bad', "There was an error, try refreshing the page");
			}
		},

		availability() {
			var errors = this.errorCheck('teamname');
			var self = this;
			if(!errors) {
				//ask the server if this teamname is available
				var url = this.$root.prefix + '/team/create/' + this.teamname;
				this.$http.post(url)
					.then(function(response) {
						if(response.data.available)
							self.errors.teamname = '';
						else
							self.errors.teamname = 'Already taken, try another';
					})
			}
		}, 

		//checks all the fields for errors
		//returns number of errors, error === 0 is good
		errorCheck(field) {
			var errors = 0;

			//check teamname, sometimes checks individually on input debounce
			if(field === 'teamname' || field === 'info') {
				//make sure they're only using alphanumerics for teamname
				var alphaNum = /^[a-zA-Z0-9]+$/;
				if(!this.teamname.length) {
					//need at least one character
					this.errors.teamname = 'Enter a team username';
					errors++;
				}
				else if(this.teamname.length > 18) {
					//too long
					this.errors.teamname = 'Must be 18 characters or less';
					errors++;
				}
				else if(!this.teamname.match(alphaNum)) {
					this.errors.teamname = 'Only use letters and numbers';
					errors++;
				}
				else {
					//if its fine, set error to empty
					this.errors.teamname = '';
				}
			}

			//check all info fields if trying to move to stats section
			if(field === 'info') {
				//team name
				if(!this.name.length) {
					errors++;
					this.errors.name = 'Choose a name for your team';
				}
				else
					this.errors.name = '';

				if(!this.sport) {
					errors++;
					this.errors.sport = 'Choose a sport';
				}
				else
					this.errors.sport = '';

				//check that the google typeahead has returned data
				if(!this.location.city || !this.location.lat || !this.location.long) {
					errors++;
					this.errors.location = "Enter your team's location";
				}
				else
					this.errors.location = '';
			}

			//check that the people on the rosters have valid inputs
			if(field === 'roster') {
				//loop through players
				for(var x = 0; x < this.numPlayers; x++) {
					//check that they've added a name for every player
					var player = this.players[x];
					if(!player.name) {
						errors++;
						this.errors.players[x].name = "Enter the player's name";
					}
					else
						this.errors.players[x].name = '';

					//check that any emails inputted are valid emails
					if(player.email.length) {
						if(!this.$root.validateEmail(player.email)) {
							errors++;
							this.errors.players[x].email = "Not a valid email address";
						}
						else
							this.errors.players[x].email = '';
					}
					else
						this.errors.players[x].email = '';
				}

				//loop through coaches
				for(var x = 0; x < this.numCoaches; x++) {
					//check that they've added a name for every coach
					var coach = this.coaches[x];
					if(!coach.name) {
						errors++;
						this.errors.coaches[x].name = "Enter the coach's name";
					}
					else
						this.errors.coaches[x].name = '';

					//check that any emails inputted are valid emails
					if(coach.email.length) {
						if(!this.$root.validateEmail(coach.email)) {
							errors++;
							this.errors.coaches[x].email = "Not a valid email address";
						}
						else
							this.errors.coaches[x].email = '';
					}
					else
						this.errors.coaches[x].email = '';
				}
			}


			return errors;
		}
	},

	events: {
		initSelectPicker() {

			var userPicker = $('.selectpicker[CreateTeam="userStats"]');
			var rcPicker = $('.selectpicker[CreateTeam="rcStats"]');

			userPicker.selectpicker({});
			rcPicker.selectpicker({});

			userPicker.selectpicker('val', this.userSelected);
			rcPicker.selectpicker('val', this.rcSelected);
			userPicker.selectpicker('refresh');
			rcPicker.selectpicker('refresh');

			//set up listeners to tell StatsSelection mixin to update which are disabled 
			userPicker.on('changed.bs.select', function(e, clickedIndex, newValue, oldValue) {
				this.setDependencies();
			}.bind(this))

			rcPicker.on('changed.bs.select', function(e, clickedIndex, newValue, oldValue) {
				this.setDependencies();
			}.bind(this))


		},

		renderSelectPicker() {
			var userPicker = $('.selectpicker[CreateTeam="userStats"]');
			var rcPicker = $('.selectpicker[CreateTeam="rcStats"]');

			userPicker.selectpicker('refresh');
			rcPicker.selectpicker('refresh');
			userPicker.selectpicker('val', this.userSelected);
			rcPicker.selectpicker('val', this.rcSelected);
			userPicker.selectpicker('render');
			rcPicker.selectpicker('render');
		},
	},

	watch: {
		//if they've changed the sport, update the stats associated with it too
		sport(val) {
			this.initSelections(this.sport);

			if(this.errors.sport && val.length) {
				//also if there were any existing errors, remove
				this.errors.sport = '';
			}
		},

		//if they've inputted something in the name field, remove error saying they didn't
		name(val) {
			if(val.length) {
				this.errors.name = '';
			}
		},

		teamLocation(val) {
			if(val.length) {
				this.errors.location = '';
			}
		},

		//add this user to the list of coaches or players depending on how the respond to question
		userIsA(val, old) {
			var name = this.$root.user.firstname + ' ' + this.$root.user.lastname;
			var email = this.$root.user.mail;

			//they're a player, add their details to the top of the players array
			if(val === 'player') {
				//add a player, remove a coach if that's what they were before
				this.numPlayers++;
				if(old === 'coach') this.numCoaches--;

				this.players = this.players.filter(function(player) {
					return player.name !== name;
				})
				this.coaches = this.coaches.filter(function(coach) {
					return coach.name !== name;
				})
				this.players.unshift({
					name: name,
					email: email,
				});
			}

			//they're a coach, add their details to the top of the coaches array
			else if(val === 'coach') {
				//add a coach, remove a player if that's what they were before
				this.numCoaches++;
				if(old === 'player') this.numPlayers--;

				this.players = this.players.filter(function(player) {
					return player.name !== name;
				})
				this.coaches = this.coaches.filter(function(coach) {
					return coach.name !== name;
				})
				this.coaches.unshift({
					name: name,
					email: email,
				});
			}

			//they're a fan, remove their details from coaches and players arrays
			else if(val === 'fan') {
				if(old === 'player') this.numPlayers--;
				if(old === 'coach') this.numCoaches--;

				this.players = this.players.filter(function(player) {
					return player.name !== name;
				})
				this.coaches = this.coaches.filter(function(coach) {
					return coach.name !== name;
				})
			}
			//refresh the pickers
			$('.selectpicker[CreateTeam="numPlayers"]').selectpicker('val', this.numPlayers);
			$('.selectpicker[CreateTeam="numCoaches"]').selectpicker('val', this.numCoaches);
		},
	},

	computed: {
		teamLocation() {
			return this.location.city;
		}
	},

	ready() {

		//calling StatsSelection mixin function
		this.initSelections(this.sport);

		$(function() {

			$('.selectpicker[CreateTeam="sport"]').selectpicker({});
			$('.selectpicker[CreateTeam="numPlayers"]').selectpicker({});
			$('.selectpicker[CreateTeam="numCoaches"]').selectpicker({});
			$('.selectpicker[CreateTeam="gender"]').selectpicker({});
			$('.selectpicker[CreateTeam="userIsA"]').selectpicker({});

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
	padding-top 25px
	padding-bottom 25px
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
	flex-flow row wrap
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
	div.--addPlayers
		flex none
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
	

</style>