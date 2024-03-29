
<template>
	<div>
		<div class="page-wrapper">
			
			<div class="CreateTeam -container">

				<div v-show="page === 'info'" transition="fade-slow" class="CreateTeam__title">
					<h1>Manage your team on Rookiecard</h1>
					<p>Organize your calendar, stats, and roster in one place</p>
					<p>Fully automated email notifications for new events, cancelations, and more</p>
					<p>Fans can stay updated on team activities</p>
				</div>

				<!-- Basic info -->
				<div v-show="page === 'info'" transition="fade-slow">
					
					<div class="CreateTeam__header bottom-separator">
						<h2>Team Info</h2>
						<p>First tell us some basic info about your team</p>
					</div>	
					<div class="CreateTeam__inputs">

						<div class="form-group">
							<label>Team Name</label>
							<input type="text" class="form-control has-info" :class="{'form-error' : errors.name}" 
										required maxlength="25" placeholder="WHS Varsity" v-model="name">
							<span class="form-error">{{ errors.name }}</span>				
						</div>

						<div class="form-group">
							<label>Team URL</label>
							<input type="text" class="form-control has-info" :class="{'form-error' : errors.teamname}"
											maxlength="18" placeholder="whs_basketball" required @blur="checkAvailability()" v-model="teamname">
							<span v-show="errors.teamname" class="form-error">{{ errors.teamname }}</span>
							<span v-else class="input-info">rookiecard.io/team/{{ teamname }}</span>	
						</div>

					</div>

					<div class="CreateTeam__inputs one-line">

						<div class="form-group">
							<label>Sport</label>
							<select data-style="btn-select btn-lg" class="selectpicker form-control show-tick has-info"
											 required v-model="sport">
	              <option value="basketball">Basketball</option>    
	              <option value="baseball" disabled>Baseball</option>    
	              <option value="softball" disabled>Softball</option>    
	              <option value="football" disabled>Football</option>    
            	</select>
							<span class="input-info">More coming soon!</span>
						</div>

						<div class="form-group">
							<label>I am a&hellip;</label>
							<select data-style="btn-select btn-lg" class="selectpicker form-control show-tick"
											required v-model="userIsA">
								<option value="player">Player</option>
								<option value="coach">Coach</option>
								<option value="fan">Fan</option>
							</select>
						</div>
					</div>


					<div class="CreateTeam__inputs one-line">
						<div class="form-group">
							<label>Age Group</label>
							<select data-style="btn-select btn-lg" class="selectpicker form-control show-tick" 
											v-model="age">
								<option value="12-and-under">12 and Under</option>
								<option value="13-18">13-18 Years</option>
								<option value="college">College</option>
								<option value="adult">Adult</option>
							</select>
						</div>

						<div class="form-group">
							<label>League</label>
							<select data-style="btn-select btn-lg" class="selectpicker form-control show-tick" 
											CreateTeam="gender" v-model="gender">
								<template v-if="age === '12-and-under' || age === '13-18'">
									<option value="male">Boy's</option>
									<option value="female">Girl's</option>
									<option value="coed">Co-ed</option>
								</template>
								<template v-else>
									<option value="male">Men's</option>
									<option value="female">Women's</option>
									<option value="coed">Co-ed</option>
								</template>
							</select>
						</div>
					</div>

						
						
					

					<div class="CreateTeam__inputs">

						<div class="form-group">
							<label>Home Field</label>
							<input type="text" class="form-control" maxlength="50" 
											placeholder="Cowell Stadium" v-model="homefield">
						</div>

						<div class="form-group">
							<google-autocomplete :city.sync="city" :long.sync="long" :timezone.sync="timezone"
																		:lat.sync="lat" label="City / Town" :error="errors.city">
							</google-autocomplete>
						</div>
						
					</div>

					<div class="CreateTeam__inputs">
						<div class="form-group">
							<label>Slogan</label>
							<span class="remaining"><strong>{{ slogan.length }}</strong> / 50</span>
							<input type="text" class="form-control" maxlength="50" 
											placeholder="Home of the Warriors" v-model="slogan">
							<span class="form-error">{{ errors.slogan }}</span>
						</div>
					</div>
					

					<div class="CreateTeam__buttons">
						<div class="right">
							<a class="btn btn-primary -chevron -sm -right" v-touch:tap="changePage">NEXT
								<i class="material-icons btn-chevron -right">chevron_right</i>
							</a>	
							<span class="form-error">{{ errors.page.info }}</span>
						</div>
					</div>	

				</div> <!-- end of team info -->





				<div v-show="page === 'roster'" transition="fade-slow">

					<div class="CreateTeam__header bottom-separator roster-notes">
						<h2>Roster</h2>
						<p>Enter info about the players and coaches that are on this team.</p>
						<p>Your team will be populated with "ghost" users for the time being.</p>
						<p>If you'd like to invite someone to join, add their email.</p>
						<p><strong>Don't worry, you can edit all of this information at any time!</strong></p>
					</div>


					<h3 class="CreateTeam__subheader">Players</h3>

					<!-- disabled inputs to show logged-in user as a player -->
					<div v-show="userIsA == 'player'" class="CreateTeam__inputs">
						<div class="one-line">
							<div class="name">
								<label>First</label>
								<input type="text" class="form-control" v-model="$root.user.firstname" disabled>
							</div>
							<div class="name">	
								<label>Last</label>
								<input type="text" class="form-control" v-model="$root.user.lastname" disabled>
							</div>
						</div>
						
						<div class="email">
							<label>Email</label>
							<input type="text" class="form-control" v-model="$root.user.email" disabled>
						</div>
					</div> <!-- end userIsA player -->


			
					<div v-for="player in players" class="CreateTeam__inputs" transition="slide-sm">

						<div class="one-line">
							<div class="name">
								<label>First Name</label>
								<input type="text" class="form-control" v-model="player.firstname" 
												:class="{'form-error' : errors.players[$index].firstname}" 
												:placeholder="dummy[$index].firstname" maxlength="100">
								<span class="form-error">{{ errors.players[$index].firstname }}</span>
							</div>
							<div class="name">	
								<label>Last Name</label>
								<input type="text" class="form-control" v-model="player.lastname"
											:class="{'form-error' : errors.players[$index].lastname}"  
												:placeholder="dummy[$index].lastname" maxlength="100">
								<span class="form-error">{{ errors.players[$index].lastname }}</span>
							</div>
						</div>

						<div class="email">
							<label>Email</label>
							<input type="text" class="form-control" v-model="player.email" 
											:class="{'form-error' : errors.players[$index].email}" :placeholder="dummy[$index].email"
											maxlength="100" disabled>
							<span class="form-error">{{ errors.players[$index].email }}</span>
						</div>

					</div> <!-- end v-for players -->

					<div class="add-user">
            <i v-touch:tap="players.push({firstname: '', lastname: '', email: ''})"
            		class="glyphicon glyphicon-plus">
            </i>
            <i v-touch:tap="players.pop()"
              	class="glyphicon glyphicon-minus">
            </i>
					</div>




					<h3 class="CreateTeam__subheader top-separator">Coaches</h3>

					<!-- disabled inputs to show logged-in user as a coach -->
					<div v-show="userIsA == 'coach'" class="CreateTeam__inputs">
						<div class="one-line">
							<div class="name">
								<label>First</label>
								<input type="text" class="form-control" v-model="$root.user.firstname" disabled>
							</div>
							<div class="name">	
								<label>Last</label>
								<input type="text" class="form-control" v-model="$root.user.lastname" disabled>
							</div>
						</div>
						
						<div class="email">
							<label>Email</label>
							<input type="text" class="form-control" v-model="$root.user.email" disabled>
						</div>

					</div> <!-- end userIsA coach -->




					<div v-for="coach in coaches" class="CreateTeam__inputs" transition="slide-sm">
						<div class="one-line">
							<div class="name">
								<label>First Name</label>
								<input type="text" class="form-control" v-model="coach.firstname" 
												:class="{'form-error' : errors.coaches[$index].firstname}" 
												:placeholder="dummy[$index].firstname" maxlength="100">
								<span class="form-error">{{ errors.coaches[$index].firstname }}</span>
							</div>
							<div class="name">	
								<label>Last Name</label>
								<input type="text" class="form-control" v-model="coach.lastname"
											:class="{'form-error' : errors.coaches[$index].lastname}"  
												:placeholder="dummy[$index].lastname" maxlength="100">
								<span class="form-error">{{ errors.coaches[$index].lastname }}</span>
							</div>
						</div>
						
						<div class="email">
							<label>Email</label>
							<input type="text" class="form-control" v-model="coach.email" 
											:class="{'form-error' : errors.coaches[$index].email}" :placeholder="dummy[$index].email"
											maxlength="100" disabled>
							<span class="form-error">{{ errors.coaches[$index].email }}</span>
						</div>	

					</div><!-- end v-for coaches -->

					<div class="add-user">
            <i v-touch:tap="coaches.push({firstname: '', lastname: '', email: ''})"
            		class="glyphicon glyphicon-plus">
            </i>
            <i v-touch:tap="coaches.pop()"
              	class="glyphicon glyphicon-minus">
            </i>
					</div>
						  
					

					<div class="CreateTeam__buttons">
						<div class="left">
							<a class="btn btn-cancel -no-margin -chevron -sm -left" v-touch:tap="page = 'info'">BACK
								<i class="material-icons btn-chevron -left">chevron_left</i>
							</a>	
						</div>

						<div class="right">
							<a class="btn btn-primary -no-margin save" v-touch:tap="save">
								<span v-show="! loading_save">CREATE TEAM</span>
								<spinner v-show="loading_save" color="white"></spinner>
							</a>
							<span class="form-error">{{ errors.page.roster }}</span>
						</div>
					</div>		

					<div class="notes">
						<div class="blue-container">
							<p class="title">What about privacy?</p>
							<p class="text">Privacy, notifications, and more can be edited in the settings tab later!</p>
						</div>
					</div>
					
				</div> <!-- end of roster  -->
				
			</div>
			

		</div>

			<!-- include the footer at bottom -->
		<div class="Footer -light">
	    <p>® 2017 Rookiecard LLC</p>
		</div>

	</div>	
