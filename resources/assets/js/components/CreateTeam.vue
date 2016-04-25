
<template>
	<div>
		<div class="page-wrapper">
			<form @submit.prevent>
				<div class="CreateTeam">
				

					<div class="CreateTeam__title">
						<h2>Manage your team on Rookiecard</h2>
						<p>Organize your calendar, stats, and roster in one place</p>
						<p>Fully automated email notifications for new events, cancelations, and more</p>
						<p>Fans can stay updated on team activities</p>
					</div>


					<div class="CreateTeam__header">
						<h3>Team Info</h3>
						<hr>
					</div>	
					<div class="CreateTeam__inputs">

						<div>
							<label>Team Name</label>
							<input type="text" class="form-control" required maxlength="25" 
											placeholder="WHS Varsity Basketball" v-model="name">
							<span v-show="errors.name" class="form-error">{{ errors.name }}</span>				
						</div>

						<div>
							<label>Team Username</label>
							<input type="text" class="form-control" :class="[errors.teamname ? 'form-error' : '']"
											maxlength="18" @keyup="availability | debounce 750" placeholder="whsbasketball16" 
											required v-model="teamname">
							<span v-show="errors.teamname" class="form-error">{{ errors.teamname }}</span>
							<span v-else class="little">rookiecard.com/team/{{teamname}}</span>	
						</div>

					</div>

					<div class="CreateTeam__inputs">

						<div>
							<label>Sport</label>
							<select data-style="btn-select btn-lg" CreateTeam class="selectpicker form-control show-tick"
											 required v-model="sport">
	              <option value="0">Basketball</option>    
	              <option value="1">Baseball</option>    
	              <option value="2">Softball</option>    
            	</select>
							<span class="little">More coming soon!</span>
						</div>

						<div>
							<label>Slogan</label>
							<span class="remaining">{{ slogan.length }} / 35</span>
							<input type="text" class="form-control" maxlength="35" 
											placeholder="Home of the Warriors" v-model="slogan">
						</div>
						
					</div>

					<div class="CreateTeam__inputs">

						<div>
							<label>Home Field</label>
							<input type="text" class="form-control" maxlength="25" 
											placeholder="Cowell Stadium" v-model="location.title">
						</div>

						<!-- has its own div wrapper built in -->
						<google-maps-typeahead :city.sync="location.city" :long.sync="location.long"
																		:lat.sync="location.lat" label="City/Town"></google-maps-typeahead>
					</div>
					
				
				</div>
			</form>

		</div>
	</div>	
</template>

<script>

import GoogleTypeahead from './GoogleTypeahead.vue'

export default  {
	
	name: 'CreateTeam',

	props: [],

	components: {
		'google-maps-typeahead' : GoogleTypeahead,
	},

	data() {
		
		return {
			name: '',
			teamname: '',
			slogan: '',
			pic: '',
			location: {
				title: '',
				city: '',
				long: '',
				lat: ''
			},
			sport: '0',
			players: [],
			coaches: [],
			errors: {
				name: '',
				teamname: '',
				homefield: '',
				slogan: '',
			},
		}
	}, 

	created() {

	},

	computed: {
		
	},

	methods: {
		availability() {
			var errors = this.errorCheck('teamname');
			var self = this;
			if(errors === 0) {
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
		errorCheck() {
			var errors = 0;

			//check teamname
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

			//check other stuff


			return errors;
		}
	},

	ready() {
		$(function() {

			$('.selectpicker[CreateTeam]').selectpicker({});

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
	padding 15px
	background white
	max-width 700px
	div
		flex-basis 100%
		
.CreateTeam__header
	display flex
	flex-flow row wrap
	h3
		flex-basis 100%
		margin-bottom 0
	hr
		flex-basis 100%
		
.CreateTeam__title
	text-align center
	margin-bottom 35px
	h2
		margin-bottom 20px
	p
		color rc_dark_gray	
			
	
.CreateTeam__inputs
	display flex
	flex-flow row wrap
	margin-top 25px
	.little
		font-size 13px
		color rc_med_gray
	.remaining
		font-size 13px
		color rc_med_gray
		float right	
	div
		flex 1
		margin 5px 20px
		@media screen and (max-width 767px)
			flex-basis 100%
	

</style>