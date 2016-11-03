<template>
	<div class="edit-stats-wrapper">

		<!-- confirmation screen for deleting existing stats -->
		<div v-if="confirmDelete" class="EditStats__confirm">
			<div class="confirm-header">
				<h4>Delete these stats?</h4>
			</div>
			<div class="save-button-group">
		    <div>
		    	<a class="btn btn-delete" v-touch:tap="confirm(true)">
		    		<span v-show="! loading_delete">DELETE</span>
						<spinner v-show="loading_delete" color="white"></spinner>
		    	</a>
		    </div>
		    <div>
		    	<a class="btn btn-cancel" v-touch:tap="confirm(false)">CANCEL</a>
		    </div>
		  </div>
		</div>

		<div v-else>
			<div class="edit-stats-header">

				<!-- notes to user -->
				<div class="stat-notes">
					<div class="blue-container">
						<span><strong>Notes about stat entries:</strong></span>
						<ul>
							<li>
								Any fields left empty are treated as zeros.
							</li>
							<li v-show="usesMinutes">
								If MIN is zero, that player's stats are treated as a DNP (did not play) and don't count as zeros.
							</li>
							<li v-show="! usesMinutes">
								If DNP (did not play) is checked, that player's stats are ignored and don't count as zeros.
							</li>
						</ul>
					</div>
				</div>

				<!-- if user clicks this, show form to edit event details, value travels up to ViewEvent.vue -->
				<div class="edit-button">
					<a class="btn btn-primary --chevron --lg --right" v-touch:tap="editingPastEvent = true">
						Edit Event Details
						<i class="material-icons btn-chevron --right">chevron_right</i>
					</a>
				</div>

			</div>

			<!-- input new stats here -->
			<h3>Box Score</h3>
			<form v-if="ready" @submit.prevent>
				<div class="table-responsive stats-container">
					<table class="table stats-table">
						<thead>
				    	<tr>
				      	<th v-for="key in keys" class="stat-columns"
				      			data-toggle="tooltip" :title="resolveTooltip(key)">
				      		{{ resolveKeyName(key) }}
				      	</th>
				    	</tr>
				  	</thead>
				  	<tbody>
				    	<tr v-for="(index, stat) in stats">
					      <td v-for="key in keys" class="new-stats stat-entries">

					      	<!-- show 'Did Not Play' checkbox if necessary -->
					      	<template v-if="! usesMinutes && key === 'dnp'">
					      		<input type="checkbox" v-model="stat[key]">
					      	</template>
					      	
					      	<template v-else>
					      		<!-- show 'Starter' checkbox if necessary -->
					      		<template v-if="key === 'gs'">
					      			<input type="checkbox" v-model="stat[key]">
					      		</template>

					      		<!-- otherwise show normal stat input box -->
					      		<template v-else>
					      			<span v-if="keyIsCalculated(key)" class="stats-input">{{ resolveValue(key, stat) }}</span>
							      	<input v-else type="text" class="form-control stats-input" :class="{'form-error' : errors[index][key]}"
							      				number autocomplete="off" :placeholder="resolveKeyName(key)" v-model="stat[key]">
					      		</template>
					      		
					      	</template>
					      </td>
				    	</tr>
				  	</tbody>
					</table>
				</div>

				<h3>Opponent Details</h3>
				<div class="table-responsive stats-container">
					<table class="table stats-table">
						<thead>
				    	<tr>
				      	<th class="stat-columns">OPPONENT</th>
				      	<th class="stat-columns">SCORE</th>
				    	</tr>
				  	</thead>
				  	<tbody>
				    	<tr>
					      <td class="new-stats stat-entries">
					      	<input type="text" class="form-control stats-input opponent" :class="{'form-error' : meta.errors.opp}"
						      				autocomplete="off" placeholder="Georgia Tech" v-model="meta.opp">
					      </td>
					      <td class="new-stats stat-entries">
					      	<input type="text" class="form-control stats-input" :class="{'form-error' : meta.errors.oppScore}"
						      				number autocomplete="off" :placeholder="oppScore" v-model="meta.oppScore">
					      </td>
				    	</tr>
				  	</tbody>
					</table>
				</div>

				<div class="EditStats__footer">
					<div v-if="correctErrors" class="errors">
						<span>Correct errors highlighted in red before saving</span>
					</div>
					<div class="save-button-group --three">
						<div>
							<a class="btn btn-primary" v-touch:tap="save()">
								<span v-show="! loading_save">SAVE</span>
								<spinner v-show="loading_save" color="white"></spinner>
							</a>
						</div>
						<div v-show="someSavedStats">
							<a class="btn btn-delete" v-touch:tap="destroy()">
								<span v-show="! loading_delete">DELETE</span>
								<spinner v-show="loading_delete" color="white"></spinner>
							</a>
						</div>
						<div>
							<a class="btn btn-cancel" v-touch:tap="cancel()">CANCEL</a>
						</div>
					</div>
				</div>
				
			</form>


			<!-- for calculating sport related variables, these don't display anything -->

			<basketball v-if="team.sport === 'basketball'" :keys.sync="keys" :compile="compile" :errors.sync="errors"
	  							:key-names.sync="keyNames" :tooltips.sync="tooltips" :value-lookup.sync="valueLookup" 
	  							:val-class-lookup.sync="valClassLookup" :calculated-keys.sync="calculatedKeys" 
	  							:default-values.sync="defaultValues" :sport-specific-error-check.sync="sportSpecificErrorCheck">
			</basketball>

		</div>
	</div>
