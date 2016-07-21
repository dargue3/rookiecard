
<template>
	
	<div id="statsWrapper">

		<!-- if user clicks this, show form to edit event details, value travels up to ViewEvent.vue -->
		<div class="edit-button">
			<a class="btn btn-primary --chevron --lg" @click="editEvent = true">
				Edit Event Details
				<i class="material-icons btn-chevron --right">chevron_right</i>
			</a>
		</div>

		<!-- notes to user -->
		<div class="stat-notes">
			<span><strong>Notes about stat entries:</strong></span>
			<ul>
				<li>
					<p>Any fields left empty are treated as zeros.</p>
				</li>
				<li v-show="usesMinutes">
					<p>If MIN is zero, that player's stats are treated as a DNP (did not play) and don't count as zeros.</p>
				</li>
				<li v-show="!usesMinutes">
					<p>If DNP (did not play) is checked, that player's stats are ignored and don't count as zeros.</p>
				</li>
			</ul>
		</div>

		<!-- input new stats here -->
		<h3>Box Score</h3>
		<form @submit.prevent>
			<div v-if="overflowed.playerStats" class="Stats__overflow">
				<span class="--left" v-show="overflowed.playerStats.first">
					<i class="material-icons">chevron_left</i>SCROLL
				</span>
				<span class="--right" v-show="overflowed.playerStats.last">
					SCROLL<i class="material-icons">chevron_right</i>
				</span>
			</div>		
			<div id="editPlayerStatsDiv" class='table-responsive stats-container'>
				<table class="table stats-table">
					<thead>
			    	<tr>
			      	<th v-for="col in newPlayerCols" class="stat-columns text-center"
			      			data-toggle="tooltip" :title="col | basketballTooltips">
			      		{{ col | basketballStats }}
			      	</th>
			    	</tr>
			  	</thead>
			  	<tbody>
			    	<tr v-for="(index, row) in newStats | orderBy 'lastname'" class="form-group">
				      <td v-for="col in newPlayerCols" class="new-stats stat-entries text-center">
				      	<!-- span inserts calculated data that isn't inputted by user -->
				      	<span v-if="specialRow(col)">
				      		<span v-if="col === 'name'">{{ row[col] }}</span>
				      		<input v-if="col === 'starter'" type="checkbox" v-model="newStats[index][col]">
				      		<input v-if="col === 'dnp' && ! usesMinutes" type="checkbox" v-model="newStats[index][col]">
				      		<span v-if="col === 'fg_'">{{ newStats_percent(index, 'fg') | checkPercentage }}</span>
				      		<span v-if="col === 'ft_'">{{ newStats_percent(index, 'ft') | checkPercentage }}</span>
				      		<span v-if="col === 'threep_'">{{ newStats_percent(index, 'threep') | checkPercentage }}</span>
				      	</span>
				      	<input v-else type="text" class="form-control stats-input text-center" 
				      					autocomplete="off" :placeholder="col | basketballStats" v-model="newStats[index][col]" number>
				      </td>
			    	</tr>
			  	</tbody>
				</table>
			</div>

			<div class="meta-data">
				<div class="form-group opponent">
					<label for="opp">Opponent</label>
					<input name="opp" type="text" class="form-control" required 
									autocomplete="off" v-model="meta.opp">
				</div>
				<div class="form-group opponent-score">
					<label for="oppScore">Opponent Score</label>
					<input name="oppScore" type="text" class="form-control" number required 
									autocomplete="off" v-model="meta.oppScore">
				</div>
			</div>

			<!-- compiled team stats table -->
			<h3>Team Stats</h3>
			<div v-if="overflowed.teamStats" class="Stats__overflow">
				<span class="--left" v-show="overflowed.teamStats.first">
					<i class="material-icons">chevron_left</i>SCROLL
				</span>
				<span class="--right" v-show="overflowed.teamStats.last">
					SCROLL<i class="material-icons">chevron_right</i>
				</span>
			</div>		
			<div id="editTeamStatsDiv" class='table-responsive stats-container'>
				<table class="table table-striped stats-table">
					<thead>
			    	<tr>
			      	<th v-for="col in newTeamCols" class="stat-columns text-center"
			      			data-toggle="tooltip" :title="col | basketballTooltips">
			      		{{ col | basketballStats }}
			      	</th>
			    	</tr>
			  	</thead>
			  	<tbody>
			    	<tr class="no-hover">
				      <td v-for="col in newTeamCols" class="stat-entries">
				      <!-- span inserts calculated percentages instead of totals -->
				      	<span v-if="specialRow(col)">
					      	<span v-if="col === 'fg_'">{{ team_percent('fg') | checkPercentage }}</span>
					      	<span v-if="col === 'threep_'">{{ team_percent('threep') | checkPercentage }}</span>
					      	<span v-if="col === 'ft_'">{{ team_percent('ft') | checkPercentage }}</span>
					      </span>
				      	<span v-else>{{ team_total(col) }}</span>
				      </td>
			    	</tr>
			  	</tbody>
				</table>
			</div>

	    <div class="row">
	      <div class="col-xs-6 col-xs-offset-3 col-sm-4 col-md-2"
	      			:class="[stats.length ? 'col-md-offset-3' : 'col-md-offset-4',
	      			         stats.length ? 'col-sm-offset-0' : 'col-sm-offset-2']">
	      	<input type="submit" class="btn btn-block btn-primary btn-md" value="SAVE">
	      </div>
	      <div class="col-xs-6 col-xs-offset-3 col-sm-4 col-sm-offset-0 col-md-2" v-show="stats.length">
	      	<a @click="deleteStats()" class="btn btn-block btn-delete btn-md">DELETE</a>
	      </div>
	      <div class="col-xs-6 col-xs-offset-3 col-sm-4 col-sm-offset-0 col-md-2">
	      	<a @click="discardStats()" class="btn btn-block btn-cancel btn-md outline">CANCEL</a>
	      </div>
	    </div>

		</form>
	</div>
		

	
