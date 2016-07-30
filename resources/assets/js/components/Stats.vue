
<template>
	<div>

		<div v-if="type === 'event' && ! stats.length" class="Stats__title --noStats">
			<p>This event's stats aren't posted yet... bug a team admin to post them!</p>
		</div>

  	<div v-if="overflowed.stats" class="Stats__overflow">
			<span class="--left" v-show="overflowed.stats.first">
				<i class="material-icons">chevron_left</i>SCROLL
			</span>
			<span class="--right" v-show="overflowed.stats.last">
				SCROLL<i class="material-icons">chevron_right</i>
			</span>
		</div>	
		<div id="statsTable" class='table-responsive'>
			<table v-show="stats" class="table table-striped stats-table">
				<thead>
		    	<tr class="no-highlight">
		      	<th v-for="key in cols" class="stat-columns text-center"
		      			:class="keyClasses(key)" v-touch:tap="sortBy(key)"
		      				data-toggle="tooltip" :title="tooltips[key].call(this)">
		      		{{ keyNames[key].call(this, key) }}
		      		<br><span class="caret" :class="sortOrders[key] > 0  ? 'asc' : 'desc'"></span>	      	
		      	</th>
		    	</tr>
		  	</thead>
		  	<tbody>
		    	<tr v-for="val in stats | orderBy sortKey sortOrders[sortKey]">
			      <td v-for="key in cols" class="stat-entries" :class="valClasses(val, key)">
			        {{ valLookup[key].call(this, val[key], key, val) }}
			      </td>
		    	</tr>
		  	</tbody>
			</table>
			<div v-else class="text-center">
				<h4>No stats yet...</h4>
			</div>
		</div>


		<!-- just for calculations, doesn't display anything -->
		<basketball v-if="sport === 'basketball'" :type="type" :event="event" :player="player"
  							:players="players" :raw-stats="rawStats" :team="team" :cols.sync="cols" :total="total"
  							:key-names.sync="keyNames" :tooltips.sync="tooltips" :val-lookup.sync="valLookup" 
  							:val-class-lookup.sync="valClassLookup" :key-class-lookup.sync="keyClassLookup">
  	</basketball>	


	</div>
</template>


<script>

import StatsScrollSpy from '../mixins/StatsScrollSpy.js'
import Basketball from './BasketballStats.vue'
import StatFunctions from '../mixins/StatFunctions.js'

export default  {
	
	name: 'Stats',

	mixins: [ StatsScrollSpy, StatFunctions ],

	props: ['sport', 'rawStats', 'players', 'player', 'type', 'team', 'event', 'total'],

	components:
	{
		'basketball' : Basketball,
	},


	data()
	{
		return {
			keyNames: {},
			valLookup: {},
			keyClassLookup: {},
			valClassLookup: {},
			tooltips: {},
			cols: [],
			compiling: true,
			stats: [],
			sortKey: '',
			sortOrders: {},
		}
	},

	watch:
	{
		/**
		 * Stats have been altered, recompile them
		 */
		rawStats()
		{
			this.compileStats();
		},

		type()
		{
			this.compileStats();
		},

		cols()
		{
			this.cols.forEach(function(key) {
				this.$set('sortOrders.' + key, -1);
			}.bind(this));
		}
	},

	events: 
	{
		/**
		 * Stats are done being created by child sport component
		 */
		Stats_compiled(stats)
		{
			this.stats = stats;
			this.compiling = false;
			this.attachScrollListener('#statsTable', 'stats');
			setTimeout(function() {
				this.attachTooltips();
			}.bind(this), 250);
		}
	},

	methods:
	{
		/**
		 * Tell the child component to compile stats
		 */
		compileStats()
		{
			this.compiling = true;
			this.$broadcast('compileStats');	
		},


		/**
		 * Change which key the table is being sorted by
		 */
		sortBy(key)
		{
			if (key === 'name') {
				// if sorting by name, really sort by hidden lastname field
				key = 'lastname'; 
				if (key === this.sortKey) {
					this.sortOrders['name']  = this.sortOrders['name'] * -1;
				}
				else {
					this.sortKey = 'lastname';
				}

				return;
			}

			if (key === this.sortKey) {
				this.sortOrders[key]  = this.sortOrders[key] * -1;
			}
			else {
				this.sortKey = key;
			}
		},

		keyClasses(key)
		{
			var classes = [];
			if (this.sortKey === key) {
				classes.push ('col-sort');
			}

			this.keyClassLookup[key].call(this).forEach(function(className) {
				classes.push(className);
			})

			return classes;
		},

		valClasses(val, key)
		{
			var classes = [];
			this.valClassLookup[key].call(this, val[key]).forEach(function(className) {
				classes.push(className);
			})

			return classes;
		},

		attachTooltips()
		{
			$('#statsTable [data-toggle="tooltip"]').data('bs.tooltip', false).tooltip({
				container: 'body',
				delay: {show: 400, hide: 0},
			});
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
		background-color rc_blue
		border 1px solid #CACACA
		color white
		font-weight 300
		&.name
			padding 8px 30px
		&.opp
			padding 8px 50px
		&:hover
			cursor pointer
		&.col-sort
			background-color rc_red
			border-bottom 2px solid #CACACA


//stripe every other row
.table-striped
	tbody
		tr:nth-child(even)
			td
				background-color darken(#F7F7F7, 3%)
		tr:nth-child(odd)
			td
				background-color white
    
   
//highlight a row when hovered
.stats-table
	tr:hover
		td
			background-color rc_lite_gray !important
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
				top -5px
				left -9px
		i
			position absolute
			font-size 30px	

</style>