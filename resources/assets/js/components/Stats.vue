
<template>
	
	<div>

		<div v-if="type === 'event' && !stats.length" class="Stats__title --noStats">
			<p>This event's stats aren't posted yet... bug a team admin to post them!</p>
		</div>
		
		<basketball v-if="sport === 0 && stats.length" :type="type" :event="event"
  							:players="players" :raw-stats="stats" :pagination="pagination"
  							:team-cols="teamCols" :player-cols="playerCols"></basketball>	



	</div>
	
</template>


<script>

import BasketballStats from './BasketballStats.vue'

export default  {
	
	name: 'Stats',

	props: ['stats', 'players', 'type', 'team', 'sport', 'event', 'pagination',
						'teamCols', 'playerCols'],

	components: {
		'basketball' : BasketballStats,
	},


	data() {

		return {
			
		}
	},

	watch: {
		//stats have changed, compile
		stats() {
			this.$broadcast('compileStats');	
		},
	},

};

</script>


<style lang="stylus">

@import '/resources/assets/stylus/variables.styl'
	
#statsWrapper
	padding-bottom 10px

.stats-container
	position relative
	min-height 100px
	padding 0.5em 2em 2em 0
	@media screen and (max-width 767px)
		border 0
	.Tab__container
		margin-bottom 45px
		font-size 16px

table
	th.stat-columns
		background-color #7AB0EB
		border 1px solid #CACACA
		color #fff
		font-weight 300
		&.name
			padding 8px 30px
		&.opp
			padding 8px 50px	
		&:hover
			cursor pointer
		&.col-sort
			background-color #4B74A0
			border-bottom 2px solid #CACACA


//stripe every other row
.table-striped
	tbody
		tr:nth-child(even)
			td
				background-color #F7F7F7
		tr:nth-child(odd)
			td
				background-color white
    
   
//highlight a row when hovered
.stats-table
	tr:hover
		td
			background-color #D6D6D6 !important
			border 1px solid #F7F7F7 !important

td.stat-entries
	border 1px solid #CACACA
	vertical-align middle

.stats-table
	font-size 13px
	font-family 'Monda', sans-serif
	text-align center
	.caret
		margin 0
		transition all .2s
		&.asc
			transform rotate(180deg)
		&.desc
			transform rotate(0deg)
			
.stat-entries.win
	color rc_win 
.stat-entries.loss
	color rc_loss 
	font-weight bold
.stat-entries.versus
	color rc_dark_gray
	font-weight bold




div.pagination
	margin 0 auto
	width 100%

ul.pagination
	font-size 13px
	margin-top 5px
	li
		a, a:visited
			color black
		a:hover
			color black
			background-color #D6D6D6
			border-color #CACACA			
	.active
		a, a:visited, a:hover
			color white
			background-color #7AB0EB
			border-color #CACACA
			
.Stats__title.--noStats
	display flex
	flex-flow row
	justify-content center
	text-align center
	font-size 25px
	margin-bottom 2em
	*
		flex 1			
		
.Stats__overflow
	margin-top 1em
	margin-bottom 0.5em
	min-height 20px	
	span
		position relative
		color rc_lite_gray
		&.--right
			padding-right 1.5em
			float right
			i
				top -5px
				right -9px
		&.--left
			float left
			padding-left 1.5em
			i
				top -7px
				left -9px
		i
			position absolute
			font-size 30px	

</style>