
<template>
	<div>
		<nav class="navbar navbar-default navbar-fixed-top no-highlight" role="navigation">
	    <div class="container">
	      <div class="navbar-header">
	        <div id='hamburger' class="navbar-toggle" :class="{'toggled' : !toggle}" v-touch:tap="toggle = !toggle">
	          <span id="top-bar" class="icon-bar"></span>
	          <span id="bottom-bar" class="icon-bar"></span>
	        </div>
	        <a v-link="{name: 'home'}"><img id="navLogo" src="/images/logo.png" class="navbar-brand navbar-brand-centered"></a>
	      </div>

	      <div id="sidebar-wrapper">
	        <ul class="sidebar-nav">
	        	<li>
	        		<form @submit.prevent="gotoSearch()">
	        			<input id="searchBar" type="text" class="form-control" placeholder="Search&hellip;" v-model="query">
	        		</form>
	        	</li>
	          <li>
	          	<a v-touch:tap="gotoProfile()">Profile</a>
	          </li>
	          <li class="dropdown teams-dropdown open">
	            <a class="dropdown-toggle" v-touch:tap="teamDropdown = !teamDropdown" :class="{'toggled' : teamDropdown}">
	              <span v-cloak v-show="totalCount > 0" class="badge badge-danger">{{ totalCount }}&nbsp;</span>Teams <span class="caret"></span>
	            </a>
	              
	            <ul v-show="teamDropdown" class="dropdown-menu dropdown-menu-left">
	          		<li v-if="memberOf.length" class="dropdown-header"><small>MEMBER OF</small></li>
	              <li v-for="team in memberOf">
	              	<a v-touch:tap="gotoTeam(team.teamname)" class="nav-link">
	              		<span v-show="team.notifications" class="badge badge-danger">{{ team.notifications }}</span>
	              		{{ team.name }}
	              	</a>
	              </li>
	              <li v-if="memberOf.length" class="divider"></li>

	              <li v-if="fanOf.length" class="dropdown-header"><small>FAN OF</small></li>
	              <li v-for="team in fanOf">
	              	<a v-touch:tap="gotoTeam(team.teamname)" class="nav-link">
	              		<span v-show="team.notifications" class="badge badge-danger">{{ team.notifications }}</span>
	              		{{ team.name }}
	              	</a>
	              </li>
	              <li v-if="fanOf.length" class="divider"></li>

	              <li v-if="invitedTo.length" class="dropdown-header"><small>INVITED TO</small></li>
	              <li v-for="team in invitedTo">
	              	<a v-touch:tap="gotoTeam(team.teamname)" class="nav-link">
	              		<span v-show="team.notifications" class="badge badge-danger">{{ team.notifications }}</span>
	              		{{ team.name }}
	              	</a>
	              </li>
	              <li v-if="invitedTo.length" class="divider"></li>

	              <li><a v-touch:tap="gotoTeam('create')" class="nav-link">Create a Team</a></li>

	            </ul>
	          </li>
	          <li class="dropdown options-dropdown open">
	            <a class="dropdown-toggle" v-touch:tap="optionsDropdown = !optionsDropdown" :class="{'toggled' : optionsDropdown}">
	            	Options <span class="caret"></span>
	            </a>
	            <ul v-show="optionsDropdown" class="dropdown-menu" role="menu">
	              <li><a v-touch:tap="gotoOptions('settings')" class="nav-link">Settings</a></li>
	              <li><a v-touch:tap="gotoOptions('help')" class="nav-link">Help</a></li>
	              <li><a v-touch:tap="gotoOptions('feedback')" class="nav-link">Submit Feedback</a></li>
	              <li class="divider"></li>
	              <li><a class="nav-link" v-touch:tap="logout()">Log out</a></li>
	            </ul>
	          </li>
	        </ul>
	      </div>

	          
	      <div class="collapse navbar-collapse text-center" id="navbar-left">

	        <!-- search bar -->
	        <ul class="nav navbar-nav">
	          <div id="navSearchDiv">
	            <i id="searchIcon" class="glyphicon glyphicon-search"></i>

	            <form @submit.prevent="gotoSearch()">
	        			<input id="searchBar" class="form-control navbar-form search-form search-bar" 
	        						placeholder="Search players and teams&hellip;" v-model="query">
	        		</form>
	          </div>
	        </ul>

	        <!-- nav links -->
	        <ul class="nav navbar-nav navbar-right">
	          <li><a v-link="{name: 'user', params: {name: user.username}}" class="nav-link">Profile</a></li>
	          <li class="dropdown teams-dropdown">
	            <a class="dropdown-toggle" data-toggle="dropdown">
	              <span v-cloak class="badge badge-danger">{{ totalCount }}</span>&nbsp;Teams <span class="caret"></span></a>
	            <ul class="dropdown-menu dropdown-menu-left" role="menu">

	          		<li v-if="memberOf.length" class="dropdown-header"><small>MEMBER OF</small></li>
	              <li v-for="team in memberOf">
	              	<a v-link="{name: 'team', params: {name: team.teamname}}" class="nav-link">
	              		<span v-show="team.notifications" class="badge badge-danger">{{ team.notifications }}</span>
	              		{{ team.name }}
	              	</a>
	              </li>
	              <li v-if="memberOf.length" class="divider"></li>

	              <li v-if="fanOf.length" class="dropdown-header"><small>FAN OF</small></li>
	              <li v-for="team in fanOf">
	              	<a v-link="{name: 'team', params: {name: team.teamname}}" class="nav-link">
	              		<span v-show="team.notifications" class="badge badge-danger">{{ team.notifications }}</span>
	              		{{ team.name }}
	              	</a>
	              </li>
	              <li v-if="fanOf.length" class="divider"></li>

	              <li v-if="invitedTo.length" class="dropdown-header"><small>INVITED TO</small></li>
	              <li v-for="team in invitedTo">
	              	<a v-link="{name: 'team', params: {name: team.teamname}}" class="nav-link">
	              		<span v-show="team.notifications" class="badge badge-danger">{{ team.notifications }}</span>
	              		{{ team.name }}
	              	</a>
	              </li>
	              <li v-if="invitedTo.length" class="divider"></li>

	              <li><a v-link="{name: 'team', params: {name: 'create'}}" class="nav-link">Create a Team</a></li>

	            </ul>
	          </li>
	          <li class="dropdown options-dropdown">
	            <a class="dropdown-toggle" data-toggle="dropdown">Options <span class="caret"></span></a>
	            <ul class="dropdown-menu" role="menu">
	              <li><a class="nav-link">Settings</a></li>
	              <li><a class="nav-link">Help</a></li>
	              <li><a v-link="{ name: 'feedback' }" class="nav-link">Submit Feedback</a></li>
	              <li class="divider"></li>
	              <li><a class="nav-link" v-touch:tap="logout()">Log out</a></li>
	            </ul>
	          </li>
	        </ul>
	      </div>
	    </div>
	  </nav>
	</div>
