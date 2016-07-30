<template>
	<div></div>
</template>

<script>

import AbstractStat from '../mixins/AbstractStat.js'

export default  {

	name: 'BasketballStats',

	props: ['type', 'event', 'team', 'players', 'rawStats', 'cols', 'total', 'player',
					'keyNames', 'tooltips', 'valLookup', 'keyClassLookup', 'valClassLookup'],

	mixins: [ AbstractStat ],

	data()
	{
		return {
			ignoredCols: { // which stat keys should not be shown for each type?
				teamRecent: ['gp'],
				teamSeason: ['date', 'opp'],
				playerRecent: ['name', 'gs', 'gp', 'efg_', 'astto', 'ts_', 'per', 'eff'],
				playerSeason: ['date', 'win', 'opp'],
			},
			totalStats: [],
			avgStats: [],
		}
	},

	watch:
	{
		/**
		 * Whether to view the totals for a season or an average
		 */
		total(val)
		{
			if (val) {
				this.done(this.totalStats);
			}
			else {
				this.done(this.avgStats);
			}
		},
	},

	methods:
	{
		/**
		 * Build stats array into the team's recent stats
		 */
		teamRecent()
		{
			var recentStats = [];
			for (var x = 0; x < this.teamStats.length; x++) {
				recentStats.push(this.defaultTeamRecent(this.teamStats[x]));
			}
			
			this.done(recentStats);
		},
		

		/**
		 * Calculate the team's season stats to date
		 * This step amasses the stats into one object of key totals
		 */
		teamSeason()
		{
			// the keys to not include in the totaling
			var ignored = [];

			// the keys that should not be averaged
			var noAvg = ['wins', 'losses', 'gp'];

			this.done(this.defaultTeamSeason(ignored, noAvg));
		},


		/**
		 * Calculate who won based on the given data
		 *
		 * @param {object} stats  The stats
		 * @param {object} meta   The stats' meta data
		 */
		whoWon(stats, meta)
		{
			if (meta.oppScore > stats.pts) {
				// they lost
				return 0;
			}
			if (meta.oppScore < stats.pts) {
				// they won
				return 1;
			}
			else {
				return null;
			}
		},


		lookupValues(key)
		{
			if (key === 'date') {
				return function(val) { return moment.unix(val).format('M/D') };
			}
			if (key === 'win') {
				if (this.type.includes('Recent')) {
					return function(val) {
						if (val === 0) return 'L'
						if (val === 1) return 'W'
						return ''
					}
				}
				else {
					return function(val, key, stats) {
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
			if (key.includes('_', -1)) {
				// percentage key being calculated
				return function(val, key, stats) {
					var prefix = key.slice(0, -1); // e.g. prefix of fg_ is fg
					var makes = stats[prefix + 'm']; // fgm
					var attempts = stats[prefix + 'a']; // fga
					if (! makes || ! attempts) return null
					return this.percentage(makes, attempts);
				}
			}
				
			else {
				return function(val, key, stats) { return this.round(val) };
			}	
		},

		lookupValClasses(key)
		{
			if (key === 'win') {
				return function(val) { 
					if (val === 0) return ['loss']
					if (val === 1) return ['win']
					return ['']
				}
			}

			else {
				return function(val) { return [''] };
			}
		},

		lookupKeyClasses(key)
		{
			if (key === 'opp') {
				return function() { return ['opp'] };
			}

			else {
				return function() { return [''] };
			}
		},

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
				case 'dnp':
					return function() { return 'Did Not Play'; };
				case 'pts':
					return function() { return 'Points'; };
				case 'fgm':
					return function() { return 'Field Goals Made'; };
				case 'fga':
					return function() { return 'Field Goals Attempted'; };
				case 'fg_':
					return function() { return 'Field Goal Percentage'; };
				case 'threepm':
					return function() { return 'Three Pointers Made'; };
				case 'threepa':
					return function() { return 'Three Pointers Attempted'; };
				case 'threep_':
					return function() { return 'Three Point Percentage'; };
				case 'ftm':
					return function() { return 'Free Throws Made'; };
				case 'fta':
					return function() { return 'Free Throws Attempted'; };
				case 'ft_':
					return function() { return 'Free Throw Percentage'; };
				case 'ast':
					return function() { return 'Assists'; };
				case 'reb':
					return function() { return 'Rebounds'; };
				case 'oreb':
					return function() { return 'Offensive Rebounds'; };
				case 'stl':
					return function() { return 'Steals'; };
				case 'blk':
					return function() { return 'Blocks'; };
				case 'to':
					return function() { return 'Turnovers'; };
				case 'pf':
					return function() { return 'Personal Fouls'; };
				case 'dd2':
					return function() { return 'Double Doubles'; };
				case 'td3':
					return function() { return 'Triple Doubles'; };
				case 'efg_':
					return function() { return 'Effective Field Goal Percentage'; };
				case 'ts_':
					return function() { return 'True Shooting Percentage'; };
				case 'astto':
					return function() { return 'Assist to Turnover Ratio'; };
				case 'eff':
					return function() { return 'Player Efficiency'; };
				default:
					return function() { return '';	 };
			}
		},

		lookupNames(key)
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
			if (key === 'astto') {
				return function() {
					return 'AST/TO';
				}
			}
			if (key === 'opp') {
				return function() {
					return 'OPPONENT';
				}
			}

			else {
				return function(key) {
					// everywhere with a _ becomes a %
					key = key.replace(/_/g , '%');

					// everywhere there's a 'three' becomes a '3'
					key = key.replace(/three/g, '3');

					// and also return all capitalized
					return key.toUpperCase();
				}
			}
		},

	}, // end methods
};


</script>