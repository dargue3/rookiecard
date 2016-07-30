import StatFunctions from './StatFunctions.js'

export default
{
	mixins: [ StatFunctions ],

	events:
	{
		/**
		 * Event received from Stats.vue when needed
		 */
		compileStats()
		{
			this.setup();

			// call the function with the same name as the type
			// i.e. this.teamRecent()
			this[this.type].call(this);
		}
	},

	computed:
	{
		teamStats()
		{
			return this.rawStats.filter(function(stat) {
				return stat.type === 'team';
			})
		},

		playerStats()
		{
			return this.rawStats.filter(function(stat) {
				return stat.type === 'player';
			})
		},
	},


	methods:
	{
		/**
		 * Setup a few variables before compiling any stats
		 */
		setup()
		{
			this.teamMeta = JSON.parse(this.team.meta);

			if (this.type.includes('team')) {
				var cols = this.teamMeta.stats.teamCols;
			}
			else if (this.type.includes('player')) {
				var cols = this.teamMeta.stats.playerCols;
			}

			this.cols = cols.filter(function(key) {
				return this.ignoredCols[this.type].indexOf(key) === -1
			}.bind(this))

			this.cols.forEach(function(key) {
				this.keyNames[key] = this.lookupNames(key);
				this.tooltips[key] = this.lookupTooltips(key);
				this.valLookup[key] = this.lookupValues(key);
				this.valClassLookup[key] = this.lookupValClasses(key);
				this.keyClassLookup[key] = this.lookupKeyClasses(key);
			}.bind(this));
		},

		/**
		 * Done building stats, tell parent data is ready
		 *
		 * @param {array} stats  Compiled stats
		 */
		done(stats)
		{
			if (! Array.isArray(stats)) stats = [stats];

			if (! stats.length) {
				stats = [this.markEmpty()];
			}

			this.$dispatch('Stats_compiled', stats);
		},


		/**
		 * Instead of an empty table, fill each stat with '-'
		 */
		markEmpty()
		{
			var stats = {};
			this.cols.forEach(function(key) {
				stats[key] = '-';
			});

			return stats;
		},


		/**
		 * Compiles an object of lifetime totals into averages based on the number of games played
		 *
		 * @param {object} stats  Lifetime totals
		 * @param {array} noAvg 	The keys that should not be averaged
		 */
		perGame(stats, noAvg)
		{
			var averaged = {};
			for (var key in stats) {
				if (noAvg.indexOf(key) !== -1) {
					averaged[key] = stats[key];
					continue;
				}

				averaged[key] = stats[key] / stats.gp;
			}

			return averaged;
		},


		/**
		 * Add the given stats to the season totals object, possibly ignoring some keys
		 *
		 * @param {object} data   			The stat object as given from the server
		 * @param {object} statTotals 	The current season totals object
		 * @param {array} ignored 			Which keys should be ignored
		 */
		addToSeasonTotal(data, statTotals, ignored)
		{
			var stats = JSON.parse(data.stats);
			var meta = JSON.parse(data.meta);

			stats.gp = 1;
			stats.wins = 0;
			stats.losses = 0;
			stats.ties = 0;
			// add a win, loss, or tie to the total depending on the outcome
			if (this.whoWon(stats, meta) === 0) stats.losses = 1;
			if (this.whoWon(stats, meta) === 1) stats.wins = 1;
			if (this.whoWon(stats, meta) === 2) stats.ties = 1;

			// for each key in stats, add it to the total
			for (var key in stats) {
				if (ignored.indexOf(key) !== -1) continue;

				if (typeof statTotals[key] === 'undefined') {
					statTotals[key] = stats[key];
				}
				else {
					statTotals[key] += stats[key];
				}
			}

			return statTotals;
		},


		/**
		 * Sort out the sport-agnostic recent team stats
		 *
		 * @param {object} data  	The stats data as given by the server
		 * @return {object} 			Slightly more compiled stats
		 */
		defaultTeamRecent(data)
		{
			var meta = JSON.parse(data.meta);
			var stats = JSON.parse(data.stats);

			// format date to unix time for sorting efficiency, converts to 'M/D' later in Stats.vue
			var date = moment.utc(meta.event.start * 1000).local().unix();

			stats.date = date;
			stats.id = data.id;
			stats.event_id = data.event_id;

			// if they included who this game was against
			if (meta.event.type === 'home_game') {
				// home game
				stats.opp = meta.opp + '***';
			}
			else if (meta.event.type === 'away_game') {
				// away game
				stats.opp = meta.opp + '^^^';
			}
			else {
				// unspecified
				stats.opp = meta.opp;
			}

			stats.win = this.whoWon(stats, meta);

			return stats;
		},


		/**
		 * Sort out the sport-agnostic season team stats
		 *
		 * @param {array} ignored 	Which stat keys should be ignored
		 * @param {array} noAvg 		Which stat keys shouldn't be averaged
		 * @return {object} 				Team's averaged season stats
		 */
		defaultTeamSeason(ignored, noAvg)
		{
			var seasonTotals = {};
			for (var x = 0; x < this.teamStats.length; x++) {
				seasonTotals = this.addToSeasonTotal(this.teamStats[x], seasonTotals, ignored);
			}

			this.totalStats = seasonTotals;

			this.avgStats = this.perGame(seasonTotals, noAvg);

			return this.avgStats;
		},


	}, // end methods


}