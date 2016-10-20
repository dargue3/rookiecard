<template>
	<div class="edit-stats-wrapper">

		
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

			<h3>Opponent</h3>
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


			<div v-if="correctErrors" class="errors">
				<span>Correct errors highlighted in red before saving</span>
			</div>
			<div class="buttons">
				<a class="btn btn-primary" v-touch:tap="save()">SAVE</a>
				<a class="btn btn-delete" v-touch:tap="destroy()">DELETE</a>
				<a class="btn btn-cancel" v-touch:tap="cancel()">CANCEL</a>
			</div>
		</form>


		<!-- for calculating sport related variables, doesn't display anything -->

		<basketball v-if="team.sport === 'basketball'" :keys.sync="keys" :compile="compile" :errors.sync="errors"
  							:key-names.sync="keyNames" :tooltips.sync="tooltips" :value-lookup.sync="valueLookup" 
  							:val-class-lookup.sync="valClassLookup" :calculated-keys.sync="calculatedKeys" 
  							:default-values.sync="defaultValues" :sport-specific-error-check.sync="sportSpecificErrorCheck">
		</basketball>
		

	</div>
</template>

<script>

import StatHelpers from '../mixins/StatHelpers.js'

import Basketball from './stats/EditBasketball.vue'


export default  {
	
	name: 'EditStats',

	props: ['eventStats', 'players', 'event', 'team', 'editingPastEvent', 'keys'],

	mixins: [ StatHelpers ],

	components:
	{
		Basketball
	},

	data()
	{
		return {
			stats: [],
			compile: false,
			ready: false,
			meta: {
				opp: '',
				oppScore: '',
				teamScore: '',
				errors: {
					opp: '',
					oppScore: '',
				},
			},
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

		}
	},

	ready()
	{
		this.setup();
	},

	watch:
	{
		// if stats change, reinitialize the page
		eventStats()
		{
			this.setup();
		},

		// if the viewed event changes, reinitialize the page
		event()
		{
			this.setup();
		},
	},

	computed:
	{
		playerStats()
		{
			return this.eventStats.filter(stats => stats.type === 'player');
		},

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
		 */
		EditStats_compiled()
		{
			// reorder players array to be in descending order by lastname
			this.players = this.players.sort((a, b) => a.lastname.localeCompare(b.lastname));

			// initialize variables for each player
			this.players.forEach((player, index) => {
				this.errors[index] = {};
				let defaults = {
					lastname: player.lastname,
					name: player.abbrName,
					id: player.id,
					member_id: player.member_id,
				};

				// add variables for each key
				this.keys.forEach(key => {
					this.errors[index][key] = '';
					if (key !== 'name') {
						defaults[key] = this.defaultValues[key];
					}
				})

				this.stats.$set(index, JSON.parse(JSON.stringify(defaults)));
			})

			this.compile = false;
			this.ready = true;

			setTimeout(() => {
				this.attachTooltips();
			}, 250);
		},

		EditStats_save(response)
		{
			alert('saved')
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

		destroy()
		{

		},


		cancel()
		{

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
	padding 1.5em
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
				

</style>