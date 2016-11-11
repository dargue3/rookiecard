<template>
<div class="stat-selection-wrapper">

	<div class="stat-selector">
		<label>Scorekeeper will input</label>
		<select data-style="btn-select btn-lg" StatSelection="userStats" class="selectpicker form-control show-tick"
						 data-selected-text-format="count" multiple required 
						 data-size="false" v-model="userSelected">
	    <option v-for="stat in userStatsList" :value="userStatKeys[$index]" 
	    				:disabled="stat.disabled">{{ stat.val }}</option>      
		</select>
		<p v-for="stat in userStatsList">{{ userStatsList[stat] }}</p> 
	</div>

	<div class="stat-selector">
		<label>Rookiecard will calculate</label>
		<select data-style="btn-select btn-lg" StatSelection="rcStats" class="selectpicker form-control show-tick"
						 data-selected-text-format="count" multiple required 
						 data-size="false" v-model="rcSelected">
	    <option v-for="stat in rcStatsList" :value="rcStatKeys[$index]" 
	    				:disabled="stat.disabled">{{ stat.val }}</option>       
		</select>
	</div>
	
</div>
</template>
<script>
	
export default {

	'name': 'StatSelection',

	'props': ['sport', 'fetchStats', 'userSelected', 'rcSelected'],

	data() {
		return {
			// optional stats inputted by user
			userStatsList: {},

			// stats calculated by rookiecard
			rcStatsList: {},

			// array of the keys of the objects
			userStatKeys: [],
			rcStatKeys: [],
		}
	},

	created()
	{
		this.init(this.sport);
	},

	watch:
	{
		sport(sport)
		{
			this.init(sport);
		},
	},

	methods:
	{
		/**
		 * Fetch stat key data for this sport from server
		 */
		init(sport)
		{
			var url =  this.$parent.prefix + '/stats/' + sport;
			this.$root.get(url, 'StatSelection_get');
		},


		/**
		 * Based on the array of user selections, calculate which stat keys may be shown
		 * If a stat is disabled, it displays its prerequisite stat keys
		 */
		setDependencies()
		{
			var stats = this.rcStatsList;

			// loop through all the keys, check their dependencies and enable/disable
			var count = 0;
			for (var key in stats) {		
				var disabled = false;
				var text = '';
				for(var x = 0; x < stats[key].req.length; x++) {
					// check that the required stats are already checked
					var req = stats[key].req[x];
					if (this.userSelected.indexOf(req) === -1 && this.rcSelected.indexOf(req) === -1) {
						// they don't have all the requirements needed for this statistic, disable the option
						disabled = true;
						text = stats[key].subtext;

						// uncheck on the picker if it's selected already
						var index = this.userSelected.indexOf(key);
						if (index !== -1) {
							this.userSelected.splice(index, 1);
						}
						var index = this.rcSelected.indexOf(key);
						if (index !== -1) {
							this.rcSelected.splice(index, 1);
						}
					}
				}
				// is this stat option currently disabled?
				stats[key].disabled = disabled;
				// add option subtext to explain disabled stat's requirements
				$('[StatSelection="rcStats"] > option:eq(' + count + ')').data('subtext', text);
				count++;
			}

			this.$set('rcStatsList', stats);

			setTimeout(function() {
				this.$emit('StatSelection_renderPickers');
			}.bind(this), 50)
			
		},
	},

	events:
	{
		/**
		 * Send request to server to fetch information about a given sport's stats
		 */
		StatSelection_init(sport)
		{
			this.init(sport);
		},


		/**
		 * Request back from the server with stat details
		 */
		StatSelection_get(response)
		{
			let data = JSON.parse(response.data.stats);

			this.userStatsList = data.user;
			this.rcStatsList = data.rc;
			this.userSelected = data.userSelected;
			this.rcSelected = data.rcSelected;
			this.userStatKeys = Object.keys(data.user);
			this.rcStatKeys = Object.keys(data.rc)

			// initialize the selectpickers once the dependencies have loaded fully
			setTimeout(() => {
				this.$emit('StatSelection_initPickers');
			}, 50)
		},



		/**
		 * Inititialze the selectpickers in the stats section
		 */
		StatSelection_initPickers()
		{
			var userPicker = $('[StatSelection="userStats"]');
			var rcPicker = $('[StatSelection="rcStats"]');

			userPicker.selectpicker().selectpicker('val', this.userSelected).selectpicker('refresh');
			rcPicker.selectpicker().selectpicker('val', this.rcSelected).selectpicker('refresh');


			// set up listeners to refresh the stat key dependencies when the user changed their selection
			userPicker.on('changed.bs.select', function(e, clickedIndex, newValue, oldValue) {
				setTimeout(() => { this.setDependencies(); }, 50);
			}.bind(this))

			rcPicker.on('changed.bs.select', function(e, clickedIndex, newValue, oldValue) {
				setTimeout(() => { this.setDependencies(); }, 50);
			}.bind(this))

			this.setDependencies();
		},


		/**
		 * The stats selected have been changed, re-render the pickers
		 */
		StatSelection_renderPickers()
		{
			var userPicker = $('[StatSelection="userStats"]');
			var rcPicker = $('[StatSelection="rcStats"]');

			userPicker.selectpicker('val', this.userSelected).selectpicker('refresh');
			rcPicker.selectpicker('val', this.rcSelected).selectpicker('refresh');
		},
	}
}

</script>

<style lang="stylus">
@import '/resources/assets/stylus/variables.styl'

.stat-selection-wrapper
	display flex
	flex-flow row nowrap
	+mobile()
		flex-flow row wrap
	.stat-selector
		flex 1
		+mobile()
			flex-basis 100%


</style>















