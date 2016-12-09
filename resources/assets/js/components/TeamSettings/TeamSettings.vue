
<template>
	<div>

		<div class="Settings__header">
		
			<div class="left">
				<div class="save">
					<span v-show="correct_errors" class="form-error">Correct errors first</span>
					<a v-if="! saved" class="btn btn-primary" :class="{ 'click-me' : ! saved }" v-touch:tap="save()">
	    			<span v-show="! loading_save">SAVE</span>
	    			<spinner v-show="loading_save" color="white"></spinner>
	    		</a>
	    		<a v-else class="btn btn-cancel">SAVED</a>
				</div>

				<div class="header">
					<h2>Settings</h2>
				</div>
			</div>
				
			<div v-show="! saved" class="right">
				<div class="discard">
					<span v-touch:tap="cancel()">Discard Changes</span>
				</div>
			</div>
			
		</div>

		

		<div class="Settings">

			<div class="settings-nav">
				<ul>
					<li :class="{ '--active' : tab === 'info' }" v-touch:tap="tab = 'info'">Info</li>
					<li :class="{ '--active' : tab === 'stats' }" v-touch:tap="tab = 'stats'">Stats</li>
					<li :class="{ '--active' : tab === 'privacy' }" v-touch:tap="tab = 'privacy'">Privacy</li>
					<li :class="{ '--active' : tab === 'notifications' }" v-touch:tap="tab = 'notifications'">Notifications</li>
					<li :class="{ '--active' : tab === 'danger-zone' }" v-touch:tap="tab = 'danger-zone'" class="danger-zone">Danger Zone</li>
				</ul>
			</div>
			

			<info-tab v-show="tab === 'info'" :focused="focused" :team.sync="team" :backup="backup"
								:pic.sync="pic" :backdrop.sync="backdrop" :error-checker="errorChecker"></info-tab>


			<stats-tab v-show="tab === 'stats'" :team.sync="team" :new-stat-keys.sync="statKeys"></stats-tab>


			<privacy-tab v-show="tab === 'privacy'" :team.sync="team"></privacy-tab>


			<notification-tab v-show="tab === 'notifications'" :team.sync="team"></notification-tab>


			<danger-zone-tab v-show="tab === 'danger-zone'"></danger-zone-tab>
			

		</div>
	</div>
</template>

<script>

import InfoTab from './InfoTab.vue'
import StatsTab from './StatsTab.vue'
import PrivacyTab from './PrivacyTab.vue'
import NotificationTab from './NotificationTab.vue'
import DangerZoneTab from './DangerZoneTab.vue'

export default  {
	
	name: 'TeamSettings',

	props: ['team', 'saved', 'focused'],

	components:
	{
		StatsTab,
		InfoTab,
		PrivacyTab,
		NotificationTab,
		DangerZoneTab,
	},

	data()
	{
		return {
			prefix: this.$parent.prefix,
			tab: 'info',
			backup: {},
			errorChecker: function(errors) { this.errorsFromInfoTab(errors); }.bind(this),
			pic: undefined,
			backdrop: undefined,
			statKeys: undefined,
			loading_save: false,
			correct_errors: false,
		}
	},

	events:
	{
		/**
		 * Request back from the server after saving
		 */
		TeamSettings_saved(response)
		{
			this.$dispatch('Team_updated_team', response.data.team);
			this.$broadcast('TeamSettings_saved');
			this.$root.banner('good', 'Settings saved');
			setTimeout(() => { this.saved = true; this.loading_save = false; }, 150);
		},
	},

	methods:
	{
		/**
		 * Save any changes to the server
		 */
		save(errorChecked = false)
		{
			if (! errorChecked) {
				// send event asking InfoTab to error check
				// it will respond by calling this.errorsFromInfoTab()
				this.$broadcast('TeamSettings_checkErrors');
				return;
			}

			let data = {
				name: this.team.name,
				teamURL: this.team.teamname,
				homefield: this.team.homefield,
				slogan: this.team.slogan,
				city: this.team.city,
				lat: this.team.lat,
				long: this.team.long,
				timezone: this.team.timezone,
				pic: this.team.tempPic,
				backdrop: this.team.tempBackdrop,
				statKeys: this.statKeys,
				onlyMembersCanViewLocation: this.team.settings.onlyMembersCanViewLocation,
				onlyMembersCanViewRoster: this.team.settings.onlyMembersCanViewRoster,
				onlyMembersCanViewEvents: this.team.settings.onlyMembersCanViewEvents,
				membersAreInviteOnly: this.team.settings.membersAreInviteOnly,
				fansRequireAcceptance: this.team.settings.fansRequireAcceptance,
				notifyOnNewEvent: this.team.settings.notifyOnNewEvent,
				notifyOnEditedEvent: this.team.settings.notifyOnEditedEvent,
				notifyOnDeletedEvent: this.team.settings.notifyOnDeletedEvent,
				notifyOnNewStats: this.team.settings.notifyOnNewStats,
				notifyOnNewMember: this.team.settings.notifyOnNewMember,
			}

			this.loading_save = true;
			this.$root.post(`${this.$parent.prefix}/settings`, 'TeamSettings_saved', data);
		},


		/**
		 * Discard all the changes they made
		 */
		cancel()
		{
			this.saved = true;
		},


		/**
		 * The number of errors being reported from InfoTab
		 */
		errorsFromInfoTab(errors)
		{
			if (errors > 0) {
				this.correct_errors = true;
			}
			else {
				this.correct_errors = false;
				this.save(true);
			}
		},
	},


	watch:
	{
		/**
		 * Watch all of the keys in the team object for changes
		 * Once this.saved is falsey, the save button will be enabled
		 */
		'team' : { handler : function() { this.saved = false }, deep: true },

		statKeys(newVal, oldVal)
		{
			if (typeof oldVal !== 'undefined') {
				this.saved = false;
			}
		},
	},


	ready()
	{
		// create backup of original team data
	  this.$set('backup', JSON.parse(JSON.stringify(this.team)));
	},
};

