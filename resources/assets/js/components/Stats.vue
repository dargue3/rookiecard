
<template>
	<div class="stats-with-slot-container">
		<div v-if="overflowed" class="stats-overflow">
			<span class="-left" v-show="overflowed.first">
				<i class="material-icons">chevron_left</i>SCROLL
			</span>
			<span class="-right" v-show="overflowed.last">
				SCROLL<i class="material-icons">chevron_right</i>
			</span>
		</div>
		<div class="stats-container" :class="! centered ? '-left' : '-center'">
			<div class="table-responsive" :class="randomKey">	
				<slot></slot>
				<table v-if="stats.length" class="table table-striped stats-table">
					<thead>
			    	<tr>
			      	<th v-for="key in statKeys" class="stat-columns"
			      			:class="resolveKeyClasses(key)" v-touch:tap="sortBy(key)"
			      				data-toggle="tooltip" :title="resolveTooltip(key)">
			      		{{ resolveKeyName(key) }}
			      		<span v-if="! disableSorting" class="caret" :class="resolveCaretClass(key)"></span>	      	
			      	</th>
			    	</tr>
			  	</thead>
			  	<tbody>
			    	<tr v-show="index < currPage || ! showPagination" v-for="(index, val) in stats 
			    						| filterBy search
			    						| orderBy sortKey sortOrders[sortKey]">
				      <td v-for="key in statKeys" class="stat-entries" :class="resolveValClasses(key, val)">
				        {{ resolveStatValue(key, val) }} 
				      </td>
			    	</tr>
			    	<template v-if="tableBottomLabel && ! search">
			    		<tr>
			    			<td v-for="key in statKeys" class="stat-entries stat-total">
			    				{{ resolveStatValue(key, statsOnBottom) }}
			    			</td>
			    		</tr>
			    	</template>
			  	</tbody>
				</table>
				<div v-show="showPagination" class="show-more" v-touch:tap="showMore()">
					<span>
						<i class="material-icons -left">keyboard_arrow_down</i>
						Show More
						<i class="material-icons -right">keyboard_arrow_down</i>
					</span>
				</div>
			</div>


			<!-- just for calculations, doesn't display anything -->
			<basketball v-if="sport === 'basketball'" :type="type" :event="event" :player="player" :record.sync="teamRecord"
	  							:players="players" :raw-stats="filteredRawStats" :compile="compile" :keys.sync="statKeys" :total="total"
	  							:key-names.sync="keyNames" :tooltips.sync="tooltips" :val-lookup.sync="valLookup" :sort-key.sync="sortKey" 
	  							:val-class-lookup.sync="valClassLookup" :key-class-lookup.sync="keyClassLookup" 
	  							:stats-on-bottom.sync="statsOnBottom">
	  	</basketball>	
		</div>

	</div>
</template>


<script>

// helpers
import StatHelpers from '../mixins/StatHelpers.js'
import StatsScrollSpy from '../mixins/StatsScrollSpy.js'

// sports
import Basketball from './stats/Basketball.vue'

