<template>
	<div class="settings-wrapper">
	
		<div class="danger-zone-wrapper">
			<h3>Delete Team?</h3>
			<a v-show="! confirming_delete" class="btn btn-delete" v-touch:tap="deleteTeam()">
				<span>DELETE</span>
			</a>

			<div v-show="confirming_delete" class="save-button-group --two">
				<div>
					<a class="btn btn-delete click-me" v-touch:tap="deleteTeam(true)">
						<span v-show="! loading_delete">ARE YOU SURE?</span>
						<spinner v-show="loading_delete" color="white"></spinner>
					</a>
				</div>
				<div>
					<a class="btn btn-cancel" v-touch:tap="confirming_delete = false">CANCEL</a>
				</div>
			</div>

			<span class="input-info">Any of the team's stats (including those on players' profiles) will be deleted as well!</span>

		</div>

	</div>
</template>

<script>

export default  {
	
	name: 'DangerZoneTab',

	props: [],

	data()
	{
		return {
			loading_delete: false,
			confirming_delete: false,
		}
	},

	events:
	{
		DangerZoneTab_deleted(response)
		{
			this.$root.banner('good', 'Team deleted');

			this.$dispatch('App_team_deleted', response.data.team);

			this.$router.go('/');
		},
	},

	methods:
	{
		/**
		 * Delete this team and everything associated with it
		 */
		deleteTeam(confirmed = false)
		{
			if (confirmed) {
				this.loading_delete = true;
				this.$root.delete(`${this.$parent.prefix}/delete`, 'DangerZoneTab_deleted');
				return;
			}

			this.confirming_delete = true;
		},
	},
};

</script>

<style lang="stylus">
@import '/resources/assets/stylus/variables.styl'

.danger-zone-wrapper
	width 100%
	height 100%
	display flex
	flex-flow column wrap
	justify-content center
	align-items center
	.save-button-group
		margin 0
	.btn
		margin 0
		min-width 150px
	h3
		margin-top 0px
		margin-bottom 15px
	.input-info
		margin-top 20px
		text-align center

</style>