</script>

<style lang="stylus">
@import '/resources/assets/stylus/variables.styl'

.Settings
	display flex
	flex-flow row
	justify-content center
	max-width 775px
	margin 0 auto
	
.Settings__header
	display flex
	flex-flow row nowrap
	margin 0 auto
	margin-top 25px
	margin-bottom 10px
	justify-content space-between
	max-width 775px
	.left
		display flex
		flex-flow row nowrap
		align-items center
		.save
			width 183px
			.btn
				margin 0
				width 100%
				&.btn-cancel:hover
					background rc_med_gray
					cursor default
		.header
			margin-left 21px
			display flex
			align-items center
			h2
				margin 0
		.form-error
			font-size 16px
	.right
		display flex
		flex-flow row nowrap
		align-items flex-end
		.discard
			color rc_med_gray
			font-size 15px
			float right
			&:hover
				color rc_dark_gray
				cursor pointer
		
.settings-nav
	width 185px
	font-size 20px
	color link_blue
	ul
		list-style none
		padding 0
		margin 0
		li
			padding 1em
			background whitesmoke
			border-left 2px solid rc_super_lite_gray
			transition border-left 150ms ease
			&.--active
				background white
				color black
				&:hover
					cursor default
					border-left 2px solid rc_super_lite_gray
					color black
			&.danger-zone
				color rc_red
				transition all 150ms ease
				border-left-color rgba(201, 0, 25, 0.1)
				&:hover
					color rc_red_hover
					border-left 4px solid rgba(201, 0, 25, 0.4)
					transition all 150ms ease
				&.--active
					border-left 2px solid rc_super_lite_gray
					color black
			&:hover
				cursor pointer
				border-left 4px solid rc_lite_gray
				transition all 150ms ease
				color link_blue_hover

.settings-wrapper
	display flex
	flex-flow row wrap
	width 590px
	background white
	padding 1.5em
	border-radius 3px
	.form-group
		flex-basis 100%
		display flex
		margin-bottom 20px
		div
			flex 1
			&:not(:first-child)
				margin-left 10px
				
.settings-container
	display flex
	flex-flow row wrap
	align-content flex-start
	width 100%
	.settings-entry
		display flex
		flex-flow row nowrap
		justify-content space-between
		align-items center
		width 100%
		border-bottom 1px solid rc_super_lite_gray
		padding 17px 0
		max-height 65px
		+the-first-one()
			margin-top 0
			padding-top 0
		+the-last-one()
			border-bottom 0
			padding-bottom 0
		.switch
			display flex
			flex-flow row nowrap
			align-items center
			justify-content flex-end
		.description
			font-size 17px
			
	
	
	

			
					
	
</style>