
<template>
	
	<div class="stats-container">

		<!-- tell the user there aren't any stats here -->
		<div v-if="noStats" class="Stats__title">
			<div class="text-center">
				<h3>There aren't any stats here yet...</h3>
			</div>
		</div>

		<!-- if this is an event, show the outcome and opponent -->
		<div v-if="type === 'event'" class="Stats__title">
			<div class="text-center">
				<h1>
					<span v-if="meta.teamScore > meta.oppScore" class="win">Win</span>
					<span v-if="meta.teamScore < meta.oppScore" class="loss">Loss</span>
					<span v-if="meta.teamScore === meta.oppScore" class="win">Tie</span>
					<span class="versus">{{ meta.home }} </span>{{ meta.opp }}
				</h1>
				<h1>{{ meta.teamScore }} - {{ meta.oppScore }}</h1>
			</div>
		</div>

	

    

		<!-- team recent stats -->
		<h3 v-show="type === 'event' && !noStats" class="Stats__header">Team Stats</h3>	
    <div v-show="type === 'teamRecent' || type === 'event'">
    	<div v-if="overflowed.teamRecent" class="Stats__overflow">
				<span class="--left" v-show="overflowed.teamRecent.first">
					<i class="material-icons">chevron_left</i>SCROLL
				</span>
				<span class="--right" v-show="overflowed.teamRecent.last">
					SCROLL<i class="material-icons">chevron_right</i>
				</span>
			</div>	
			<div id="teamRecentDiv" class='table-responsive'>
				<table v-show="teamRecentStats" class="table table-striped stats-table">
					<thead>
			    	<tr class="no-highlight">
			      	<th v-for="key in teamRecentCols" class="stat-columns text-center"
			      			:class="[teamSortKey === key ? 'col-sort' : '', key === 'opp' ? 'opp' : '']" @click="teamSortBy(key)"
			      				data-toggle="tooltip" :title="key | basketballTooltips">
			      		{{ key | basketballStats }}
			      		<br><span class="caret" :class="teamSortOrders[key] > 0  ? 'asc' : 'desc'"></span>	      	
			      	</th>
			    	</tr>
			  	</thead>
			  	<tbody>
			    	<tr v-show="statShown($index)" v-for="val in teamRecentStats | orderBy teamSortKey teamSortOrders[teamSortKey]">
				      <td v-for="key in teamRecentCols" class="stat-entries" :class="[key === 'win' ? winLossClass(val[key]) : '']">
				      	<span v-show="val[key] == null">-</span>
				        {{ val[key] }}
				      </td>
			    	</tr>
			  	</tbody>
				</table>
				<div v-else class="text-center">
					<p>No stats here yet...</p>
				</div>
			</div>
		</div>


		<!-- team season stats -->
		<div v-show="type === 'teamSeason'">
			<div v-if="overflowed.teamSeason" class="Stats__overflow">
				<span class="--left" v-show="overflowed.teamSeason.first">
					<i class="material-icons">chevron_left</i>SCROLL
				</span>
				<span class="--right" v-show="overflowed.teamSeason.last">
					SCROLL<i class="material-icons">chevron_right</i>
				</span>
			</div>
			<div id="teamSeasonDiv" class='table-responsive'>
				<table v-show="teamSeasonStats" class="table table-striped stats-table">
					<thead>
			    	<tr class="no-highlight">
			      	<th v-for="key in teamSeasonCols" class="stat-columns text-center"
			      			data-toggle="tooltip" :title="key | basketballTooltips">
			      		{{ key | basketballStats }}	
			      	</th>
			    	</tr>
			  	</thead>
			  	<tbody>
			    	<tr>
				      <td v-for="key in teamSeasonCols" class="stat-entries">
				      	<span v-show="teamSeasonStats[key] === null">-</span>
				        {{ teamSeasonStats[key] }}
				      </td>
			    	</tr>
			  	</tbody>
				</table>
				<div v-else class="text-center">
					<p>No stats here yet...</p>
				</div>
			</div>
		</div>


		<!-- player season stats -->
		<div v-show="type === 'playerSeason'">
			<div v-if="overflowed.playerSeason" class="Stats__overflow">
				<span class="--left" v-show="overflowed.playerSeason.first">
					<i class="material-icons">chevron_left</i>SCROLL
				</span>
				<span class="--right" v-show="overflowed.playerSeason.last">
					SCROLL<i class="material-icons">chevron_right</i>
				</span>
			</div>	
			<div id="playerSeasonDiv" class='table-responsive'>
				<table v-show="playerSeasonStats" class="table table-striped stats-table">
					<thead>
			    	<tr class="no-highlight">
			      	<th v-for="key in playerSeasonCols" class="stat-columns text-center"
			      			:class="[playerSortKey === key ? 'col-sort' : '', key === 'name' ? 'name' : '', 
			      								(playerSortKey === 'lastname' && key === 'name') ? 'col-sort' : '']" 
			      			@click="playerSortBy(key)" data-toggle="tooltip" :title="key | basketballTooltips">
			      		{{ key | basketballStats }}
			      		<br><span class="caret" :class="playerSortOrders[key] > 0  ? 'asc' : 'desc'"></span>	      	
			      	</th>
			    	</tr>
			  	</thead>
			  	<tbody>
			    	<tr v-show="statShown($index)" v-for="val in playerSeasonStats | orderBy playerSortKey playerSortOrders[playerSortKey]">
				      <td v-for="key in playerSeasonCols" class="stat-entries">
				      	<span v-show="val[key] == null">-</span>
				        {{ val[key] }}
				      </td>
			    	</tr>
			  	</tbody>
				</table>
				<div v-else class="text-center">
					<p>No stats here yet...</p>
				</div>
			</div>
		</div>


		<!-- player recent stats -->
		<div v-show="type === 'playerRecent' || type === 'event'">
			<h3 v-show="type === 'event' && !noStats" class="Stats__header">Player Stats</h3>
			<div v-if="overflowed.playerRecent" class="Stats__overflow">
				<span class="--left" v-show="overflowed.playerRecent.first">
					<i class="material-icons">chevron_left</i>SCROLL
				</span>
				<span class="--right" v-show="overflowed.playerRecent.last">
					SCROLL<i class="material-icons">chevron_right</i>
				</span>
			</div>	
			<div id="playerRecentDiv" >
				<div class='table-responsive'>
					<table v-show="playerRecentStats" class="table table-striped stats-table">
						<thead>
				    	<tr class="no-highlight">
				      	<th v-for="key in playerRecentCols" class="stat-columns text-center"
				      			:class="[playerSortKey === key ? 'col-sort' : '', key === 'name' ? 'name' : '',
				      								(playerSortKey === 'lastname' && key === 'name') ? 'col-sort' : '']" 
				      			@click="playerSortBy(key)" data-toggle="tooltip" :title="key | basketballTooltips">
				      		{{ key | basketballStats }}
				      		<br><span class="caret" :class="playerSortOrders[key] > 0  ? 'asc' : 'desc'"></span>	      	
				      	</th>
				    	</tr>
				  	</thead>
				  	<tbody>
				    	<tr v-show="statShown($index)" v-for="val in playerRecentStats | orderBy playerSortKey playerSortOrders[playerSortKey]">
					      <td v-for="key in playerRecentCols" class="stat-entries">
					      	<span v-show="val[key] == null">-</span>
					        {{ val[key] }}
					      </td>
				    	</tr>
				  	</tbody>
					</table>
					<div v-else class="text-center">
						<p>No stats here yet...</p>
					</div>
				</div>
			</div>
		</div>

		<div v-show="ifPagination" class="pagination text-center">
			<ul class="pagination">
				<li :class="{active: n === pagActive}" v-for="n in pagCount">
					<a @click="switchPag(n)">{{ n + 1 }}</a>
				</li>
			</ul>
		</div>


	</div>