</template>

<script>

import GoogleTypeahead 	from '../Helpers/GoogleTypeahead.vue'
import Validator 				from '../../mixins/Validator.js'

export default  {
	
	name: 'CreateTeam',

	mixins: [ Validator ],

	props: [],

	components:
	{
		'google-autocomplete' : GoogleTypeahead,
	},

	beforeCompile()
	{
		this.attachErrorChecking();
	},

	created()
	{
		this.$root.get(this.prefix + '/dummy/' + this.gender, 'CreateTeam_dummy');
	},

	data()
	{
		return {
			prefix: this.$root.prefix + '/team/create',
			page: 'info',
			name: '',
			teamname: '',
			sport: 'basketball',
			userIsA: 'fan',
			gender: 'male',
			age: '13-18',
			homefield: '',
			city: '',
			long: '',
			lat: '',
			timezone: '',
			slogan: '',
			players: [{firstname: '', lastname: '', email: ''}],
			coaches: [{firstname: '', lastname: '', email: ''}],
			dummy: [{firstname: 'Ghosty', lastname: 'McGhostFace', email: 'ghost@rookiecard.com'}],
			checkingAvailability: false,
			nameAvailable: true,
			loading_save: false,
		}
	}, 

	methods:
	{
		/**
		 * Ask the server if the teamname that was just typed is available
		 */
		checkAvailability()
		{
			if (this.errorCheck('teamname') === 0) {
				this.$root.get(`${this.$root.prefix}/team/create/${this.teamname}`, 'CreateTeam_availability');
			}
		},


		/**
		 * Send request to server to create this team
		 * 
		 * @return Routes to /team/<teamname>
		 */
		save()
		{
			if (this.errorCheck() > 0) {
				this.setPageError('Correct errors before submitting');
				return;
			}

			this.setPageError('');

			// build up object of all the team data
			var data = {
				name: 			this.name,
				teamURL: 		this.teamname,
				slogan: 		this.slogan,
				gender: 		this.gender,
				age: 				this.age,
				homefield: 	this.homefield,
				city: 			this.city,
				long: 			this.long,
				lat: 				this.lat,
				timezone: 	this.timezone,
				sport: 			this.sport,
				userIsA: 		this.userIsA,
				players: 		this.players,
				coaches: 		this.coaches,
			}

			data = this.filterSubmittedData(data);

			this.loading_save = true;
			this.$root.post(this.prefix, 'CreateTeam_submit', data);
		},


		/**
		 * Before sending to server, filter out unnecessary data
		 */
		filterSubmittedData(data)
		{
			if (! this.players.length) {
				delete data.players
			}

			if (! this.coaches.length) {
				delete data.coaches;
			}

			return data;
		},


		/**
		 * User has clicked the "Next >" button
		 * Error check and move the page forward
		 *
		 * @return {void}
		 */
		changePage()
		{
			let errors = 0;

			this.setPageError('Correct errors before continuing');

			if (this.page === 'info') {
				errors += this.errorCheck('name');
				errors += this.errorCheck('teamname');
				errors += this.errorCheck('city');
			}
			else if (this.page === 'roster') {
				errors = this.errorCheck();
			}

			if (! errors) {
				this.setPageError('');

				if (this.page === 'info') {
					this.$root.scrollTo({top: 0}, true); // scroll the page to the top
					setTimeout(() => { this.page = 'roster'; }, 550); // wait for scroll before transitioning
				}
			}
		},

		
		/**
		 * Tell Validator.js which variables to error check
		 *
		 * @return {void} 
		 */
		attachErrorChecking()
		{
			let messages = ['Pick something memorable!', 'Use 18 characters or less', 'Numbers and letters only'];
			this.registerErrorChecking('teamname', 'required|max:18|alpha_dash', messages);
			this.registerErrorChecking('name', 'required', 'Enter a name');
			this.registerErrorChecking('city', 'required', 'Search for your city');
							
			this.registerErrorChecking('players.*.email', 'email', 'Invalid email', false, 50);
			this.registerErrorChecking('players.*.firstname', 'required', 'Enter a first name', false, 50);
			this.registerErrorChecking('players.*.lastname', 'required', 'Enter a last name', false, 50);

			this.registerErrorChecking('coaches.*.email', 'email', 'Invalid email', false, 50);
			this.registerErrorChecking('coaches.*.firstname', 'required', 'Enter a first name', false, 50);
			this.registerErrorChecking('coaches.*.lastname', 'required', 'Enter a last name', false, 50);

			this.$set('errors.page.info', '');
			this.$set('errors.page.roster', '');
		},

		/**
		 * Set an error below the "Next >" button
		 */
		setPageError(error) 
		{
			this.$set('errors.page.' + this.page, error);
		},
	},

	events:
	{
		/**
		 * Request returned with dummy data used as placeholders for ghosts
		 */
		CreateTeam_dummy(response)
		{
			this.dummy = response.data.dummy;
		},

		
		/**
		 * Request back from the server about whether this team URL is available
		 */
		CreateTeam_availability(response)
		{
			if (! response.data.available) {
				this.errors.teamname = 'Already taken'
				this.nameAvailable = false;
			}
			else {
				this.nameAvailable = true;
				this.errors.teamname = '';
			}
		},

		/**
		 * Request returned after creating the team
		 */
		CreateTeam_submit(response)
		{
			this.$dispatch('App_becameAMember', response.data.team);

			// use a delay because it felt TOO fast without one
			setTimeout(() => { this.$router.go('/team/' + response.data.team.teamname)}, 150);
		},
	},

	watch:
	{
		/**
		 * If the team's gender has changed, update the dummy names to be accurate
		 */
		gender()
		{
			this.$root.get(this.prefix + '/dummy/' + this.gender, 'CreateTeam_dummy');
		},

		/**
		 * Change Men's -> Boy's, Women's -> Girl's when the age group changes
		 */
		age()
		{
			setTimeout(() => {
				$('[CreateTeam="gender"]').selectpicker('render')
					.selectpicker('refresh')
					.selectpicker('val', this.gender);
				}, 50)
		},
	},

	ready()
	{
		$(function() {

			$('.selectpicker').selectpicker();

		});
	}

};