</template>

<script>

export default  {
	
	name: 'Nav',

	props: ['user', 'invited', 'member', 'fan', 'toggle'],

	data()
	{
		return {
			teamDropdown: false,
			optionsDropdown: false,
			query: '',
		}
	},

	computed:
	{
		invitedTo()
		{
			if (! this.invited) {
				return [];
			}
			else {
				return this.invited;
			}
		},

		memberOf()
		{
			if (! this.member) {
				return [];
			}
			else {
				return this.member;
			}
		},

		fanOf()
		{
			if (! this.fan) {
				return [];
			}
			else {
				return this.fan;
			}
		},
	}, //end computed props

	methods:
	{
		/**
		 * Perform a search for the given query
		 */
		gotoSearch()
		{
			this.resetNav();
			alert(this.query);
		},

		/**
		 * Move router to user's profile
		 */
		gotoProfile()
		{
			this.resetNav();
			this.$router.go({name: 'user', params: {name: this.user.username}});
		},

		/**
		 * Move router to a given team's page
		 */
		gotoTeam(teamname)
		{
			this.resetNav();
			this.$router.go({name: 'team', params: {name: teamname}});
		},


		/**
		 * Move router to a given settings page
		 */
		gotoOptions(option)
		{
			this.resetNav();
			this.$router.go({name: 'feedback'});
		},


		/**
		 * Reset the nav back to hidden and closed up
		 */
		resetNav()
		{
			this.toggle = !this.toggle;
			this.teamDropdown = false;
			this.optionsDropdown = false;
		},

		logout()
		{
			window.location = '/logout';
		},
	}, //end methods
};

