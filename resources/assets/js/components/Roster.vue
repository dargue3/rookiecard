
<template>
	<div class="Roster">

		<div class="TabButton">
			<div class="first" :class="{'active' : tab === 'players'}" v-touch:tap="tab = 'players'">
				<span>Players</span>
			</div>
			<div class="second" :class="{'active' : tab === 'coaches'}" v-touch:tap="tab = 'coaches'">
				<span>Coaches</span>
			</div>
			<div class="third" :class="{'active' : tab === 'fans'}" v-touch:tap="tab = 'fans'">
				<span>Fans</span>
			</div>
		</div>

		<div class="Roster__search">
			<input type="text" class="form-control --white" placeholder="Search by name..." v-model="search">
		</div>


		
		<div v-show="tab === 'players'" class="Roster__list">
			<div class="Roster__users">
				<div v-for="player in players
										| filterBy search in 'name'
										| orderBy 'lastname'" class="User">
					<div v-show="! player.hasRequestedToJoin" class="User__icons">
						<div v-show="player.isAdmin">
							<i class="material-icons" data-toggle="tooltip" title="Admin">font_download</i>
						</div>
						<div v-show="isAdmin" v-touch:tap="edit(player)">
							<a><i class="material-icons" data-toggle="tooltip" title="Edit">mode_edit</i></a>
						</div>
					</div>
					<div v-show="isAdmin && player.hasRequestedToJoin" class="User__accept">
						<div v-touch:tap="accept(player)">
							<a><i class="material-icons accept-icon" data-toggle="tooltip" title="Add to Team">done</i></a>
						</div>
						<div v-touch:tap="deny(player)">
							<a><i class="material-icons deny-icon" data-toggle="tooltip" title="Deny">close</i></a>
						</div>
					</div>
					<div class="User__pic" :class="{'--ghost-pic' : player.isGhost}">
						<img v-if="! player.isGhost" :src="player.pic" :alt="player.name" height="200" width="200">
						<div v-else>
							<span>{{ player.firstname[0] }}</span>
						</div>
					</div>
					<div class="User__details">
						<div class="details-text">
							<div class="User__name">
								<span v-if="player.isGhost">{{ player.name }}</span>
								<a v-else v-link="{name: 'user', params: {name: player.username}}">{{ player.name }}</a>
							</div>
							<div v-show="player.meta.positions" class="User__positions">
								<span v-for="position in player.meta.positions">
									{{ position | uppercase }}
								</span>&nbsp;
							</div>
							<div v-show="player.hasRequestedToJoin" class="User__positions">
								<span>Would like to join</span>
							</div>
						</div>
						<div class="details-num">
							<div>
								<span>{{ player.meta.num }}</span>
							</div>
						</div>
					</div>
				</div>

				<!-- add player placeholder -->
				<div class="User" v-if="isAdmin">
					<div class="User__pic --add-player" v-touch:tap="addUser('player')">
						<div>
							<i class="material-icons">add</i>
						</div>
					</div>
					<div class="User__details">
						<div class="details-text">
							<div class="User__name">
								<span>Add a Player</span>
							</div>
						</div>
					</div>
				</div>
				<div v-if="! isAdmin && ! players.length">
					<h3>No players yet...</h3>
				</div>
			</div>
		</div>


		<div v-show="tab === 'coaches'" class="Roster__list">
			<div class="Roster__users">
				<div v-for="coach in coaches 
										| filterBy search in 'name'
										| orderBy 'lastname'" class="User">
					<div class="User__icons">
						<div v-show="coach.isAdmin">
							<i class="material-icons" data-toggle="tooltip" title="Admin">font_download</i>
						</div>
						<div v-show="isAdmin" v-touch:tap="edit(coach)">
							<a><i class="material-icons" data-toggle="tooltip" title="Edit">mode_edit</i></a>
						</div>
					</div>
					<div class="User__pic" :class="{'--ghost-pic' : coach.isGhost}">
						<img v-if="! coach.isGhost" :src="coach.pic" :alt="coach.name" height="200" width="200">
						<div v-else>
							<span>{{ coach.firstname[0] }}</span>
						</div>
					</div>
					<div class="User__details">
						<div class="details-text">
							<div class="User__name">
								<span v-if="coach.isGhost">{{ coach.name }}</span>
								<a v-else v-link="{name: 'user', params: {name: coach.username}}">{{ coach.name }}</a>
							</div>
						</div>
					</div>
				</div>

				<!-- add coach placeholder -->
				<div class="User" v-if="isAdmin">
					<div class="User__pic --add-player" v-touch:tap="addUser('coach')">
						<div>
							<i class="material-icons">add</i>
						</div>
					</div>
					<div class="User__details">
						<div class="details-text">
							<div class="User__name">
								<span>Add a Coach</span>
							</div>
						</div>
					</div>
				</div>
				<div v-if="! isAdmin && ! coaches.length">
					<h3>No coaches yet...</h3>
				</div>
			</div>
		</div>


		<div v-show="tab === 'fans'" class="Roster__list">
			<div class="Roster__users">
				<div v-for="fan in fans 
										| filterBy search in 'name'
										| orderBy 'lastname'" class="User">
					<div class="User__icons">
						<div v-show="fan.isAdmin">
							<i class="material-icons" data-toggle="tooltip" title="Admin">font_download</i>
						</div>
						<div v-show="isAdmin" v-touch:tap="edit(fan)">
							<a><i class="material-icons" data-toggle="tooltip" title="Edit">mode_edit</i></a>
						</div>
					</div>
					<div class="User__pic">
						<img :src="fan.pic" :alt="fan.name" height="200" width="200">
					</div>
					<div class="User__details">
						<div class="details-text">
							<div class="User__name">
								<a v-else v-link="{name: 'user', params: {name: fan.username}}">{{ fan.name }}</a>
							</div>
							<div class="User__positions">
								<span>Since {{ fan.since }}</span>
							</div>
						</div>
					</div>
				</div>
				<div v-if="! fans.length">
					<h3>No fans yet...</h3>
				</div>
			</div>
		</div>



	</div>	
