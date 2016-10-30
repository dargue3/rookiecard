
<template>
	<div class="stats-wrapper">
		<div class="table-responsive">
			<table v-if="stats.length" class="table table-striped stats-table">
				<thead>
		    	<tr>
		      	<th v-for="key in statKeys" class="stat-columns"
		      			:class="resolveKeyClasses(key)" v-touch:tap="sortBy(key)"
		      				data-toggle="tooltip" :title="resolveTooltip(key)">
		      		{{ resolveKeyName(key) }}
		      		<span class="caret" :class="resolveCaretClass(key)"></span>	      	
		      	</th>
		    	</tr>
		  	</thead>
		  	<tbody>
		    	<tr v-show="index < currPage || ! showPagination" v-for="(index, val) in stats 
		    						| filterBy filterKey
		    						| orderBy sortKey sortOrders[sortKey]">
			      <td v-for="key in statKeys" class="stat-entries" :class="resolveValClasses(key, val)">
			        {{ resolveStatValue(key, val) }} 
			      </td>
		    	</tr>
		  	</tbody>
			</table>
			<div v-show="showPagination" class="show-more" v-touch:tap="showMore()">
				<span>
					<i class="material-icons --left">keyboard_arrow_down</i>
					Show More
					<i class="material-icons --right">keyboard_arrow_down</i>
				</span>
			</div>
		</div>


		<!-- just for calculations, doesn't display anything -->
		<basketball v-if="sport === 'basketball'" :type="type" :event="event" :player="player"
  							:players="players" :raw-stats="filteredRawStats" :compile="compile" :keys.sync="statKeys" :total="total"
  							:key-names.sync="keyNames" :tooltips.sync="tooltips" :val-lookup.sync="valLookup" :sort-key.sync="sortKey" 
  							:val-class-lookup.sync="valClassLookup" :key-class-lookup.sync="keyClassLookup">
  	</basketball>	


	</div>
</template>


<script>

// helpers
import StatHelpers from '../mixins/StatHelpers.js'

// sports
import Basketball from './stats/Basketball.vue'

export default {
	
	name: 'Stats',

	mixins: [ StatHelpers ],

	props: ['rawStats', 'type', 'sport', 'total', 'statKeys', 'filterKey', 'sortKey',
					'players', 'player', 'event', 'paginate'],

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
			currPage: this.paginate,
			filteredRawStats: [],
			sortOrders: {},
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
			this.compileStats();
		},

		/**
		 * Stats are done being created by child sport component
		 */
		Stats_compiled(stats)
		{
			this.stats = stats;
			this.compile = false;
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
			this.total = false;
			this.filterRawStats();
			this.currPage = this.paginate;
			this.compile = true;
		},


		/**
		 * Only work with raw stats from players that are players
		 * (there could be stats from when a user was a coach, for example)
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
			return this.lastCheck(this.valLookup[key].call(this, stats[key], stats, key));
		},



		/**
		 * Resolve the tooltip to display for this key based on closure given by AbstractStat.js
		 *
		 * @param {string} key
		 */
		resolveTooltip(key)
		{
			return this.tooltips[key].call(this)
		},


		/**
		 * Resolve any classes to add to this stat header based on closure given by AbstractStat.js
		 *
		 * @param {string} key
		 */
		resolveKeyClasses(key)
		{
			var classes = [];
			if (this.sortKey === key) {
				classes.push('col-sort');
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
			if (key === this.sortKey) {
				this.sortOrders[key]  = this.sortOrders[key] * -1;
			}
			else {
				this.sortKey = key;
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

	},

};

</script>


<style lang="stylus">

@import '/resources/assets/stylus/variables.styl'

.stats-wrapper
	display flex
	flex-flow row
	justify-content center
	
.table-responsive
	@media screen and (max-width 767px)
		border 0

table
	th.stat-columns
		background-color rc_blue
		border 1px solid #CACACA
		color white
		text-align center
		font-weight 300
		white-space nowrap
		&:hover
			cursor pointer
		&.col-sort
			background-color rc_red
			border-bottom 2px solid #CACACA


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

.stats-table
	font-size 13px
	font-family 'Monda', sans-serif
	text-align center
	width auto
	.caret
		margin 0 0 3px 0
		transition all .2s
		&.asc
			transform rotate(180deg)
		&.desc
			transform rotate(0deg)
	tr
		user-select none
			
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
	@media screen and (max-width 767px)
		margin-top 15px
	.material-icons
		position absolute
		font-size 19px
		&.--left
			top 10px
			left 74px
		&.--right
			top 10px
			right 77px			

</style>