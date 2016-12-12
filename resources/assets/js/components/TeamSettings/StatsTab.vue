<template>
	<div class="settings-wrapper">

		<stats v-if="showStatTable" type="playerSeason" :stat-keys="newStatKeys" :sport="team.sport"
						:raw-stats="stats" :players="player" :centered="false" :disable-sorting="true">

						<div class="outcome">
							<span class="away loss -no-border">Demo</span>
						</div>

		</stats>

		<stat-selection v-if="team.sport" :sport="team.sport" :user-selected.sync="userSelected" :sample-stats.sync="stats"
										:rc-selected.sync="rcSelected" :existing="team.settings.statKeys">
		</stat-selection>

	</div>
</template>

<script>

import StatSelection 	from '../StatSelection.vue'
import Stats 	from '../Stats.vue'

export default  {
	
	name: 'StatsTab',

	props: ['team', 'newStatKeys'],

	components: { StatSelection, Stats },

	data()
	{
		return {
			rcSelected: [],
			userSelected: [],
			showStatTable: false,
			stats: [],
			player: [{ 'abbrName': 'Ghost', 'member_id': 0, 'user_id': 0 }],
		}
	},


	events:
	{
		/**
		 * The keys being calculated in StatSelection are finished
		 */
		TeamSettings_keys_set(keys)
		{
			this.newStatKeys = keys;
			this.showStatTable = true;
			this.$broadcast('Stats_recompile');
		},

		/**
		 * Set all the settings back to original
		 */
		TeamSettings_discard_changes(team)
		{
			this.$broadcast('StatSelection_initPickers');
		},
	},
};

</script>

<style lang="stylus">
	
@import '/resources/assets/stylus/variables.styl'

.settings-wrapper
	.stat-selector
		+the-last-one()
			margin-left 10px
			+mobile()
				margin-left 0
				margin-top 15px
	.stat-selector-wrapper
		margin-top 25px
	.stats-overflow
		margin-top 0	

</style>