export default {
	
	name: 'Stats',

	mixins: [ StatHelpers, StatsScrollSpy ],

	props: ['rawStats', 'type', 'sport', 'total', 'statKeys', 'teamRecord', 'search', 'centered',
					'sortKey', 'players', 'player', 'event', 'paginate', 'tableBottomLabel', 'hideScroll', 'disableSorting'],

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
			compile: false,
			stats: [],
			statsOnBottom: {},
			currPage: this.paginate,
			filteredRawStats: [],
			sortOrders: {},
			randomKey: Math.random().toString(36).substring(7),
		}
	},

	ready()
	{
		this.compileStats();
	},

	watch:
	{
		/**
		 * Stats have been altered, recompile them
		 */
		rawStats()
		{
			this.$set('stats', []);
			this.compileStats();
		},

		/**
		 * Make sure each key has a corresponding sort entry
		 */
		statKeys()
		{
			this.statKeys.forEach(function(key) {
				this.$set('sortOrders.' + key, -1);
			}.bind(this));

			this.sortOrders.name = 1;
		},
	},

	computed:
	{
		/**
		 * Whether or not to show the "Show More" paginator link
		 */
		showPagination()
		{
			if (typeof this.paginate === 'number') {
				if (! this.compile && this.stats.length > this.paginate) {
					if (this.currPage >= this.stats.length) {
						return false;
					}
					else {
						return true;
					}
				}
			}

			return false;
		},
	},

	events: 
	{
		/**
		 * Message from parent component to recompile the data
		 */
		Stats_recompile()
		{
			this.$set('stats', []);
			this.compileStats();
		},

		/**
		 * Stats are done being created by child sport component
		 */
		Stats_compiled(stats)
		{
			this.compile = false;
			this.stats = stats;

			if (this.tableBottomLabel) {
				this.statsOnBottom.abbrName = this.tableBottomLabel;
			}

			setTimeout(function() {
				this.attachTooltips();
				this.attachScrollSpy();
			}.bind(this), 250);

			this.$dispatch('StatsParent_compiled');
		}
	},

	methods:
	{
		/**
		 * Tell the child component to compile stats
		 */
		compileStats()
		{
			this.total = false;
			this.filterRawStats();
			this.currPage = this.paginate;
			this.compile = true;
		},


		/**
		 * Only compile raw stats from members that are players
		 * e.g. There are leftover stats from when a player was given stats then changed to a coach
		 */
		filterRawStats()
		{
			let tempStats = [];
			for (var index in this.rawStats) {
				let stats = this.rawStats[index];
				for (var player in this.players) {
					if (stats.member_id === this.players[player].member_id) {
						tempStats.push(stats);
					}
				}
			}

			this.$set('filteredRawStats', tempStats);
		},


		/**
		 * Increment the amount of stats shown by 1 page (default: 10 per page)
		 */
		showMore()
		{
			this.currPage += this.paginate;
		},


		/**
		 * Resolve what to call this key based on closure given by AbstractStat.js
		 *
		 * @param {string} key
		 */
		resolveKeyName(key)
		{
			if (typeof this.valClassLookup[key] !== 'function') {
				return null;
			}
			return this.keyNames[key].call(this, key);
		},


		/**
		 * Calculate the displayed value based on closure given by AbstractStat.js
		 *
		 * @param {string} key
		 * @param {object} stats
		 */
		resolveStatValue(key, stats)
		{
			if (typeof this.valClassLookup[key] !== 'function') {
				return this.lastCheck(null);
			}
			return this.lastCheck(this.valLookup[key].call(this, stats[key], stats, key));
		},


		/**
		 * Calculate the displayed value of the summation at the bottom of the table 
		 * Based on closure given by AbstractStat.js
		 *
		 * @param {string} key
		 * @param {object} stats
		 */
		resolveStatSum(key, stats)
		{
			if (typeof this.valClassLookup[key] !== 'function') {
				return this.lastCheck(null);
			}
			return this.lastCheck(this.sumLookup[key]);
		},


		/**
		 * Resolve the tooltip to display for this key based on closure given by AbstractStat.js
		 *
		 * @param {string} key
		 */
		resolveTooltip(key)
		{
			if (typeof this.valClassLookup[key] !== 'function') {
				return ''
			}
			return this.tooltips[key].call(this)
		},


		/**
		 * Resolve any classes to add to this stat header based on closure given by AbstractStat.js
		 *
		 * @param {string} key
		 */
		resolveKeyClasses(key)
		{
			if (typeof this.valClassLookup[key] !== 'function') {
				return [];
			}

			var classes = [];
			if (this.sortKey === key  && ! this.disableSorting) {
				classes.push('col-sort');
			}
			else if (this.disableSorting) {
				classes.push('no-sort')
			}

			this.keyClassLookup[key].call(this).forEach(function(className) {
				classes.push(className);
			})

			return classes;
		},


		/**
		 * Resolve any classes to add to this stat value based on closure given by AbstractStat.js
		 *
		 * @param {string} key
		 */
		resolveValClasses(key, val)
		{
			if (typeof this.valClassLookup[key] !== 'function') {
				return [];
			}
			
			var classes = [];
			this.valClassLookup[key].call(this, val[key]).forEach(function(className) {
				classes.push(className);
			})

			return classes;
		},


		/**
		 * Figure out if the caret is facing upwards or downwards
		 *
		 * @param {string} key 
		 */
		resolveCaretClass(key)
		{
			if (key === 'name') {
				// strings appear the opposite as numbers, for consistency, reverse it
				return this.sortOrders[key] > 0  ? 'desc' : 'asc'
			}

			return this.sortOrders[key] > 0  ? 'asc' : 'desc'
		},


		/**
		 * Change which key the table is being sorted by
		 *
		 * @param {string} key 
		 */
		sortBy(key)
		{
			if (! this.disableSorting) {
				if (key === this.sortKey) {
					this.sortOrders[key]  = this.sortOrders[key] * -1;
				}
				else {
					this.sortKey = key;
				}
			}
		},


		/**
		 * Attach the bootstrap tooltips when table is ready
		 */
		attachTooltips()
		{
			$('.stats-table [data-toggle="tooltip"]').data('bs.tooltip', false).tooltip({
				container: 'body',
				delay: {show: 400, hide: 0},
			});
		},


		/**
		 * Attach the scroll listeners that tell the user when stats are hidden off-screen
		 * Uses this.randomKey to assign a unique class so that other stat tables don't interfere
		 */
		attachScrollSpy()
		{
			if (! this.hideScroll) {
				this.attachScrollListener(`.table-responsive.${this.randomKey}`);
			}
		},
	},

};

