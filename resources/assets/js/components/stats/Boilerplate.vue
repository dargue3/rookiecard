<template>
	<div></div>
</template>

<script>

import AbstractStat from './AbstractStat.js'

export default  {

	name: '',

	props: ['type', 'event', 'players', 'rawStats', 'keys', 'sortKey', 'total', 'player', 'compile',
					'keyNames', 'tooltips', 'valLookup', 'keyClassLookup', 'valClassLookup'],

	mixins: [ AbstractStat ],

	data()
	{
		// dontShow : the keys that should not appear in the stats table
		// dontSum : the keys that should not be summed up when creating season totals
		// dontAvg : the keys that should not be averaged when creeating season averages
	
		return {
			teamRecent: {
				dontShow: ['name', 'gs', 'gp', 'min'],
			},
			playerRecent: {
				dontShow: ['name', 'gs', 'gp'],
			},
			teamSeason: {
				dontShow: ['date', 'name', 'opp', 'gs', 'min'],
				dontSum: [],
				dontAvg: [],
			},
			playerSeason: {
				dontShow: ['date', 'win', 'opp'],
				dontSum: [],
				dontAvg: [],
			},
		}
	},

	methods:
	{

		/**
		 * Set the key that will sort the stats table by default
		 */
		defaultSortKey()
		{
			if (this.type === 'teamRecent') this.sortKey = ''
			if (this.type === 'teamSeason') this.sortKey = ''
			if (this.type === 'playerRecent') this.sortKey = ''
			if (this.type === 'playerSeason') this.sortKey = ''
		},


		/**
		 * Before adding this set of stats to the array of recent team stats, 
		 * add anything or manipulate the results
		 *
		 * @param {object} stats 	A stats object with date and win/loss added
		 * @return {object}  			The stats object after being altered
		 */
		editEachTeamRecentStats(stats)
		{
			return stats;
		},



		/**
		 * Before adding this stats object to a team's season totals,
		 * add anything or manipulate the results
		 *
		 * @param {object} stats 					A stats object for one event
		 * @param {object} playerTotals 	The current totals for this team's season
		 * @return {object}  							The totals object after being altered
		 */
		editTeamStatsBeforeAddingThemToSeasonTotals(stats, teamTotals)
		{
			return teamTotals;
		},


		/**
		 * Before saving these stats as the team's season totals, 
		 * add anything or manipulate the results
		 *
		 * @param {object} stats 	A stats object with the team's season totals
		 * @return {object}  			The stats object after being altered
		 */
		editTeamSeasonTotals(stats)
		{
			return stats;
		},


		/**
		 * Before saving these stats as the team's season averages, 
		 * add anything or manipulate the results
		 *
		 * @param {object} stats 	A stats object with the team's averages
		 * @return {object}  			The stats object after being altered
		 */
		editTeamSeasonAverages(stats)
		{
			return stats;
		},



		/**
		 * Before adding this stats object to a player's season totals,
		 * add anything or manipulate the results
		 *
		 * @param {object} stats 					A stats object for one event
		 * @param {object} playerTotals 	The current totals for this player's season
		 * @return {object}  							The totals object after being altered
		 */
		editPlayersStatsBeforeAddingThemToTheirSeasonTotals(stats, playerTotals)
		{
			return playerTotals;
		},


		/**
		 * Before saving these stats as a player's season totals,
		 * add anything or manipulate the results
		 *
		 * @param {object} stats  	The player's season totals to date
		 * @return {object} 				The stats object after being altered
		 */
		editPlayerSeasonTotals(stats)
		{
			return stats;
		},


		/**
		 * Before saving these stats as the player's season averages, 
		 * add anything or manipulate the results
		 *
		 * @param {object} stats 	A stats object with the player's averages
		 * @return {object}  			The stats object after being altered
		 */
		editPlayerSeasonAverages(stats)
		{
			return stats;
		},


		/**
		 * Calculate who won based on the given meta data
		 *
		 * @param {object} meta   The stats' meta data
		 */
		whoWon(meta)
		{
			if (meta.oppScore > meta.teamScore) {
				// they lost
				return 0;
			}
			if (meta.oppScore < meta.teamScore) {
				// they won
				return 1;
			}
			else {
				return 2;
			}
		},


		/**
		 * Return a closure telling Stats.vue how to calculate the displayed value for each key
		 *
		 * @param {string} key
		 */
		lookupValues(key)
		{
			if (key === 'date') {
				return function(val) { return moment.unix(val).format('M/D') };
			}
			if (key === 'name') {
				return function(val, stats) { return stats.abbrName; };
			}
			if (key === 'win') {
				if (this.type.includes('Recent')) {
					return function(val) {
						if (val === 0) return 'L'
						if (val === 1) return 'W'
						if (val === 2) return 'TIE'
						return ''
					}
				}
				else {
					return function(val, stats) {
						if (this.total) {
							return stats.wins
						}
						else {
							return this.percentage(stats.wins, stats.gp);
						}
					}
				}
			}
			if (key === 'opp') {
				return function(val) {
					if (val.includes('***', -3)) return 'vs. ' + val.slice(0, -3);
					if (val.includes('^^^', -3)) return '@ ' + val.slice(0, -3);
					return val;
				}
			}
			
				
			else {
				return function(val) { return this.round(val) };
			}	
		},


		/**
		 * Return a closure telling Stats.vue how to calculate the CSS class for each stat value entry
		 * Note that the closures should return an array of class names
		 *
		 * @param {string} key
		 */
		lookupValClasses(key)
		{
			if (key === 'win') {
				return function(val) { 
					if (val === 0) return ['loss']
					if (val === 1) return ['win']
					if (val === 2) return ['tie']
					return ['']
				}
			}

			else {
				return function(val) { return [''] };
			}
		},


		/**
		 * Return a closure telling Stats.vue how to calculate the CSS class for each stat header
		 * Note that the closures should return an array of class names
		 *
		 * @param {string} key
		 */
		lookupKeyClasses(key)
		{
			if (key === 'opp') {
				return function() { return ['opp'] }
			}
			if (key === 'name') {
				return function() { return ['name'] }
			}

			else {
				return function() { return [''] };
			}
		},

		
		/**
		 * Return a closure telling Stats.vue how to calculate the title of each stat header
		 * Used for building helpful toolips for each key
		 *
		 * @param {string} key
		 */
		lookupTooltips(key) {
			switch (key) {
				case 'date':
					return function() { return 'Date of Game'; }
				case 'opp':
					return function() { return 'Opponent'; }
				case 'win':
					return function() {
						if (this.type.includes('Season')) {
							if (this.total) {
								return 'Wins'
							}
							else {
								return 'Win Percentage'
							}
						}
						else {
							return 'Win or Loss';		
						}
					}
				case 'gs':
					return function() { return 'Games Started'; };
				case 'gp':
					return function() { return 'Games Played'; };
				case 'min':
					return function() { return 'Minutes Played'; };
				default:
					return function() { return '';	 };
			}
		},


		/**
		 * Return a closure that tells Stats.vue what to show as the header for each stat key
		 *
		 * @param {string} key 
		 */
		lookupKeyNames(key)
		{
			// if key is 'win', return 'W/L'
			if (key === 'win') {
				return function() {
					if (this.total) {
						return 'WINS'
					}
					return 'W/L';
				}
			}

			else {
				return function(key) {
					return key.toUpperCase();
				}
			}
		},

	}, // end methods
};


</script>