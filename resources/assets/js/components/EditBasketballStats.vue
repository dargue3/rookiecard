
<template>
	
	<div id="statsWrapper">

		<!-- if user clicks this, show form to edit event details, value travels up to ViewEvent.vue -->
		<div class="edit-button">
			<a class="btn btn-primary" @click="editEvent = true">
				Edit Event Details
				<i id="edit-chevron" class="material-icons">chevron_right</i>
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
		<form @submit.prevent="submitStats()">
			<div class='table-responsive stats-container'>
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
				      		<input v-show="!usesMinutes" v-if="col === 'dnp'" type="checkbox" v-model="newStats[index][col]">
				      		<span v-if="col === 'fg_'">{{ newStats_percent(index, 'fg') | checkPercentage }}</span>
				      		<span v-if="col === 'ft_'">{{ newStats_percent(index, 'ft') | checkPercentage }}</span>
				      		<span v-if="col === 'threep_'">{{ newStats_percent(index, 'threep') | checkPercentage }}</span>
				      	</span>
				      	<input v-if="!specialRow(col)" type="text" class="form-control stats-input text-center" 
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
			<div class='table-responsive stats-container'>
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


export default  {
	
	name: 'EditBasketballStats',

	props: ['stats', 'players', 'event', 'team', 'editEvent',
					'playerCols', 'teamCols'],


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


	computed: {
		
		usesMinutes() {
			if(this.newStatCols) {
				if(this.newStatCols.indexOf('min') !== -1) return true;
				else return false;
			}
			else
				return true;
		},

		newPlayerCols() {
			var index;
			var newCols = []
			this.playerCols.forEach(function(col) {
				newCols.push(col);
			});


			index = newCols.indexOf('date');
			if(index !== -1)
				newCols.splice(index, 1);

			index = newCols.indexOf('win');
			if(index !== -1)
				newCols.splice(index, 1);

			index = newCols.indexOf('opp');
			if(index !== -1)
				newCols.splice(index, 1);

			index = newCols.indexOf('gs');
			if(index !== -1)
				newCols.splice(index, 1);

			index = newCols.indexOf('gp');
			if(index !== -1)
				newCols.splice(index, 1);

			index = newCols.indexOf('efg_');
			if(index !== -1)
				newCols.splice(index, 1);

			index = newCols.indexOf('ast-to');
			if(index !== -1)
				newCols.splice(index, 1);

			index = newCols.indexOf('ts_');
			if(index !== -1)
				newCols.splice(index, 1);

			index = newCols.indexOf('per');
			if(index !== -1)
				newCols.splice(index, 1);

			index = newCols.indexOf('eff');
			if(index !== -1)
				newCols.splice(index, 1);

			index = newCols.indexOf('dd2');
			if(index !== -1)
				newCols.splice(index, 1);

			index = newCols.indexOf('td3');
			if(index !== -1)
				newCols.splice(index, 1);

			return newCols;

		},

		newTeamCols() {
			var index;
			var newCols = [];

			this.newPlayerCols.forEach(function(val) {
				newCols.push(val);
			});

			index = newCols.indexOf('name');
			if(index !== -1)
				newCols.splice(index, 1);

			return newCols;
		}

		

	},

	watch: {

		//wait for an event to be clicked, initialize
		stats() {
			this.initialize();
		},

		event() {
			this.initialize();
		},
	},

	methods: {

		initialize() {
			var players = this.players;
			var existingStats = this.stats;
			var newStats = [];
			var IDs = [];

			this.meta.opp = '';
			this.meta.oppScore = '';
			this.meta.teamScore = '';


			//first initialize newStats with any existing data
			for(var x = 0; x < existingStats.length; x++) {
				var curr = existingStats[x];

				
				//catch the team stats for this event
				if(curr.type === 1) {
					//initialize meta data
					var meta = JSON.parse(curr.meta);
					this.meta.opp = meta.opp;
					this.meta.oppScore = meta.oppScore;
					continue;
				}

				if(IDs.indexOf(curr.owner_id) !== -1)
					//this player's stats already parsed (error somewhere down the road)
					continue;

				var stats = JSON.parse(curr.stats);

				stats['id'] = curr.owner_id;
				
				newStats.push(stats);	
				IDs.push(curr.owner_id);
			}




			for(var x = 0; x < players.length; x++) {
				var curr = players[x];
				var emptyStats = {};

				if(IDs.indexOf(curr.id) !== -1)
					//this player's stats already parsed, don't create empty row
					continue;

				var name = curr.firstname[0] + '. ' + curr.lastname;
				this.newPlayerCols.forEach(function(col) {
					emptyStats[col] = '';
				});
				emptyStats.id = curr.id;
				emptyStats.name = name;
				emptyStats.starter = false;
				emptyStats.dnp = false;

				newStats.push(emptyStats);
			}

			this.newStats = newStats;
		},

		specialRow(col) {
			if(col === 'name' || col === 'starter' || col === 'dnp')
				return true;
			if(col[col.length - 1] === '_')
				return true;

			return false;
		},

		//submit to database
		submitStats() {
			var errorFree = this.errorCheck();

			if(errorFree) {

				//did these stats exist and were then updated?
				var updated = this.stats.length ? true : false;

				//store how many points team had (for status update meta data)
				this.meta.teamScore = this.teamStats.pts;
				this.meta.team = this.team.name;

				var data = {
					playerStats: this.newStats,
					teamStats: this.teamStats,
					event: this.event,
					team: this.team,
					meta: this.meta,
				};

				if(!updated) {
					var url = this.$parent.prefix + '/stats'; 
					this.$http.post(url, data)

					.then(function(response) {
						this.ajaxSuccess(response, updated)
					}.bind(this))

					.catch(this.ajaxError());
				}
				else {
					var url = this.$parent.prefix + '/stats/updateStats'; 
					this.$http.put(url, data)

					.then(function(response) {
						this.ajaxSuccess(response, updated)
					}.bind(this))

					.catch(this.ajaxError());
				}
			}
		},

		//throw away inputted data
		discardStats() {
			this.initialize();
			$('#viewEventModal').modal('hide');
		},


		deleteStats() {
			var name = this.$route.params.name;
			var prefix = this.$parent.prefix;
			var url = prefix + name + '/stats/' + this.event.id; 

			this.$http.delete(url)

			.then(function(response) {
				$('#viewEventModal').modal('hide');
				this.$dispatch('deleteStats', this.event);
				this.$root.banner('good', "Stats have been deleted from this event");

				this.stats = {};
				this.initialize();

			}.bind(this))

			.catch(function(response) {
				this.$root.banner('bad', "There was a server issue... try again?")
			}.bind(this));
		},


		//if successful, save new data to state, show success banner
		ajaxSuccess(response, updated) {
			
			$('#viewEventModal').modal('hide');

			if(!updated) {

				var msg = "Your stats have been added to this event";
				//send a stats updated event to parent
				this.$dispatch('newStats', response.data.stats, response.data.feed);
			
			}
			else {

				var msg = "Your stats have been updated for this event";
				
				//send a new stats event to parent
				if(response.data.length)
					this.$dispatch('updateStats', response.data, this.event);
			}

			this.$root.banner("good", msg);

			this.stats = {};

			this.initialize();
		},



		//if unsuccessful, show error message
		ajaxError(response) {
			this.$root.banner('bad', "There was a server problem submitting your stats...try again?");
		},



		//calculates and saves the total for that field
		//accepts everything except the percentage cols
		team_total(col) {
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

		//calculates and saves percentages for team
		//accepts fg, ft, threep for cols
		//e.g. col == 'fg', var p = 'fg_'
		team_percent(col) {
			var stats = this.newStats;
			var m = col + 'm';
			var a = col + 'a';
			var p = col + '_';
			var makes = 0;
			var attempts = 0;
			var percent = 0;
			for(var x = 0; x < stats.length; x++) {
				//first check if makes > attempts, return percent > 100
				//the 'percentage' filter turns this into 'ERROR'
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

			//make into percentage with one decimal place accuracy
			percent = Math.round((percent * 100) * 10) / 10;
			if(isNaN(percent))
				percent = 0;

			this.teamStats[p] = percent;
			return percent;
		},

		//calculates and saves percentages for this player
		//accepts fg, ft, threep for cols
		//e.g. col == 'fg', var p = 'fg_'
		newStats_percent(index, col) {
			var percentage = 0;

			//dynamically picks which stat based on col
			var m = col + 'm';
			var a = col + 'a';
			var p = col + '_';

			if(this.newStats[index][m] === '' || this.newStats[index][a] === '')
					percentage = 0;
			else
				percentage = this.newStats[index][m] / this.newStats[index][a];

			//make into percentage with one decimal place accuracy
			percentage = Math.round((percentage * 100) * 10) / 10;

			if(isNaN(percentage))
				percentage = 0;

			this.newStats[index][p] = percentage;
			return percentage;
		},

		errorCheck() {
			var stats = this.newStats;
			for(var x = 0; x < stats.length; x++) {
				if(stats[x].fg_ > 100) {
					this.errorMessage('FG');
					return false;
				}
				if(stats[x].threep_ > 100) {
					this.errorMessage('3P');
					return false;
				}
				if(stats[x].ft_ > 100) {
					this.errorMessage('FT');
					return false;
				}
			}

			if(!Number.isInteger(this.meta.oppScore)) {
				this.$root.popup('bad', 'Error in Stats!', 'Check that the Opponent\'s score is a number.');
				return false
			}

			return true;
		},

		//displays a customized error message depending on which stat category was incorrect
		errorMessage(col) {

			this.$root.popup("bad", "Error in stats!", "One of the " + col + "M entries is greater than " + col + "A, please correct first. Look for the row with ERROR in " + col + "%");
		},
	},


};

</script>


<style lang="stylus">

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