</script>

<style lang="stylus">
	
@import '/resources/assets/stylus/variables.styl'


#app-wrapper
	padding-left 0
	transition all 0.3s ease
	&.toggled
		#sidebar-wrapper
			width 200px
		#app-content-wrapper
			position absolute

#sidebar-wrapper
	z-index 1000
	position fixed
	left 200px
	width 0
	height 100%
	margin-left -200px
	margin-top 5px
	overflow-y auto
	background rc_modal_black
	transition all 0.3s ease

#app-content-wrapper
	width 100%
	position absolute
	padding 15px

.sidebar-nav
	position absolute
	top 0
	width 200px
	margin 0
	padding 0
	list-style none
	li
		text-indent 20px
		line-height 40px
		a
			display block
			margin-top 5px
			text-decoration none
			color white
			&.toggled
				text-decoration none
				color #fff
				background rgba(255,255,255,0.2)
	.dropdown-menu
		width 200px
		margin 0
		border-radius 0
		position relative
		border 0
		li
			text-indent 0px
			line-height 10px
			a
				color black
	#searchBar
		background rgba(255,255,255,0.2)
		color white
		border-radius 0
		padding-left 20px
		font-size 15px


#app-wrapper
	&.toggled
		padding-left 0
		#sidebar-wrapper
			width 0
		#app-content-wrapper
			position relative
			margin-right 0
#sidebar-wrapper
	width 200px
#app-content-wrapper
	padding 20px
	position relative

div.navbar-collapse[aria-expanded='true']
div.navbar-collapse.collapsing
	background rc_red
	
nav.navbar
	background rc_red

#hamburger
	background rc_red
	border 0
	float left
	margin 14px 0px 8px 5px
	.icon-bar
		background white
		transition all 0.3s ease
		transform rotate(0deg) translate(0px, 0px)
	&.toggled
		#bottom-bar
			transition all 0.3s ease
			transform rotate(45deg) translate(-2px, -5px)
		#top-bar
			transition all 0.3s ease
			transform rotate(-45deg) translate(1px, 3px)
		
	
nav.navbar.navbar-default
	border 0
	height 53px 
				
// holy navbar styling batman
ul.nav.navbar-nav.navbar-right
	li
		a
			color white
			font-size 15px
		background rc_red
	.dropdown
		&.open
			background rc_dark_red
			box-shadow none
			a
				background rc_dark_red
				padding-bottom 18px
				color white
				&:hover
					color white		
		.dropdown-menu
			top 53px
			left 0
			border-top 0
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
					margin-bottom 2px
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
	margin-bottom 2px

	
.navbar-nav 
	#searchBar
		height 15px
		width 280px
		color white
		margin-top 10px
		background-color rc_dark_red
		font-size 15px
		@media(max-width 991px)
			width 225px

// for changing the color of searchBar input text
input#searchBar::-webkit-input-placeholder
	color white !important
input#searchBar:-moz-placeholder /* Firefox 18- */
	color white !important
input#searchBar::-moz-placeholder  /* Firefox 19+ */
	color white !important
input#searchBar:-ms-input-placeholder  
	color white !important

input#searchBar:focus
	border none 
	outline none  
	box-shadow none 

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

// for keeping logo centered
#navLogo
	position absolute
	height 53px
	width 180px
	left 50%
	margin-left -92px
	display block
	background-color transparent
			
#navSearchDiv 
	position relative
	display inline-block
	left 25px

</style>