</template>


<script>


export default  {
	
	name: 'Roster',

	props: ['users', 'isAdmin', 'editUser'],


	data() {
		return {
			tab: 'players',
			search: '',
		};
	},

	computed:
	{
		players()
		{
			if (! this.isAdmin) {
				return this.users.filter((user) => {
					return user.isPlayer;
				});
			}

			return this.users.filter((user) => {
				return user.isPlayer || user.hasRequestedToJoin;
			});
		},

		coaches()
		{
			return this.users.filter((user) => {
				return user.isCoach
			});
		},


		fans()
		{
			return this.users.filter((user) => {
				return user.isFan
			});
		},
	},


	methods:
	{
		
		/**
		 * Open a modal to edit the given user
		 * 
		 * @param  {object} user 
		 */
		edit(user)
		{
			//make a copy of this player for reactivity
			user = JSON.parse(JSON.stringify(user));

			if (user.isPlayer) user.role = 'player'; 
			if (user.isCoach) user.role = 'coach'; 

			this.$set('editUser', user);
			this.$root.showModal('rosterModal');
		},


		/**
		 * Admin wants to add a new ghost player or coach
		 *
		 * @param {string} role   Either 'player' or 'coach'
		 */
		addUser(role)
		{
			if (role === 'player') {
				var isPlayer = true;
				var isCoach = false;
			}
			if (role === 'coach') {
				var isPlayer = false;
				var isCoach = true;
			}

			var user = {
				isGhost: true,
				isPlayer: isPlayer,
				isCoach: isCoach,
				role: role,
				new: true,
				meta: {
					firstname: '',
					lastname: '',
					email: '',
					positions: [],
					num: '',
				}
			}

			this.$set('editUser', user);
			this.$root.showModal('rosterModal');
		},

		/**
		 * Admin has clicked to accept this user to the team
		 *
		 * @param {object} user
		 */
		accept(user)
		{
			user = JSON.parse(JSON.stringify(user));

			user.acceptedByAdmin = true;
			user.isPlayer = true;

			this.edit(user);
		},


		/**
		 * Admin has clicked to deny this user from joining the team
		 * 
		 * @param {object} user
		 */
		deny(user)
		{
			user = JSON.parse(JSON.stringify(user));

			user.deniedByAdmin = true;

			this.edit(user);
		},


	},


	ready() {

		$(function() {
			//attach tooltips
			$('[data-toggle="tooltip"').tooltip({
				container: 'body',
				delay: {show: 400, hide: 0},
			});

		});
	},

};