</template>

<script>

import StatHelpers from '../mixins/StatHelpers.js'
import Basketball from './stats/EditBasketball.vue'
//import { PulseLoader } from 'vue-spinner/dist/vue-spinner.min';

export default  {
	
	name: 'EditStats',

	props: ['players', 'event', 'team', 'eventStats', 'editingPastEvent'],

	mixins: [ StatHelpers ],

	components:
	{
		Basketball,
	},

	data()
	{
		return {
			stats: [],
			compile: false,
			ready: false,
			someSavedStats: false,
			meta: {
				opp: '',
				oppScore: '',
				errors: {
					opp: '',
					oppScore: '',
				},
			},
			keys: [],
			keyNames: {},
			tooltips: {},
			valueLookup: {},
			calculatedKeys: [], 
			valClassLookup: {},
			keyClassLookup: {},
			defaultValues: {},
			errors: [],
			correctErrors: false,
			sportSpecificErrorCheck: '',
			confirmDelete: false,
			loading_save: false,
			loading_delete: false,
		}
	},

	ready()
	{
		this.setup();
	},

	watch:
	{
		/**
		 * If the stats for this event have changed, reinitialize page
		 */
		eventStats()
		{
			this.setup();
		},

		/**
		 * If the event being viewed has changed, reinitialize page
		 */
		event()
		{
			this.setup();
		},
	},

	computed:
	{
		/**
		 * Calculate a realistic placeholder opponent score depending on the sport
		 */
		oppScore()
		{
			if (this.team.sport === 'basketball') {
				return '72';
			}
		},

		usesMinutes()
		{
			return this.keys.indexOf('min') !== -1;
		},
	},

	events:
	{
		/**
		 * Variables have been setup from child sport component
		 * Ready to display the stat table on the modal
		 */
		EditStats_compiled()
		{
			// reorder players array to be in descending order by lastname
			this.players = this.players.sort((a, b) => a.lastname.localeCompare(b.lastname));

			this.populateStats();

			this.populateOppStats();

			this.compile = false;
			this.ready = true;

			// attach the tooltips after a long timeout to ensure DOM is loaded
			setTimeout(() => {
				this.attachTooltips();
			}, 250);
		},

		/**
		 * The stats have been successfully saved to the database
		 */
		EditStats_save(response)
		{
			this.$dispatch('ViewEvent_cancel');
			this.$dispatch('Team_updated_stats', response.data.stats);
			this.$root.banner('good', 'Stats saved');
			this.reset();
		},

		/**
		 * The stats have been successfully deleted from the database
		 */
		EditStats_delete(response)
		{
			this.$dispatch('ViewEvent_cancel');
			this.$dispatch('Team_updated_stats', response.data.stats);

			this.$root.banner('good', 'Stats deleted');
			this.reset();
		},
	},

	methods:
	{
		/**
		 * Prepare the variables before showing the table
		 */
		setup()
		{
			this.stats = [];
			this.ready = false;
			this.someSavedStats = false;

			this.keys = this.team.settings.statKeys;

			// this acts as a flag to tell sport-specific child to prepare variables
			this.compile = true;
		},


		/**
		 * Submit the stats to the database
		 */
		save()
		{
			if (this.errorCheck() > 0) {
				this.correctErrors = true;
				return;
			}

			this.loading_save = true;

			if (this.someSavedStats) {
				return this.update();
			}

			let data = {
				event_id: this.event.id,
				stats: this.stats,
				meta: {
					opp: this.meta.opp,
					oppScore: this.meta.oppScore,
				},
			}

			let url = `${this.$parent.prefix}/stats`;
			this.$root.post(url, 'EditStats_save', data);
		},


		update()
		{
			let data = {
				event_id: this.event.id,
				stats: this.stats,
				meta: {
					opp: this.meta.opp,
					oppScore: this.meta.oppScore,
				},
			}

			let url = `${this.$parent.prefix}/stats/${this.event.id}`;
			this.$root.put(url, 'EditStats_save', data);
		},


		/**
		 * Delete any saved stats for this event
		 */
		destroy()
		{
			this.confirmDelete = true;
		},


		/**
		 * User has confirmed or denied their wish to delete these stats
		 */
		confirm(confirm)
		{
			if (confirm) {
				let url = `${this.$parent.prefix}/stats/${this.event.id}`;
				this.loading_delete = true;
				this.$root.delete(url, 'EditStats_delete');
			}
			else {
				this.confirmDelete = false;
			}
		},


		/**
		 * Delete everything that was inputted and close the modal window
		 */
		cancel()
		{
			this.$dispatch('ViewEvent_cancel');

			this.reset();
		},


		/**
		 * Reset the stats table to initial conditions
		 */
		reset()
		{
			this.ready = false;
			this.someSavedStats = false;
			this.loading_save = false;
			this.loading_delete = false;
			this.confirmDelete = false;
			this.meta = {
				opp: '',
				oppScore: '',
				errors: {
					opp: '',
					oppScore: '',
				}
			};
		},


		/**
		 * Initialize the stat table with previously saved stats or defaults
		 */
		populateStats()
		{
			// does ANYONE have saved stats for this event?
			this.someSavedStats = false;
			let stats = [{}];

			this.players.forEach((player, index) => {
				this.errors[index] = {};

				stats[index] = {
					lastname: player.lastname,
					name: player.abbrName,
					id: player.id,
					usingDefaults: true,
					member_id: player.member_id,
				};

				let existingStats = this.eventStats.filter((stat) => stat.member_id == player.member_id);

				if (existingStats.length) {
					stats[index].usingDefaults = false;
					this.someSavedStats = true;
					existingStats = JSON.parse(existingStats[0].stats);
				}
				
				// add the value at each key
				this.keys.forEach(key => {
					this.errors[index][key] = '';
					if (stats[index].usingDefaults) {
						// no saved stats, fallback to default values
						stats[index][key] = this.defaultValues[key];
					}
					else {
						// used previously saved stats
						stats[index][key] = existingStats[key];
					}
				});

				// make sure their name stays correct
				stats[index].name = player.abbrName
			});

			if (this.someSavedStats) {
				// at least some of the players have previously saved stats
				stats.forEach((stat, index) => {
					if (stat.usingDefaults) {
						// if players didn't have anything saved at this point, mark them as DNP
						stats[index].dnp = true;
					}
				});
			}

			// don't want this key in there permanently
			stats.forEach((stat, index) => {
				delete stats[index].usingDefaults;
			});
	

			// save non-reactive copy
			this.$set('stats', JSON.parse(JSON.stringify(stats)));
		},


		/**
		 * Populate the opponent's section with data saved in any of the stats' meta data
		 */
		populateOppStats()
		{
			if (this.someSavedStats) {
				let meta = JSON.parse(this.eventStats[0].meta);
				this.meta.opp = meta.opp;
				this.meta.oppScore = meta.oppScore;
			}
		},


		/**
		 * Make sure that there aren't any errors in the form before submitting
		 */
		errorCheck()
		{
			let errors = 0;

			errors += this.generalErrorCheck();

			errors += this.sportSpecificErrorCheck.call(this, this.stats);

			return errors;
		},


		/**
		 * Check the fields that are common across all sports
		 */
		generalErrorCheck()
		{
			let errors = 0;

			if (! this.meta.opp.length) {
				this.meta.errors.opp = true
				errors++;
			}
			else {
				this.meta.errors.opp = false
			}

			if (typeof this.meta.oppScore === 'number') {
				if (this.meta.oppScore < 0) {
					this.meta.errors.oppScore = true
					errors++;
				}
				else {
					this.meta.errors.oppScore = false
				}
			}
			else {
				this.meta.errors.oppScore = true
				errors++;
			}
			

			return errors;
		},


		/**
		 * Fetch the human-readable form of the stat key
		 *
		 * @param {string} key
		 * @return {string}
		 */
		resolveKeyName(key)
		{
			return this.keyNames[key].call(this, key);
		},


		/**
		 * Fetch the value of a calculated entry in the table
		 *
		 * @param {string} key 
		 * @param {object} stats
		 * @return {string}
		 */
		resolveValue(key, stats)
		{
			return this.valueLookup[key].call(this, key, stats);
		},


		/**
		 * Figure out whether or not this key should have an <input> or a <span> element
		 *
		 * @param {string} key
		 * @return {boolean} 
		 */
		keyIsCalculated(key)
		{
			return this.calculatedKeys.indexOf(key) !== -1;
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
		 * Figures out whether or not the stats include a given key
		 *
		 * @param {string} key
		 * @return {boolean}
		 */
		usingKey(key)
		{
			return this.keys.indexOf(key) !== -1;
		},
	},

};

</script>


<style lang="stylus">

@import '/resources/assets/stylus/variables.styl'

.edit-stats-wrapper
	padding 1em
	h3
		margin-top 2em
	.buttons
		display flex
		flex-flow row
		justify-content center
		margin-top 20px
		padding-top 30px
		border-top 2px solid whitesmoke
		.btn
			min-width 150px
			margin 0px 10px
	.errors
		display flex
		flex-flow row
		justify-content center
		color red
		
.edit-stats-header
	display flex
	flex-flow row
	margin-bottom 20px
	@media screen and (max-width 1000px)
		flex-flow row wrap
		justify-content center
		
	
	
.stat-notes
	flex 2
	@media screen and (max-width 1000px)
		flex-basis 100%
		text-align center
		order 2
	.blue-container
		background-color lighten(rc_blue, 75%)
		padding 15px
		display inline-block
		ul
			list-style none
			padding-left 0
			margin 20px 0 0 0
			li
				margin-bottom 10px
			li:last-child
				margin-bottom 0
				
		span
			color black
	
	
.edit-button
	flex 1
	align-self flex-start
	position relative
	display flex
	flex-flow row
	margin 0
	justify-content flex-end
	@media screen and (max-width 1000px)
		justify-content center
		flex-basis 100%
		order 1
		margin-bottom 25px
	
	

input.stats-input
	margin 0 auto
	width 42px	
	height 0
	padding 12px 0px
	background-color whitesmoke
	font-size 14px
	box-sizing initial
	text-align center
	vertical-align middle !important
	&.opponent
		width 150px
		
.EditStats__confirm
	display flex
	flex-flow row wrap
	justify-content center
	align-items center
	.confirm-header
		flex-basis 100%
		display flex
		justify-content center
		
.EditStats__footer
	display flex
	justify-content center
		

</style>