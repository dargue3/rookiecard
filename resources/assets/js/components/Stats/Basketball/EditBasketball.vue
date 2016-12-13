<template>
	<div></div>
</template>

<script>

import AbstractEditStat from '../../../mixins/AbstractEditStat.js'

export default {

	name: 'EditBasketball',

	mixins: [ AbstractEditStat ],

	props: ['compile', 'keys', 'keyNames', 'tooltips', 'valueLookup', 'keyClassLookup', 'valClassLookup',
					'calculatedKeys', 'defaultValues', 'errors', 'sportSpecificErrorCheck'],

	data()
	{
		return {
			ignore: ['date', 'win', 'opp', 'gp', 'efg_', 'ts_', 'astto', 'eff', 'dd2', 'td3'], // keys to not show in the table
			calculated: ['name', 'fg_', 'ft_', 'threep_'], // keys that are calculated behind the scenes
		}
	},

	methods:
	{
		/**
		 * How should the stat entries be error checked?
		 * Fills out an errors array of objects with true/false
		 *
		 * @return {int} Number of detected errors
		 */
		errorCheck()
		{
			return function(stats) {
				let errors = 0;
				let tempErrors = [];

				// loop through each of the players' stats
				stats.forEach((stat, index) => {

					tempErrors[index] = {};

					// set all the errors to false to start out
					for (let key in this.errors[index]) {
						tempErrors[index][key] = false
					}

					// check that the makes are always <= attempts
					if (this.usingKey('fgm') && this.usingKey('fga') && stat.fgm > stat.fga) {
						tempErrors[index].fgm = true;
						tempErrors[index].fga = true;
						errors++;
					}
					if (this.usingKey('ftm') && this.usingKey('fta') && stat.ftm > stat.fta) {
						tempErrors[index].ftm = true;
						tempErrors[index].fta = true;
						errors++;
					}
					if (this.usingKey('threepm') && this.usingKey('threepa') && stat.threepm > stat.threepa) {
						tempErrors[index].threepm = true;
						tempErrors[index].threepa = true;
						errors++;
					}
				});

				// assign parent's errors variable to this calculated temporary one
				this.errors = tempErrors;

				return errors;
			}
		},


		/**
		 * Return a closeure telling EditStats.vue what classes to add to each stat entry
		 *
		 * @param {string} key
		 * @return {closure}
		 */
		lookupValClasses(key)
		{
			return function(key) {
				return [];
			}
		},

		/**
		 * Return a closure telling EditStats.vue what to insert in the cell for this key
		 * instead of an input
		 *
		 * @param {string} key
		 * @return {closure}
		 */
		lookupValue(key)
		{
			if (key === 'name') {
				return function(key, stats) {
					return stats.name;
				}
			}
			if (key.includes('_', -1)) { // find the percentages, e.g. 'fg_'
				return function(key, stats) {
					let prefix = key.slice(0, -1); // turn the key into 'fg'
					let makes = stats[prefix + 'm']; // 'fgm'
					let attempts = stats[prefix + 'a']; // 'fga'
					return this.checkPercentage(this.percentage(makes, attempts));
				}
			}

			else {
				return function(key, stats) {
					return '';
				}
			}
		},

		/**
		 * Return a closure telling EditStats.vue how to calculate the title of each stat header
		 * Used for building helpful toolips for each key
		 *
		 * @param {string} key
		 * @return {closure}
		 */
		lookupTooltips(key) {
			switch (key) {
				case 'min':
					return function() { return 'Minutes Played'; };
				case 'gs':
					return function() { return 'Was a Starter'; };
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
				default:
					return function() { return '';	 };
			}
		},


		/**
		 * Return a closure that tells EditStats.vue what to show as the header for each stat key
		 *
		 * @param {string} key
		 * @return {closure} 
		 */
		lookupKeyNames(key)
		{
			return function(key) {

				if (key === 'gs') {
					return 'STARTER';
				}
				// everywhere with a _ becomes a %
				key = key.replace(/_/g , '%');

				// everywhere there's a 'three' becomes a '3'
				key = key.replace(/three/g, '3');

				// and also return all capitalized
				return key.toUpperCase();
			}
		},

		/**
		 * Return the default value for each key in order to initialize the players' stat objects
		 *
		 * @param {string} key
		 * @return {closure}
		 */
		lookupDefaultValues(key)
		{
			if (key === 'dnp' || key === 'gs') {
				return false;
			}

			return null;
		},
	},
}	
</script>