</template>




<script>


import StatsScrollSpy 	from '../mixins/StatsScrollSpy.js'


export default  {

	name: 'BasketballStats',

	props: ['type', 'rawStats', 'pagination', 'event', 'players', 'teamCols', 'playerCols'],

	mixins: [StatsScrollSpy],


	data() {	

    if(!this.pagination) this.pagination = false;

    //if single-event stats are being viewed, remove unnecessary columns
    if(this.type === 'event') {
    	this.formatForEvent();
    }
 	
		return {
			pagActive: 0,
			pagCount: 1,
			rowsPerPage: 10,
			playerSeasonStats: [],
			playerRecentStats: [],
			teamRecentStats: [],
			teamSeasonStats: [],
			meta: {},
			noStats: false,
			teamSortKey: 'date',
			playerSortKey: 'pts',
			teamSortOrders: {},
			playerSortOrders: {},
		}

	},

	computed: {

		ifPagination() {
			return this.pagCount > 1 && this.pagination
		},

		//gets rid of the stat categories that aren't useful for team season stats
		teamSeasonCols() {
			var index;
			var teamCols = [];
			//make a non-reactive copy of cols
			this.teamCols.forEach(function(val) {
				teamCols.push(val);
			});

			index = teamCols.indexOf('date');
			if(index !== -1)
				teamCols.splice(index, 1);

			index = teamCols.indexOf('win');
			if(index !== -1)
				teamCols.splice(index, 1);

			index = teamCols.indexOf('opp');
			if(index !== -1)
				teamCols.splice(index, 1);

			return teamCols;
		},

		//use all team stats for recent stats
		teamRecentCols() {
			return this.teamCols;
		},

		//gets rid of the stat categories that aren't useful for player season stats
		playerSeasonCols() {
			var index;
			var playerCols = [];
			//make a non-reactive copy of cols
			this.playerCols.forEach(function(val) {
				playerCols.push(val);
			});

			index = playerCols.indexOf('date');
			if(index !== -1)
				playerCols.splice(index, 1);

			index = playerCols.indexOf('win');
			if(index !== -1)
				playerCols.splice(index, 1);

			index = playerCols.indexOf('opp');
			if(index !== -1)
				playerCols.splice(index, 1);

			return playerCols;
		},

		//gets rid of the stat categories that aren't useful for recent player stats
		playerRecentCols() {
			var index;
			var playerCols = [];
			//make a non-reactive copy of cols
			this.playerCols.forEach(function(val) {
				playerCols.push(val);
			});

			index = playerCols.indexOf('name');
			if(index !== -1)
				playerCols.splice(index, 1);

			index = playerCols.indexOf('gs');
			if(index !== -1)
				playerCols.splice(index, 1);

			index = playerCols.indexOf('gp');
			if(index !== -1)
				playerCols.splice(index, 1);

			index = playerCols.indexOf('efg_');
			if(index !== -1)
				playerCols.splice(index, 1);

			index = playerCols.indexOf('astto');
			if(index !== -1)
				playerCols.splice(index, 1);

			index = playerCols.indexOf('ts_');
			if(index !== -1)
				playerCols.splice(index, 1);

			index = playerCols.indexOf('per');
			if(index !== -1)
				playerCols.splice(index, 1);

			index = playerCols.indexOf('eff');
			if(index !== -1)
				playerCols.splice(index, 1);

			return playerCols;
		}
	},

	events: {
		compileStats() {
			this.compile();
		}
	},

	watch: {
		type() {
			this.initScrollSpy();
		}
	},

	methods: {

		//initializes variables when stats request arrives
		compile() {

			var pagCount = 1;
			var rawTeamStats = [];
			var rawPlayerStats = [];

			if(this.rawStats.length) {

				//separate the data into player and team stats arrays
				for(var x = 0; x < this.rawStats.length; x++) {

					//team stats
					if(this.rawStats[x].type === 1)
						rawTeamStats.push(this.rawStats[x]);

					//player stats
					if(this.rawStats[x].type === 0)
						rawPlayerStats.push(this.rawStats[x]);
				}

				//format stats for table
				this.makeTeamRecentStats(rawTeamStats);
				this.makePlayerSeasonStats(rawPlayerStats);
				this.makeTeamSeasonStats(rawTeamStats);

				
				//initialize the sorting order on columns to be descending
				var teamSortOrders = {};
				this.teamCols.forEach(function(key) {
					teamSortOrders[key] = -1;
				});
				var playerSortOrders = {};
				this.playerCols.forEach(function(key) {
					playerSortOrders[key] = -1;
				});
				playerSortOrders['lastname'] = -1;

				//number of pages
				pagCount = Math.ceil(this.teamRecentStats.length / this.rowsPerPage);

				this.pagCount = pagCount;
				this.teamSortOrders = teamSortOrders;
				this.playerSortOrders = playerSortOrders;

			}

			else {
				//error occurred getting data, create placeholder data
				this.playerSeasonStats 	= this.markEmpty(0);
				this.playerRecentStats 	= this.markEmpty(0);
				this.teamRecentStats 		= this.markEmpty(1);
				this.teamSeasonStats 		= this.markEmpty(1);
				
			}

			this.initScrollSpy();
		},


		//prepare listeners for showing "SCROLL >" indicators
		initScrollSpy() {
			if(this.type === 'teamSeason') 
				this.attachScrollListener('#teamSeasonDiv', 'teamSeason');

			if(this.type === 'teamRecent') 
				this.attachScrollListener('#teamRecentDiv', 'teamRecent');

			if(this.type === 'playerSeason') 
				this.attachScrollListener('#playerSeasonDiv', 'playerSeason');

			if(this.type === 'event' || this.type === 'playerRecent') 
				this.attachScrollListener('#playerRecentDiv', 'playerRecent');
		},


		//compiles averages for the season for each player
		//fair warning: this function is sort of a monster
		makePlayerSeasonStats(rawData) {
			var statsArray = [];
			var IDs = [];
			var playerStats = [];

			//start by grouping all the stats by player
			for(var x = 0; x < rawData.length; x++) {
				var data = rawData[x];
				var userStats = [];

				//if this player hasn't had their stats grouped yet
				if(IDs.indexOf(data.owner_id) === -1) {
					//find all of this player's stats in rawData
					userStats = rawData.filter(function(stat) {
						return stat.owner_id === data.owner_id && stat.type === 0;
					});
					//add them to the list of already sorted
					IDs.push(data.owner_id);
					statsArray.push(userStats);
				}
			}


			//now loop through each players' stats and average
			for(var x = 0; x < statsArray.length; x++) {

				//init object of compiled player's stats
				//length of this array === number of games played
				var totalStats = {};
				this.playerSeasonCols.forEach(function(key) {
					totalStats[key] = 0;
				});
				totalStats.gp = statsArray[x].length
				var thisPlayer = this.players.filter(function(player) {
					return player.member_id === statsArray[x][0].member_id;
				});
				totalStats.lastname = thisPlayer[0].lastname;
				

				//loop through each stats object belonging to this user
				for(var y = 0; y < statsArray[x].length; y++) {
					//store the stats for this event
					var stats = JSON.parse(statsArray[x][y].stats);
					var doubleDigits = 0;

					for(var key in stats) {
						if(stats.hasOwnProperty(key)) {

							if(key[key.length - 1] === '_')
								continue; //leave the percentages (e.g. fg_) for later

							if(isNaN(stats[key])){
								totalStats[key] = stats[key]; //not something that needs averaging
								continue;
							}

							if(key === 'starter') {
								//rename 'starter' to be 'gs'
								totalStats.gs++;
								continue;
							}

							//make a counter for double and triple doubles
							//double double = 2 stat categories in double digits
							if(stats[key] >= 10) {
								if(key === 'ast' || key === 'reb' || key === 'stl' || key === 'blk' || key === 'pts') {
									doubleDigits++;
								}
							}

							//add the these stats to the total
							totalStats[key] = totalStats[key] + stats[key];	
						}
					}

					//if two categories in double digits, they get a double double
					//a triple double counts as both
					if(doubleDigits == 2)
						totalStats.dd2++;
					if(doubleDigits > 2) {
						totalStats.dd2++;
						totalStats.td3++;
					}
				}

				//depending on what sport this team is, do the correct stat crunching
				playerStats.push(this.crunchStats(totalStats));

			}

			if(!playerStats.length)
				playerStats = this.markEmpty(0);

			//finally done
			this.playerSeasonStats = playerStats;
				
		},

		crunchStats(totals) {
			var crunched = {};

			//loop through each key
			for(var key in totals) {
				if(totals.hasOwnProperty(key)) {
					//key exists

					//keys not needing averaging
					if(key === 'name' || key === 'dd2' || key === 'td3' || key === 'lastname') {
						crunched[key] = totals[key];
						continue;
					}

					//special cases, aren't averaged
					if(key === 'gs' || key === 'gp') {
						if(totals[key] === true)
							crunched[key] = 1;
						else if(totals[key] === false)
							crunched[key] = 0;
						else
							crunched[key] = totals[key];
						continue;
					}

					//average by number of games played, round to nearest tenth
					crunched[key] = Math.round((totals[key] / totals['gp']) * 10) / 10;
				}
			}

			//calculate the percentages
			//field goal, 3 pointers, free throws
			var prefixes = ['fg', 'threep', 'ft'];
			for(var x = 0; x < prefixes.length; x++) {
				var makes = prefixes[x] + 'm';
				var attempts = prefixes[x] + 'a';
				var percentage = prefixes[x] + '_';

				if(crunched[makes] && crunched[attempts]) {
					var percent = crunched[makes] / crunched[attempts];
					if(isNaN(percent)) {
						crunched[percentage] = 0;
						continue;
					}
					//convert to percentages and round to nearest tenth
					crunched[percentage] = Math.round((percent * 100) * 10) / 10;
				}
				else {
					crunched[percentage] = 0;
				}
			}


			//calculate special stats

			if(this.playerSeasonCols.includes('eff')) {
				crunched['eff'] = this.efficiency(totals);
			}

			if(this.playerSeasonCols.includes('efg_')) {
				var efg = (totals['fgm'] + 0.5 * totals['threepm']) / totals['fga'];
				crunched['efg_'] = Math.round((efg * 100) * 10) / 10;
			}

			if(this.playerSeasonCols.includes('ts_')) {
				var ts = totals['pts'] / (2 * (totals['fga'] + (0.44 * totals['fta'])));
				crunched['ts_'] = Math.round((ts * 100) * 10) / 10;
			}

			if(this.playerSeasonCols.includes('astto')) {
				var astto = totals['ast'] / totals['to'];
				crunched['astto'] = Math.round(astto * 10) / 10;
			}

			return crunched;
		},

		//calculates a players season efficiency rating
		efficiency(totals) {
			var eff =  (totals['pts'] + totals['reb'] + totals['ast'] + totals['stl'] +
						totals['blk'] - (totals['fga'] - totals['fgm']) - (totals['fta'] - totals['ftm']) - 
						totals['to']) / totals['gp'];

			return Math.round(eff * 100) / 100;
		},


		//compiles raw stats into a list of stats by event
		makeTeamRecentStats(rawData) {
			var teamStats = [];

			//for each event, parse some info
			for(var x = 0; x < rawData.length; x++) {
				var data = rawData[x];

				var stats = JSON.parse(data.stats);
				var meta = JSON.parse(data.meta);

				//format date of event like 1/31
				var date = moment.utc(data.event_date * 1000).local().format('M/D');

				stats.date 		 = date;
				stats.id 			 = data.id;
				stats.event_id = data.event_id;

				//if they included who this game was against
				if(meta.event.class === 1) {
					//home game
					stats.opp = 'vs. ' + meta.opp;
					meta.home = 'vs.';
				}
				else if(meta.event.class === 2) {
					//away game
					stats.opp = '@ ' + meta.opp;
					meta.home = '@';
				}
				else {
					//unspecified
					stats.opp = meta.opp;
				}
				


				if(meta.oppScore < stats.pts) {
					//they won
					stats.win = 'W';
				}
				else if(meta.oppScore > stats.pts) {
					//they lost
					stats.win = 'L';
				}
				else if(meta.oppScore === stats.pts) {
					//tie
					stats.win = 'TIE';
				}


				teamStats.push(stats);
			}

			if(!teamStats.length)
				teamStats = this.markEmpty(1)

			this.teamRecentStats = teamStats;
			this.meta = meta;

		},


		makeTeamSeasonStats(rawData) {

			var totalStats = {
				gp: rawData.length,
			};
			
			for(var x = 0; x < rawData.length; x++) {
	
				//store the stats for this event
				var stats = JSON.parse(rawData[x].stats);
				var meta = JSON.parse(rawData[x].meta);
				var doubleDigits = 0;

				for(var key in stats) {
					if(stats.hasOwnProperty(key)) {

						if(key.includes('_')) {
							totalStats[key] = '-';
							continue; //leave the percentages (e.g. fg_) for later
						}

						if(isNaN(stats[key])) {
							totalStats[key] = stats[key]; //not something that needs averaging
							continue;
						}
						
						//if this key already exists, add the numbers
						if(totalStats[key]) 
							totalStats[key] = totalStats[key] + stats[key];
						else 
							totalStats[key] = stats[key];
					}
				}

					
			}

			this.teamSeasonStats = this.crunchStats(totalStats);
		
		},

		//if stats are being viewed for a single event, cut out unnecessary columns
		formatForEvent() {

			var index = this.teamCols.indexOf('win');
			this.teamCols.splice(index, 1);
			index = this.teamCols.indexOf('date');
			this.teamCols.splice(index, 1);
			index = this.teamCols.indexOf('opp');
			this.teamCols.splice(index, 1);


			index = this.playerCols.indexOf('gs');
			this.playerCols.splice(index, 1);
			index = this.playerCols.indexOf('gp');
			this.playerCols.splice(index, 1);
			index = this.playerCols.indexOf('dd2');
			this.playerCols.splice(index, 1);
			index = this.playerCols.indexOf('td3');
			this.playerCols.splice(index, 1);
		},


		//decides whether or not this row is shown
		//based on which pagination page is active
		statShown(index) {
			return this.pagActive === Math.floor(index / this.rowsPerPage) || !this.pagination;
		},

		//returns 'win' or 'loss' for formatting class on W/L column
		winLossClass(val) {
			if(val === 'W')
				return 'win';
			else if(val === 'L')
				return 'loss';
			else if(val === 'TIE')
				return 'versus';
			else
				return '';
		},

		//new pagination link was clicked
		switchPag(clicked) {
			this.pagActive = clicked;
		},

		//set the clicked header as the sort key
		//invert ascending / descending
		playerSortBy(key) {

			if(key === 'name') {
				//if sorting by name, really sort by hidden lastname field
				key = 'lastname'; 
				if(key === this.playerSortKey)
					this.playerSortOrders['name']  = this.playerSortOrders['name'] * -1;
				else
					this.playerSortKey = 'lastname';

				return;
			}

			if(key === this.playerSortKey)
				this.playerSortOrders[key]  = this.playerSortOrders[key] * -1;
			else
				this.playerSortKey = key;
		},

		teamSortBy(key) {
			if(key === this.teamSortKey)
				this.teamSortOrders[key]  = this.teamSortOrders[key] * -1;
			else
				this.teamSortKey = key;
		},


		//instead of an empty stats row, fill with '-'
		markEmpty(type) {
			var stats = [{}];

			if(type === 0) {
				//player stats
				this.playerCols.forEach(function(key) {
					stats[key] = '-';
				});
			}
			else if(type === 1) {
				//team stats
				this.teamCols.forEach(function(key) {
					stats[key] = '-';
				});
			}
			return stats;
		},

	},

	ready() {

		$(function() {

			$('[data-toggle="tooltip"').tooltip({
				container: 'body',
				delay: {show: 400, hide: 0},
			});
		});

	}

};




</script>




<style lang="stylus">

@import '/resources/assets/stylus/variables.styl'

.Stats__title
	display flex
	flex-flow row
	margin-bottom 4em
	div
		flex 1
		justify-content center
		align-items center
	h1
		@media screen and (max-width 767px)
			font-size 25px	
		
	.versus
		color rc_light_gray
	.win
		color rc_win
	.loss
		color rc_loss
		
.Stats__header
	margin-bottom 15px
	@media screen and (max-width 767px)
			font-size 20px	

</style>