</script>


<style lang="stylus">

@import '/resources/assets/stylus/variables.styl'

.stats-with-slot-container
	display flex
	flex-flow column
	width 100%

.stats-container
	display flex
	&.-center
		justify-content center
	&.-left
		align-items flex-start
		
.table-responsive
	align-self center
	+mobile()
		border 0

table
	th.stat-columns
		background-color rc_blue
		border 1px solid #CACACA
		color white
		text-align center
		font-weight normal
		white-space nowrap
		padding 5px 8px !important
		&:hover
			cursor pointer
		&.col-sort
			background-color rc_red
			border-bottom 2px solid #CACACA
		&.no-sort
			background-color rc_blue
			&:hover
				cursor default
		&:not(.no-sort)
			padding-right 12px !important


.table-striped
	tbody
		tr:nth-child(even)
			td
				background-color darken(#F7F7F7, 3%)
		tr:nth-child(odd)
			td
				background-color white
    

td.stat-entries
	border 1px solid #CACACA
	vertical-align middle !important
	white-space nowrap
	&.stat-separator
		background-color rgba(50, 154, 207, 0.21) !important
		height 10px
		border 0
	&.stat-total
		font-weight 700
		border-top 3px solid rc_lite_gray
		
.stats-table
	font-size 13px
	font-family 'Monda', sans-serif
	text-align center
	width auto
	tr
		user-select none
	.stat-columns
		.caret
			margin 0 0 3px 0
			position relative
			border none
			padding-bottom 4px
			&:before
				content ''
				position absolute
				top 0
				left 0
				border-left 4px solid transparent
				border-right 4px solid transparent
			&.desc:before
				border-top 4px solid white
				border-bottom 0
			&.asc:before
				border-top 0
				border-bottom 4px solid white
				
			&:after
				content ''
				position absolute
				left 2px
				border-left 2px solid transparent
				border-right 2px solid transparent
			&.desc:after
				top 0
				border-bottom none
				border-top 2px solid rc_blue
				^[1].col-sort .caret.desc:after  // if col-sort on this column, use red background
					border-top 2px solid rc_red
			&.asc:after
				top 2px
				border-top none
				border-bottom 2px solid rc_blue
				^[1].col-sort .caret.asc:after  // if col-sort on this column, use red background
					border-bottom 2px solid rc_red
		

.stats-overflow
	margin-top 1em
	margin-bottom 0.5em
	min-height 20px	
	span
		position relative
		color rc_lite_gray
		&.-right
			padding-right 1.5em
			float right
			.material-icons
				top -6px
				right -9px
		&.-left
			float left
			padding-left 1.5em
			.material-icons
				top -6px
				left -9px
		.material-icons
			position absolute
			font-size 30px	


			
.stat-entries.win
	color rc_win 
.stat-entries.loss
	color rc_loss 
	font-weight bold
.stat-entries.tie
	color rc_dark_gray
	font-weight bold


.show-more
	position relative
	display inline-block
	padding 10px 100px
	border-radius 4px
	background white
	color link_blue
	&:hover
		color link_blue_hover
		cursor pointer
	+mobile()
		margin-top 15px
	.material-icons
		position absolute
		font-size 19px
		&.-left
			top 10px
			left 74px
		&.-right
			top 10px
			right 77px			

</style>