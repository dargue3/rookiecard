<template>
	<div></div>
</template>

<script>

import AbstractStat from './AbstractStat.js'

export default  {

	name: 'Basketball',

	props: ['type', 'event', 'players', 'rawStats', 'keys', 'record', 'sortKey', 'total', 'player', 'compile',
				'keyNames', 'tooltips', 'valLookup', 'keyClassLookup', 'valClassLookup', 'statsOnBottom'],

	mixins: [ AbstractStat ],

	data()
	{
		// dontShow : the keys that should not appear in the stats table
		// dontSum : the keys that should not be summed up when creating season totals
		// dontAvg : the keys that should not be averaged when creating season averages
	
		return {
			teamRawStats: [],
			teamRecent: {
				dontShow: ['name', 'gs', 'gp', 'min', 'efg_', 'ts_', 'astto', 'eff', 'dd2', 'td3'],
			},
			playerRecent: {
				dontShow: ['name', 'gs', 'gp', 'efg_', 'astto', 'ts_', 'eff', 'dd2', 'td3'],
			},
			teamSeason: {
				dontShow: ['date', 'name', 'opp', 'gs', 'min', 'efg_', 'ts_', 'astto', 'eff', 'dd2', 'td3'],
				dontSum: ['fg_', 'ft_', 'threep_'],
				dontAvg: [],
			},
			playerSeason: {
				dontShow: ['date', 'win', 'opp'],
				dontSum: ['fg_', 'ft_', 'threep_'],
				dontAvg: ['efg_', 'ts_', 'astto', 'eff'],
			},
			playerTeamSeason: {
				dontShow: ['date', 'win', 'opp'],
				dontSum: ['fg_', 'ft_', 'threep_'],
				dontAvg: ['efg_', 'ts_', 'astto', 'eff'],
			},
			viewingEvent: {
				dontShow: ['date', 'win', 'opp', 'gs', 'gp', 'efg_', 'ts_', 'eff', 'dd2', 'td3', 'astto'],
			},
		}
	},

	methods:
	{

		/**
		 * Set the key that will sort the stats table by default
		 */
		setDefaultSortKey()
		{
			if (this.type === 'teamRecent') this.sortKey = 'date';
			if (this.type === 'teamSeason') this.sortKey = '';
			if (this.type === 'playerRecent') this.sortKey = 'date';
			if (this.type === 'playerSeason') this.sortKey = 'pts';
			if (this.type === 'playerTeamSeason') this.sortKey = 'pts';
		},


		/**
		 * Compile the raw player stats for each event down into team stats
		 */
		createRawTeamStats()
		{
			let compiled = [];
			let event_id = 0;
			let eventCounter = -1;

			for (let playerStats in this.rawStats) {

				// each iteration of the loop is a player's stats for an event
				let currStats = JSON.parse(JSON.stringify(this.rawStats[playerStats]));

				// if this is the first set of stats for this event seen so far
				if (currStats.event_id !== event_id) {
					// save new entry
					event_id = currStats.event_id;
					eventCounter++;
					compiled[eventCounter] = currStats;
					compiled[eventCounter].stats = JSON.parse(currStats.stats);
					delete compiled[eventCounter].id;
					compiled[eventCounter].owner_id = currStats.team_id;
				}
				else {
					// add this player's stats to the total for this event
					let stats = JSON.parse(this.rawStats[playerStats].stats)
					for (let key in stats) {
						compiled[eventCounter].stats[key] += stats[key];
					}
				}
			}

			// turn stats back into JSON to be more seamless with how player stats look
			for (let index in compiled) {
				compiled[index].stats = JSON.stringify(compiled[index].stats);
			}

			this.rawTeamStats = compiled;
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
			if (this.usingKey('fg_')) {
				stats.fg_ = stats.fgm / stats.fga
			}
			if (this.usingKey('ft_')) {
				stats.ft_ = stats.ftm / stats.fta
			}
			if (this.usingKey('threep_')) {
				stats.threep_ = stats.threepm / stats.threepa
			}

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
			return this.sumBasketballStats(stats, playerTotals);
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
			if (this.usingKey('efg_')) {
				stats.efg_ = this.efg_(stats);
			}
			if (this.usingKey('ts_')) {
				stats.ts_ = this.ts_(stats);
			}
			if (this.usingKey('astto')) {
				stats.astto = this.astto(stats);
			}
			if (this.usingKey('eff')) {
				stats.eff = this.eff(stats);
			}
			if (this.usingKey('fg_')) {
				stats.fg_ = this.percentage(stats.fgm, stats.fga)
			}
			if (this.usingKey('ft_')) {
				stats.ft_ = this.percentage(stats.ftm, stats.fta)
			}
			if (this.usingKey('threep_')) {
				stats.threep_ = this.percentage(stats.threepm, stats.threepa)
			}

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
		 * Add the unique stat keys for basketball
		 *
		 * @param {object} data 					The stats as given by the back-end
		 * @param {object} playerTotals  	The current player season totals
		 */
		sumBasketballStats(data, playerTotals)
		{
			var stats = JSON.parse(data.stats);

			if (this.usingKey('dd2')) {
				playerTotals = this.addDoubleAndTripleDoubles('dd2', stats, playerTotals);
			}
			if (this.usingKey('td3')) {
				playerTotals = this.addDoubleAndTripleDoubles('td3', stats, playerTotals);
			}

			return playerTotals;
		},


		/**
		 * Create a stat for the number of double or triple doubles they've had
		 *
		 * @param {string} key 						Either 'dd2' or 'td3'
		 * @param {object} stats 					The stats as given by the back-end
		 * @param {object} playerTotals  	The current player season totals
		 */
		addDoubleAndTripleDoubles(key, stats, playerTotals)
		{
			if (typeof playerTotals[key] === 'undefined') {
				playerTotals[key] = 0;
			}

			let twoDigits = 0;
			if (stats.pts >= 10) twoDigits++; 
			if (stats.ast >= 10) twoDigits++; 
			if (stats.reb >= 10) twoDigits++; 
			if (stats.stl >= 10) twoDigits++; 
			if (stats.blk >= 10) twoDigits++;

			if (twoDigits >= 2 && key === 'dd2') {
				playerTotals.dd2++;
			}
			if (twoDigits >= 3 && key === 'td3') {
				playerTotals.td3++;
			}

			return playerTotals;
		},


		/**
		 * Calculate the bottom row of the table
		 *
		 * @param {object} playerTotals  	The compiled totals of player stats
		 */
		calculateBottomOfTableTotals(playerTotals)
		{
			let totals = {};
			let ignore = this.neverSum.concat(['gs', 'gp', 'efg_', 'ts_', 'astto', 'eff']);

			for (var index in playerTotals) {

				let playerStats = playerTotals[index];

				for (var key in playerStats) {
					if (ignore.indexOf(key) !== -1) {
						continue;
					}
					if (typeof totals[key] === 'undefined') {
						totals[key] = playerStats[key];
					}
					else {
						totals[key] += playerStats[key];
					}
				}
			}

			totals.gp = this.numberOfEvents();
			totals.efg_ = this.efg_(totals);
			totals.ts_ = this.ts_(totals);
			totals.astto = this.astto(totals);
			totals.eff = null;

			return totals;
		},


		/**
		 * Calculate the bottom row of the table
		 *
		 * @param {object} playerAvgs  	The compiled averages of player stats
		 */
		calculateBottomOfTableAverages(playerAvgs)
		{
			let avgs = {};
			let ignore = this.neverSum.concat(['gs', 'gp', 'efg_', 'ts_', 'astto', 'eff']);

			for (var index in playerAvgs) {

				let playerStats = playerAvgs[index];

				for (var key in playerStats) {
					if (ignore.indexOf(key) !== -1) {
						continue;
					}
					if (typeof avgs[key] === 'undefined') {
						avgs[key] = playerStats[key];
					}
					else {
						avgs[key] += playerStats[key];
					}
				}
			}

			avgs.gp = this.numberOfEvents();

			avgs.efg_ = this.efg_(avgs);
			avgs.ts_ = this.ts_(avgs);
			avgs.astto = this.astto(avgs);
			avgs.eff = null;

			return avgs;
		},


		/**
		 * Calculate how many points the team scored
		 * Only used when viewing individual event stats
		 */
		calculateScore(stats)
		{
			let points = 0;
			for (var index in stats) {
				points += stats[index].pts;
			}

			return points;
		},


		/**
		 * Calculates a player's effective field goal percentage
		 *
		 * @param {object} stats
		 */
		efg_(stats)
		{
			return this.percentage(stats.fgm + 0.5 * stats.threepm, stats.fga);
		},

		/**
		 * Calculates a player's true shooting percentage
		 * 
		 * @param {object} stats
		 */
		ts_(stats)
		{
			return this.percentage(stats.pts, 2 * (stats.fga + (0.44 * stats.fta)));
		},

		/**
		 * Calculates a player's assist to turnover ratio
		 * 
		 * @param {object} stats
		 */
		astto(stats)
		{
			return this.round(stats.ast / stats.to);
		},

		/**
		 * Calculates a player's efficiency
		 * 
		 * @param {object} stats
		 * @param {boolean} multiplier  May need to multiply by number of players for team totals
		 */
		eff(stats, multiplier = 1)
		{
			var missedFG = stats.fga - stats.fgm
			var missedFT = stats.fta - stats.ftm
			var eff = (stats.pts + stats.reb + stats.ast + stats.stl + stats.blk - missedFG - missedFT - stats.to) / stats.gp;

			eff = eff * multiplier;

			return this.round(eff, 2)
		},


		/**
		 * Calculate who won based on the given data
		 *
		 * @param {object} data
		 */
		whoWon(data)
		{
			let oppScore = JSON.parse(data.meta).oppScore;
			let teamScore = JSON.parse(data.stats).pts;

			if (oppScore > teamScore) {
				// they lost
				return 0;
			}
			if (oppScore < teamScore) {
				// they won
				return 1;
			}
			else {
				// tie 
				return 2;
			}
		},


		/**
		 * Format a team's wins, losses, ties into a string for displaying
		 */
		formatTeamRecordString()
		{
			if (this.ties > 0) {
				this.$set('record', `${this.wins}-${this.losses}-${this.ties}`);
			}
			else {
				this.$set('record', `${this.wins}-${this.losses}`);
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
			if (key === 'eff') {
				return function(val) {
					return this.round(val, 2)
				}
			}
			if (key === 'fg_' || key === 'ft_' || key === 'threep_') {
				// percentage key being calculated
				return function(val, stats, key) {
					var prefix = key.slice(0, -1); // e.g. prefix of fg_ is fg
					var makes = stats[prefix + 'm']; // fgm
					var attempts = stats[prefix + 'a']; // fga
					return this.percentage(makes, attempts);
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
			if (key === 'ast' || key === 'to') {
				return function() { return ['req-for-astto'] }
			}
			if (key === 'astto') {
				return function() { return ['req-for-astto', 'astto'] }
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
					if (this.type.includes('Season')) {
						if (this.total) {
							return 'WINS'
						}
						return 'W%';
					}
					else {
						return 'W/L';
					}
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