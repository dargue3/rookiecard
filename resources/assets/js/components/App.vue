
<template>

	<div id="forBlurring">
	
    <nav class="navbar navbar-default navbar-fixed-top no-highlight" role="navigation">
      <div class="container">

         <!-- logo and hamburger  -->
        <div class="navbar-header">
            <button id='hamburger' type="button" class="navbar-toggle" data-toggle="collapse" data-target="#navbar-left">
                <span class="sr-only">Toggle navigation</span>
                <span class="icon-bar"></span>
                <span class="icon-bar"></span>
                <span class="icon-bar"></span>
            </button>
            <a v-link="{name: 'home'}"><img id="navLogo" src="/images/logo.png" class="navbar-brand navbar-brand-centered"></a>
        </div>

            
        <div class="collapse navbar-collapse text-center" id="navbar-left">

          <!-- search bar -->
          <ul class="nav navbar-nav">
            <div id='navSearchDiv' >
              <i id="searchIcon" class="glyphicon glyphicon-search"></i>

              <form method="GET" action="/search" accept-charset="UTF-8">
          			<input id="searchBar" class="form-control navbar-form search-form" placeholder="Search players and teams..." 
          							tabindex="1" 	required="" role="search" name="q" type="search">
          		</form>
            </div>
          </ul>

          <!-- nav links -->
          <ul class="nav navbar-nav navbar-right">
            <li><a v-link="{name: 'user', params: {name: user.username}}" class="nav-link">Profile</a></li>
            <li id="teamDropdown" class="dropdown">
              <a class="dropdown-toggle" data-toggle="dropdown">
                <span v-cloak class="badge badge-danger">{{ totalCount }}</span>&nbsp;Teams <span id='teamCaret' class="caret"></span></a>
              <ul class="dropdown-menu dropdown-menu-left" role="menu">

            		<li v-if="memberOf.length" class="dropdown-header"><small>MEMBER OF</small></li>
                <li v-for="team in memberOf">
                	<a v-link="{name: 'team', params: {name: team.teamname}}" class="nav-link">
                		<span v-show="team.notifications" class="badge badge-danger">{{ team.notifications }}</span>
                		{{ team.name }}
                	</a>
                </li>
                <li v-if="memberOf.length" id='divider' class="divider"></li>

                <li v-if="fanOf.length" class="dropdown-header"><small>FAN OF</small></li>
                <li v-for="team in fanOf">
                	<a v-link="{name: 'team', params: {name: team.teamname}}" class="nav-link">
                		<span v-show="team.notifications" class="badge badge-danger">{{ team.notifications }}</span>
                		{{ team.name }}
                	</a>
                <li v-if="fanOf.length" id='divider' class="divider"></li>

                <li><a v-link="{name: 'team', params: {name: 'create'}}" class="nav-link">Create a Team</a></li>

              </ul>
            </li>
            <li id="optionsDropdown" class="dropdown">
              <a href="#" id="navOptions" class="dropdown-toggle" data-toggle="dropdown">Options <span id='optionsCaret' class="caret"></span></a>
              <ul class="dropdown-menu" role="menu">
                <li><a href="#" class="nav-link">Settings</a></li>
                <li><a href="#" class="nav-link">Submit Feedback</a></li>
                <li id='divider' class="divider"></li>
                <li><a href="/logout" class="nav-link">Log out</a></li>
              </ul>
            </li>
          </ul>
        </div>
      </div>
    </nav>

    <nav style='display: none' class="navbar navbar-default navbar-fixed-top" role="navigation">
      <div class="container">
        <div class="navbar-header">
          <a href="/"><img id="navLogo" src="/images/logo.png" class="navbar-brand navbar-brand-centered"></a>
        </div>
      </div>
    </nav>

		<rc-alert :type="alertType" :show.sync="alert" transition="fade-fast" v-show="alert > 0">{{ alertMessage }}</rc-alert>
	
		<router-view id="router" transition="fade-slow" class="router"></router-view>

		<!-- include the footer at bottom -->
		<div class="Footer">
		    <p>® 2016 Rookiecard LLC</p>
		</div>
	
	</div>
	