</script>

<style lang="stylus">
	
@import '/resources/assets/stylus/variables.styl'

.page-wrapper 
	display flex
	flex-flow row
	justify-content center
	padding 0.5em

.CreateTeam
	flex 1
	display flex
	flex-flow row wrap
	margin-top 30px
	max-width 700px
	div
		flex-basis 100%
		
.CreateTeam__title
	text-align center
	margin-bottom 35px
	h1
		margin-bottom 20px
		+mobile()
			font-size 23px
	p
		font-size 15px
		color rc_dark_gray
		&:not(:first-child)
			margin-top 10px
		+mobile()
			font-size 13px


.CreateTeam__header
	display flex
	flex-flow row wrap
	margin 0 10px
	+mobile()
		margin 0
	h2
		flex-basis 100%
		margin-bottom 20px
		+mobile()
			font-size 21px
	div
		margin-top 10px
		flex-basis 100%
		span
			color rc_dark_gray
	p
		font-size 15px
		+mobile()
			font-size 13px

.CreateTeam__subheader 
	margin-left 10px
	margin-top 40px
	+mobile()
		margin-left 0
		
			
	
.CreateTeam__inputs
	display flex
	flex-flow row
	margin-top 25px
	+mobile()
		margin-top 50px
		flex-flow column
	&.one-line
		+mobile()
			flex-flow row
			.form-group:last-child
				margin-left 10px
	.form-group
		flex 1
		margin 5px 10px
		+mobile()
			margin 5px 0
	.one-line
		flex-basis 50%
		display flex
		flex-flow row nowrap
		margin-left 10px
		+mobile()
			margin-bottom 10px
			flex-basis 100%
			margin-left 0
		.name
			flex 1
			flex-basis 25%
			+the-first-one()
				margin-right 10px
	.email
		flex-basis 50%
		margin-right 10px
		margin-left 10px
		+mobile()
			margin 0

			
.CreateTeam__buttons
	display flex
	flex-flow row
	justify-content space-between
	margin-top 50px
	.right
		display flex
		flex-flow column
		align-items flex-end
		margin-right 10px
		.form-error
			margin-top 10px
	.left
		display flex
		flex-flow column
		align-items flex-start
		margin-left 10px
	
.roster-notes
	p
		margin 4px 0px
		+the-first-one()
			margin-top 0
		+the-last-one()
			margin-bottom 0
	
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
	
.notes
	display flex
	flex-flow row nowrap
	justify-content center
	align-items center
	margin 30px 10px 0 10px
	.blue-container
		text-align center
	

</style>