</template>


<script>

import StatsScrollSpy 	from '../mixins/StatsScrollSpy.js'


export default  {
	
	name: 'EditBasketballStats',

	props: ['stats', 'players', 'event', 'team', 'editEvent',
					'playerCols', 'teamCols'],

	mixins: [StatsScrollSpy],


	data() {
		return {
			newStats: [],
			teamStats: {},
			meta: {
				opp: '',
				oppScore: '',
				teamScore: '',
			},
		}
	},

	watch: {

		// if stats change, reinitialize the page
		stats()
		{
			this.compile();
		},

		// if the viewed event changes, reinitialize the page
		event()
		{
			this.compile();
		},
	},


	computed:
	{
		newPlayerCols()
		{
			var index;
			var newCols = JSON.parse(JSON.stringify(this.playerCols));

			var ditch = ['date', 'win', 'opp', 'gs', 'gp', 'efg_', 'astto', 'ts_', 'per', 'eff', 'dd2', 'td3'];
			ditch.forEach(function(stat) {
				var index = newCols.indexOf(stat);
				if (index !== -1) {
					newCols.splice(index, 1);
				}
			});

			return newCols;
		},

		newTeamCols()
		{
			var index;
			var newCols = [];

			this.newPlayerCols.forEach(function(val) {
				newCols.push(val);
			});

			var ditch = ['name', 'dnp'];
			ditch.forEach(function(stat) {
				var index = newCols.indexOf(stat);
				if (index !== -1) {
					newCols.splice(index, 1);
				}
			});

			return newCols;
		},
		

	},

	methods: {

		compile() {
			var newStats = [];
			var IDs = [];

			this.meta.opp = '';
			this.meta.oppScore = '';
			this.meta.teamScore = '';


			// first initialize newStats with any existing data
			for(var x = 0; x < this.stats.length; x++) {
				var curr = this.stats[x];

				
				// catch the team stats for this event
				if(curr.type === 'team') {
					// initialize meta data
					var meta = JSON.parse(curr.meta);
					this.meta.opp = meta.opp;
					this.meta.oppScore = meta.oppScore;
					continue;
				}

				if(IDs.indexOf(curr.member_id) !== -1) {
					// this player's stats already parsed (error somewhere down the road)
					continue;
				}

				var player = this.players.filter(function(player) {
					return player.member_id === curr.member_id;
				})

				var stats = JSON.parse(curr.stats);

				stats['id'] = curr.owner_id;
				stats['member_id'] = curr.member_id;
				stats['name'] = player[0].abbrName;
				
				newStats.push(stats);	
				IDs.push(curr.member_id);
			}




			for(var x = 0; x < this.players.length; x++) {
				var curr = this.players[x];
				var emptyStats = {};

				if(IDs.indexOf(curr.member_id) !== -1)
					// this player's stats already parsed, don't create empty row
					continue;

				this.newPlayerCols.forEach(function(col) {
					emptyStats[col] = '';
				});
				emptyStats.id = curr.id;
				emptyStats.member_id = curr.member_id;
				emptyStats.name = curr.abbrName
				emptyStats.starter = false;
				emptyStats.dnp = false;

				newStats.push(emptyStats);
			}

			this.newStats = newStats;


			this.initScrollSpy();	
		},


		// attach listeners for whether or not to show SCROLL > indicators
		initScrollSpy()
		{
			setTimeout(function() {
				this.attachScrollListener('#editTeamStatsDiv', 'teamStats');
				this.attachScrollListener('#editPlayerStatsDiv', 'playerStats');
			}.bind(this), 500);
		},


		// decide whether or not this stat column needs special formatting
		specialRow(col)
		{
			if(col === 'name' || col === 'starter' || col === 'dnp')
				return true;
			if(col[col.length - 1] === '_')
				return true;

			return false;
		},


		// submit to database
		submitStats()
		{
			// check that the inputs are error free
			var errors = this.errorCheck();

			if(!errors) {

				// did these stats exist and were then updated?
				var statsAreNew = this.stats.length ? false : true;

				// store how many points team had (for status update meta data)
				this.meta.teamScore = this.teamStats.pts;
				this.meta.team = this.team.name;
				var self = this;
				var data = {
					playerStats: this.newStats,
					teamStats: this.teamStats,
					event: this.event.id,
					team: this.team,
					meta: this.meta,
				};

				// save as a new event
				if(statsAreNew) {
					var url = this.$parent.prefix + '/stats'; 
					this.$http.post(url, data)
						.then(function(response) {
							// send a stats updated event to parent
							if(response.data.ok) {
								self.$dispatch('newStats', response.data.stats, response.data.feed);
								$('#viewEventModal').modal('hide');
								self.stats = {};
								self.compile();
								self.$root.banner("good", 'Stats saved');
							}
							else {
								// they weren't allowed to add stats
								self.$root.banner('bad', response.data.error);
							}
						})

						.catch(function() {
							self.$root.errorMsg();
						});
				}

				// update existing stats
				else {
					var url = this.$parent.prefix + '/stats'; 
					this.$http.put(url, data)
						.then(function(response) {
							if(response.data.ok) {
								self.$dispatch('updateStats', response.data, this.event);
								$('#viewEventModal').modal('hide');
								self.stats = {};
								self.compile();
								self.$root.banner("good", 'Stats saved');
							}
							else {
								// they weren't allowed to update stats
								self.$root.banner('bad', response.data.error);
							}
						})

						.catch(function() {
							self.$root.errorMsg();
						});
				}
			}
		},

		// throw away inputted data
		discardStats()
		{
			$('#viewEventModal').modal('hide');
			this.compile();
		},


		deleteStats()
		{
			$('#viewEventModal').modal('hide');
			this.$dispatch('deleteStats', this.event);
			this.stats = {};
			this.compile();

			var self = this;
			var name = this.$route.params.name;
			var prefix = this.$parent.prefix;
			var url = prefix + name + '/stats/' + this.event.id; 
			this.$http.delete(url)

				.then(function(response) {	
					self.$root.banner('good', "Stats deleted");
				})
				.catch(function() {
					self.$root.errorMsg();
				});
		},


		// calculates and saves the total for that field
		// accepts everything except the percentage cols
		team_total(col)
		{
			var stats = this.newStats;
			var total = 0;
			for(var x = 0; x < stats.length; x++) {
				if(stats[x][col] === '') 
					total += 0;
				else 
					total += stats[x][col];
			}
			this.teamStats[col] = total;
			return total;
		},

		// calculates and saves percentages for team
		// accepts fg, ft, threep for cols
		// e.g. col == 'fg', var p = 'fg_'
		team_percent(col)
		{
			var stats = this.newStats;
			var m = col + 'm';
			var a = col + 'a';
			var p = col + '_';
			var makes = 0;
			var attempts = 0;
			var percent = 0;
			for(var x = 0; x < stats.length; x++) {
				// first check if makes > attempts, return percent > 100
				// the 'percentage' filter turns this into 'ERROR'
				if(stats[x][m] > stats[x][a]) {
					percent = 101;
					this.teamStats[p] = 101;
					return percent;
				}
				if(stats[x][m] === '') 
					makes += 0;
				else 
					makes += stats[x][m];

				if(stats[x][attempts] === '') 
					attempts += 0;
				else 
					attempts += stats[x][a];
			}
			percent = makes / attempts;

			// make into percentage with one decimal place accuracy
			percent = Math.round((percent * 100) * 10) / 10;
			if(isNaN(percent))
				percent = 0;

			this.teamStats[p] = percent;
			return percent;
		},

		// calculates and saves percentages for this player
		// accepts fg, ft, threep for cols
		// e.g. col == 'fg', var p = 'fg_'
		newStats_percent(index, col)
		{
			var percentage = 0;

			// dynamically picks which stat based on col
			var m = col + 'm';
			var a = col + 'a';
			var p = col + '_';

			if(this.newStats[index][m] === '' || this.newStats[index][a] === '')
					percentage = 0;
			else
				percentage = this.newStats[index][m] / this.newStats[index][a];

			// make into percentage with one decimal place accuracy
			percentage = Math.round((percentage * 100) * 10) / 10;

			if(isNaN(percentage))
				percentage = 0;

			this.newStats[index][p] = percentage;
			return percentage;
		},

		errorCheck()
		{
			var stats = this.newStats;
			for(var x = 0; x < stats.length; x++) {
				if(stats[x].fg_ > 100) {
					this.errorMessage('FG');
					return true;
				}
				if(stats[x].threep_ > 100) {
					this.errorMessage('3P');
					return true;
				}
				if(stats[x].ft_ > 100) {
					this.errorMessage('FT');
					return true;
				}
			}

			if(!Number.isInteger(this.meta.oppScore)) {
				this.$root.popup('bad', 'Error in Stats!', 'Check that the Opponent\'s score is a number.');
				return true
			}

			return false;
		},

		// displays a customized error message depending on which stat category was incorrect
		errorMessage(col)
		{
			this.$root.popup("bad", "Error in stats!", "One of the " + col + "M entries is greater than " + col + "A, please correct first. Look for the row with ERROR in " + col + "%");
		},
	},

};

</script>


<style lang="stylus">

@import '/resources/assets/stylus/variables.styl'

#statsWrapper
	padding 1.5em
	h3
		margin-top 2em

.stats-radio
	padding-left 3em
	
.stat-notes
	margin-bottom 20px	
	
.edit-button
	position relative
	display flex
	flex-flow row
	justify-content flex-end
	@media screen and (max-width 767px)
		justify-content center
		margin-bottom 25px
	.btn
		padding-left 14px
	#edit-chevron
		position absolute
		top 17px
		right -4px
		font-size 30px
	
	

.meta-data
	display flex
	flex-flow row wrap
	justify-content flex-start
	margin-top 2em
	div
		flex 1
		margin-right 2em
	.opponent
		max-width 300px
		min-width 250px
	.opponent-score
		max-width 120px
		min-width 120px
		

input.form-control.stats-input
	margin 0 auto
	width 50px	
	height 0
	background-color whitesmoke
	font-size 14px
	box-sizing initial

.form-group
	.new-stats
		vertical-align middle
		min-width 96px

.stats-table
	tr.no-hover:hover
	tr.form-group:hover
		td
			background-color white !important
			border 1px solid #CACACA !important		
				

</style>