</template>




<script>

import Alert from './Alert.vue'

export default  {

	name: 'App',

	props: [],

	components: {
		'rc-alert' : Alert,
	},

	data() {

		return {
			prefix: '/api/v1/',
			user: {},
			teams: [],
			alert: 0,
			alertMessage:  "You better check yoself",
			alertType: "info",
		}
	},

	created() {

		var self = this;
		//get logged-in user data
		var url = this.prefix + 'user/auth/data';

		this.$http.get(url)
		.then(function(response) {
			self.initialize(response.data);
		})
	
		.catch(function() {
			self.banner('bad', "Problem fetching auth data");
		});		
	},

	events: {
		//event from Team.vue telling App to clear notifications for that team
		clearNotifications(id) {
			var updated = false;
			var self = this;

			this.teams = this.teams.filter(function(team) {
				if(team.id === id && team.notifications > 0) {
					updated = true;
					team.notifications = 0;
				}
				return team;
			});

			if(updated) {
				//notifications were cleared for this team, send ajax request to save to server
				var url = this.prefix + 'user/auth/team/' + id;
				this.$http.post(url);
			}
		},

		//if user became a member/fan of a team, add that team to their nav dropdown
		addMember(team) {

			var newTeam = {
				id: team.id,
				teamname: team.teamname,
				name: team.name,
				sport: team.sport,
				notifications: 0,
				role: 3,
			}

			this.teams.push(newTeam);
		},

		//the opposite of above
		removeMember(teamname) {
			this.teams = this.teams.filter(function(team) {
				return team.teamname !== teamname;
			})
		},


	},

	computed: {
		
		//the total notifications this user has
		totalCount() {
			var totalCount = 0;
			this.teams.forEach(function(team) {
				totalCount = totalCount + team.notifications;
			});

			if(totalCount === 0)
				return '';

			return totalCount;
		},

		//which teams they are a member of
		memberOf() {
			return this.teams.filter(function(team) {
				return team.role === 0 || team.role === 2;
			});
		},

		//which teams they are a fan of
		fanOf() {
			return this.teams.filter(function(team) {
				return team.role === 3;
			});
		},
	},

	methods: {

		initialize(data) {

			this.user = data.auth;
			this.teams = data.teams;
			
		},


		//show popup message (for more attention)
		//uses sweetalert.js
		popup(type, title, msg) {

			switch(type) {
				case 'good':
					swal(title, msg, "success");
					break;
				case 'bad':
					swal(title, msg, "error");
					break;
				case 'info':
					swal(title, msg, "info");
					break;
					
			}
			
		},

		//show banner message, triggers Alert.vue
		banner(type, msg) {

			this.alert = 0;
			setTimeout(function() {
				this.alertMessage = msg;
				this.alertType = type;
				this.alert += 1;
			}.bind(this), 400)
			
		},

		showModal(id) {
			$('.for-blurring').removeClass('modal-unblur').addClass('modal-blur');
      $('nav.navbar').removeClass('modal-unblur').addClass('modal-blur');
      $('#' + id).modal('show');
		},



	},

	ready() {
		
		/*
		//job offer
		console.log("%cI like your style! email me and I might hire you...  dan@rookiecard.com", "color: black; font-size: large;")
		*/
		$(function() {


			//remove blurring
			//if user had a modal open then clicked 'back' on browser, blur persists
			$('div.modal').modal('hide');
			$('.for-blurring').addClass('modal-unblur').removeClass('modal-blur');
	    $('nav.navbar').addClass('modal-unblur').removeClass('modal-blur');


			//$("nav.navbar-fixed-top").autoHidingNavbar();


			$('div.modal').on('hide.bs.modal', function() {
				$('.for-blurring').addClass('modal-unblur').removeClass('modal-blur');
		    $('nav.navbar').addClass('modal-unblur').removeClass('modal-blur');
			});
		
		});

	}

};


</script>




