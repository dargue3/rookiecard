
<template>
	<div class="Roster">
		
		<div class="Roster__list">


			<!-- coaches column -->
			<div v-if="coaches.length" class="Roster__coaches">
				<h2 class="Roster__header">Coaches</h2>
				<a v-show="isAdmin" class="Roster__add" @click="addUser('coach')">
          <i class="material-icons">person_add</i>
        </a>
				<hr>
				<div v-for="coach in coaches | orderBy 'lastname'">
					<div class="Media">

						<img v-if="! coach.isGhost" :src="coach.pic" class="Media__thumbnail" width="60" height="60"
									v-link="{name: 'user', params: {name: coach.username}}">
		
						<img v-else :src="coach.pic" class="Media__thumbnail --ghost" width="60" height="60">

					
						<div class="Media__text">
							<div class="Media__title">
								<a v-if="! coach.isGhost" v-link="{name: 'user', params: {name: coach.username}}">
									{{ coach.firstname + ' ' + coach.lastname }}
								</a>
								<p v-else>
									{{ coach.firstname + ' ' + coach.lastname }}
								</p>
							</div>
							<div class="Media__details">
								<i v-if="isAdmin" @click="edit(coach)"  id="editIcon" class="material-icons">mode_edit</i>
								<i v-if="coach.isAdmin" id="adminIcon" class="material-icons" data-toggle="tooltip" title="Admin">font_download</i>
							</div>
						</div>
					</div>
				</div>	
			</div>


			<!-- players column -->
			<div v-if="players.length" class="Roster__players">
				<h2 class="Roster__header">Players</h2>
				<a v-show="isAdmin" class="Roster__add" @click="addUser('player')">
          <i class="material-icons">person_add</i>
        </a>
				<hr>
				
				<div v-for="player in players | orderBy 'lastname'">
					<div class="Media">

						<img v-if="! player.isGhost" :src="player.pic" class="Media__thumbnail" width="60" height="60"
									v-link="{name: 'user', params: {name: player.username}}">
						<img v-else :src="player.pic" class="Media__thumbnail --ghost" width="60" height="60">
			
						<div class="Media__text">
							<div class="Media__title">
								<span v-show="player.meta.num" class="Media__number">
										{{ player.meta.num }}<span class="Media__divider">|</span>
								</span>
								<a v-if="! player.isGhost" v-link="{name: 'user', params: {name: player.username}}">
									{{ player.firstname + ' ' + player.lastname }}
								</a>
								<p v-else>
									{{ player.firstname + ' ' + player.lastname }}
								</p>
							</div>

							<div class="Media__details">
								<i v-if="admin" @click="edit(player)" id="editIcon" class="material-icons">mode_edit</i>
								<i v-if="player.admin" id="adminIcon" class="material-icons" data-toggle="tooltip" title="Admin">font_download</i>
								<span class="positions">
									<span v-for="position in player.meta.positions">
										{{ position | uppercase }}  
										<span v-show="$index !== (player.meta.positions.length - 1) && 
																	player.meta.positions[$index+1].length"> | </span>
									</span>
								</span>
							</div>

						</div>
					</div>
				</div>

			</div>
		</div> <!-- end Roster__list -->


		<!-- fans column -->
		<div v-if="fans.length" class="Roster__fans">
			<h2 class="Roster__header">Fans</h2>
			<hr>
			<div v-for="fan in fans | orderBy 'admin' -1" class="Media">

				<img :src="fan.pic" class="Media__thumbnail" width="60" height="60"
							v-link="{name: 'user', params: {name: fan.username}}">
				
				<div class="Media__text">
					<div class="Media__title">
						<a v-link="{name: 'user', params: {name: fan.username}}">
							{{ fan.firstname + ' ' + fan.lastname }}
						</a>
					</div>
					<div class="Media__details">
						<i v-if="admin" @click="edit(fan)" id="editIcon" class="material-icons">mode_edit</i>
						<i v-if="fan.isAdmin" id="adminIcon" class="material-icons" data-toggle="tooltip" title="Admin">font_download</i>
					</div>
				</div>
			</div>
		</div>



	</div>	
</template>


<script>


export default  {
	
	name: 'Roster',

	props: ['players', 'coaches', 'fans', 'admin', 'editUser'],


	data() {
		return {

		};
	},


	methods: {
		
		//they clicked the edit button
		//open modal to edit player
		edit(user) {

			//make a copy of this player (not reactive with state in case not saved)
			this.$set('editUser', JSON.parse(JSON.stringify(user)));
			this.$root.showModal('rosterModal');

		},


		//clicked the 'add user' button
		addUser(role) {
			if(role === 'player') var role = 1;
			if(role === 'coach') var role = 3;

			var user = {
				role: role,
				ghost: true,
				new: true,
				meta: {
					ghost: {
						name: '',
						email: '',
					},
					positions: [],
					num: '',
				}
			}

			this.$set('editUser', user);
			this.$root.showModal('rosterModal');
		}


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
	flex-flow row wrap
	@media screen and (max-width 775px)
		padding 0px 15px

.Roster__header
	margin-bottom -10px
	
.Roster__add
	position absolute
	right 0
	top 5px
	font-size 16px


.Roster__list
	flex 1
	@media screen and (max-width 550px)
		flex-basis 100%
		
.Roster__coaches
	position relative
	
.Roster__players
	margin-top 25px
	position relative

.Roster__fans
	flex 1
	padding-left 3em
	@media screen and (max-width 550px)
		padding 0
		flex-basis 100%


#adminIcon
	color rc_lite_gray
#editIcon
	color link_blue
	&:hover
		color link_blue_hover
		cursor pointer
#saveIcon
	position absolute
	left 35px
	top 9px
	color white
	margin 0
	line-height 0.2
		
.jersey
	display flex
	flex-flow column
	max-width 75px	
	display inline-block	
	div
		flex 1


</style>





