
<template>
	<div class="Roster">
		
		<div class="Roster__list">


			<!-- coaches column -->
			<div v-if="coaches.length" class="Roster__coaches">
				<h2 class="Roster__header">Coaches</h2>
				<hr>
				<div v-for="coach in coaches | orderBy 'lastname'">
					<div class="Media">

						<img :src="coach.pic" class="Media__thumbnail" width="60" height="60"
									v-link="{name: 'user', params: {name: coach.username}}">
					
						<div class="Media__text">
							<div class="Media__title">
								<a v-link="{name: 'user', params: {name: coach.username}}">
									{{ coach.firstname + ' ' + coach.lastname }}
								</a>
							</div>
							<div class="Media__details">
								<i v-if="admin" @click="edit(coach)"  id="editIcon" class="material-icons">mode_edit</i>
								<i v-if="coach.admin" id="adminIcon" class="material-icons" data-toggle="tooltip" title="Admin">font_download</i>
							</div>
						</div>
					</div>
				</div>	
			</div>


			<!-- players column -->
			<div v-if="players.length" class="Roster__players">
				<h2 class="Roster__header">Players</h2>
				<hr>
				
				<div v-for="player in players | orderBy 'lastname'">
					<div class="Media">
						<img :src="player.pic" class="Media__thumbnail" width="60" height="60"
									v-link="{name: 'user', params: {name: player.username}}">
			
						<div class="Media__text">
							<div class="Media__title">
								<span class="Media__number">{{ player.meta.num }}<span class="Media__divider">|</span></span>
								<a v-link="{name: 'user', params: {name: player.username}}">
									{{ player.firstname + ' ' + player.lastname }}
								</a>
							</div>

							<div class="Media__details">
								<i v-if="admin" @click="edit(player)" id="editIcon" class="material-icons">mode_edit</i>
								<i v-if="player.admin" id="adminIcon" class="material-icons" data-toggle="tooltip" title="Admin">font_download</i>
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
			<div v-for="fan in fans | orderBy 'lastname'" class="Media">

				<img :src="fan.pic" class="Media__thumbnail" width="60" height="60"
							v-link="{name: 'user', params: {name: fan.username}}">
				
				<div class="Media__text">
					<div class="Media__title">
						<a v-link="{name: 'user', params: {name: fan.username}}">
							{{ fan.firstname + ' ' + fan.lastname }}
						</a>
					</div>
					<div class="Media__details">
						
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

.Roster__header
	margin-bottom -10px


.Roster__list
	flex 1
	@media screen and (max-width 550px)
		flex-basis 100%

.Roster__players
	margin-top 25px

.Roster__fans
	flex 1
	padding-left 3em
	@media screen and (max-width 550px)
		padding 0
		flex-basis 100%


#adminIcon
	color darken(whitesmoke, 30%)
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