<style lang="stylus">

@import '/resources/assets/stylus/variables.styl'


.router
	margin-top 50px
	min-height 100%
	position relative

div.navbar-collapse[aria-expanded='true']
div.navbar-collapse.collapsing
	background rc_red
	
nav.navbar
	background rc_red

#hamburger
	background rc_red
	&:focus
		background rc_dark_red
	span
		background white

nav.navbar.navbar-default
	border 0
	height 52px 
				
//holy navbar styling batman
ul.nav.navbar-nav.navbar-right
	li
		a
			color white
			font-size 15px
			&:hover
				text-shadow: 0 0 4px #FFF;	
		background rc_red
	.dropdown
		&.open
			background rc_dark_red
			box-shadow none
			a:hover
				text-shadow none
			a
				background rc_dark_red
				padding-bottom 16px
				color white
				&:hover
					color white		
		.dropdown-menu
			top 51px
			li
				:first-of-type
					padding-top 5px
				:last-of-type
					padding-bottom 5px
				a
					text-decoration none
					color black
					background white
					padding 5px 15px 5px 15px
				:hover
					text-decoration none
					cursor pointer
					color black
				span.badge
					background-color lighten(gray, 60%)	
					color white
					font-size 12px
			:hover
				background lighten(gray, 87%)


			.dropdown-header
				background white
				padding-left 15px
				color gray	
				:hover
					background white
					color gray
					cursor default
			.dropdown-none
				font-size 15px
				background white
				color gray				
		.divider
			margin 5px 0 5px 0
			background #D9D9D9	

.badge-danger
	background-color #D9534F	
	font-size 12px

	
#searchBar
	height 15px
	width 280px
	color white
	margin-top 10px
	background-color rc_dark_red
	font-size 15px

//for changing the color of searchBar input text
input#searchBar::-webkit-input-placeholder
	color white !important
input#searchBar:-moz-placeholder /* Firefox 18- */
	color white !important
input#searchBar::-moz-placeholder  /* Firefox 19+ */
	color white !important
input#searchBar:-ms-input-placeholder  
	color white !important

input[placeholder]::-webkit-input-placeholder
	color darken(#F5F5F5, 20%) !important
input[placeholder]:-moz-placeholder /* Firefox 18- */
	color darken(#F5F5F5, 20%) !important
input[placeholder]::-moz-placeholder  /* Firefox 19+ */
	color darken(#F5F5F5, 20%) !important
input[placeholder]:-ms-input-placeholder  
	color darken(#F5F5F5, 20%) !important	

textarea[placeholder]::-webkit-input-placeholder
	color darken(#F5F5F5, 20%) !important
textarea[placeholder]:-moz-placeholder /* Firefox 18- */
	color darken(#F5F5F5, 20%) !important
textarea[placeholder]::-moz-placeholder  /* Firefox 19+ */
	color darken(#F5F5F5, 20%) !important
textarea[placeholder]:-ms-input-placeholder  
	color darken(#F5F5F5, 20%) !important		

	
#searchIcon
	color white
	position absolute
	left -26px
	top 15px
	font-size 1.3em

//for keeping logo centered
#navLogo
	position absolute
	height 53px
	width 180px
	left 50%
	margin-left -92px
	display block
	background-color transparent

	
				
//nav differences for phone screens	
@media only screen and (max-width xs_max_width) and (min-width 10px)
	.divider
		background #D9D9D9 !important
	#searchIcon
		top 32px
		left -38px
	#searchBar
		margin-top 25px
		border rc_dark_red
	#navSearchDiv
		left 5px !important

//nav differences for tablet screens
@media only screen and (max-width sm_max_width) and (min-width xs_max_width + 1px)
	#searchBar
		width 220px
			
#navSearchDiv 
	position relative
	display inline-block
	left 25px
		
//absolutely position tab icons above TEXT
#profileAboutIcon
	font-size 24px
	position absolute
	left 40px
	bottom 32px
#profileMetricsIcon
	position absolute
	left 43px
	bottom 32px




</style>