</script>


<style lang="stylus">

@import '/resources/assets/stylus/variables.styl'

.Roster
	margin 0 auto
	max-width 775px
	display flex
	flex-flow column
	@media (max-width 775px)
		padding 0px 15px
	.TabButton
		justify-content center

.Roster__header
	margin-bottom -10px
	@media (max-width 767px)
		text-align center

.Roster__list
	flex 1
	
.Roster__users
	display flex
	flex-flow row wrap
	justify-content center
		
.User
	position relative
	display flex
	flex-flow column wrap
	width 200px
	margin 20px 20px
	@media (max-width 767px)
		margin 10px 20px
	&:hover
		.User__icons
			opacity 1
			transition opacity 0.3s ease
	
.User__accept
.User__icons
	display flex
	position absolute
	top 0
	left 0
	padding-right 5px
	flex-flow row
	align-items center
	background rgba(255,255,255,0.7)
	border-top-left-radius 4px
	border-bottom-right-radius 4px
	opacity 0
	transition opacity 0.3s ease
	@media (max-width 767px)
		opacity 1
	div
		display flex
		align-items center
		color black
		margin 5px 0px 2px 5px
		
.User__accept
	opacity 1
	background rgba(255,255,255,1)
	.accept-icon
		color rc_bright_green
		&:hover
			color rc_bright_green_hover
			cursor pointer
	.deny-icon
		color rc_red
		&:hover
			color rc_red_hover
			cursor pointer
	.material-icons	
		font-size 40px
	
		
	
.User__pic
	flex-basis 200px
	height 200px
	img
		border-top-right-radius 4px
		border-top-left-radius 4px
		border 1px solid darken(rc_super_lite_gray, 5%)
		border-bottom 0
	&.--ghost-pic
		display flex
		justify-content center
		align-items center
		border-top-right-radius 4px
		border-top-left-radius 4px
		font-size 75px
		background #D7ECF6
		color rc_med_gray
		border 1px solid darken(rc_super_lite_gray, 5%)
		border-bottom 0
	&.--add-player
		display flex
		justify-content center
		align-items center
		background rc_lite_gray
		border-top-right-radius 4px
		border-top-left-radius 4px
		color link_blue
		border 1px solid darken(rc_super_lite_gray, 5%)
		border-bottom 0
		.material-icons
			font-size 100px
		&:hover
			color link_blue_hover
	
	
.User__details
	flex 1
	display flex
	flex-flow row
	align-items center
	padding 10px
	background rc_super_lite_gray
	border-bottom-right-radius 4px
	border-bottom-left-radius 4px
	border 1px solid darken(rc_super_lite_gray, 5%)
	border-top 0
	.details-text
		font-size 18px
		width 175px
	.details-num
		font-size 25px
		align-self center
		color rc_red
		width 25px
		
.User__positions
	font-size 14px
	margin-top 5px
	color rc_dark_gray
	
.Roster__search
	display flex
	flex-flow row nowrap
	justify-content center
	margin-bottom 20px
	input
		width 175px
		height 40px
	
.Roster__coaches
	@media (max-width 767px)
		text-align center
	ul
		padding-left 0
		list-style none
		font-size 18px
		.edit-icon
			visibility hidden
			@media (max-width 767px)
				visibility visible
			&:hover
				cursor pointer
		li:hover
			.edit-icon
				visibility visible
	.add-coach
		font-size 18px
		


</style>





