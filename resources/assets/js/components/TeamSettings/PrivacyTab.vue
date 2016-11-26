<template>
	<div class="settings-wrapper">
		<div class="settings-container">

			<div class="settings-entry">
				<span class="description">Who can view the team's location?</span>
				<div class="switch">
					<input type="checkbox" bootstrap-switch="TeamSettings-location">
				</div>
			</div>

			<div class="settings-entry">
				<span class="description">Who can view the roster?</span>
				<div class="switch">
					<input type="checkbox" bootstrap-switch="TeamSettings-roster">
				</div>
			</div>

			<div class="settings-entry">
				<span class="description">Who can view team events?</span>
				<div class="switch">
					<input type="checkbox" bootstrap-switch="TeamSettings-events">
				</div>
			</div>

			<div class="settings-entry">
				<span class="description">How can people join?</span>
				<div class="switch">
					<input type="checkbox" bootstrap-switch="TeamSettings-join">
				</div>
			</div>

			<div class="settings-entry">
				<span class="description">How can people become a fan?</span>
				<div class="switch">
					<input type="checkbox" bootstrap-switch="TeamSettings-fan">
				</div>
			</div>


		</div>
	</div>
</template>

<script>

export default  {
	
	name: 'PrivacyTab',

	props: ['team'],

	data()
	{
		return {

		}
	},

	methods:
	{
		/**
		 * Initialize the bootstrap switches on the page to their saved settings
		 */
		init_switches()
		{
			let self = this;
			let options = {
				state: false,
				onText: 'YES',
				offText: 'NO',
				handleWidth: '115px',
				onSwitchChange: function(e, state) {
					self.switchChanged(this.getAttribute('bootstrap-switch'), state);
				},
			};

			options.state = this.team.settings.onlyMembersCanViewLocation;
			options.onText = 'MEMBERS & FANS';
			options.offText = 'ANYONE';
		  $('input[bootstrap-switch="TeamSettings-location"]').bootstrapSwitch(options);

		  options.state = this.team.settings.onlyMembersCanViewRoster;
		  options.onText = 'MEMBERS & FANS';
		  options.offText = 'ANYONE';
		  $('input[bootstrap-switch="TeamSettings-roster"]').bootstrapSwitch(options);

		  options.state = this.team.settings.onlyMembersCanViewEvents;
		  options.onText = 'MEMBERS & FANS';
		  options.offText = 'ANYONE';
		  $('input[bootstrap-switch="TeamSettings-events"]').bootstrapSwitch(options);

		  options.state = this.team.settings.membersAreInviteOnly;
		  options.onText = 'INVITE ONLY';
		  options.offText = 'ASK OR INVITE';
		  $('input[bootstrap-switch="TeamSettings-join"]').bootstrapSwitch(options);

		  options.state = this.team.settings.fansAreInviteOnly;
		  options.onText = 'INVITE ONLY';
		  options.offText = "JUST CLICK ‘FAN’";
		  $('input[bootstrap-switch="TeamSettings-fan"]').bootstrapSwitch(options);
		},

		/**
		 * One of the bootstrap switches were changed
		 * Attribute is taken from the html element, where it says bootstrap-switch="TeamSettings-***"
		 */
		switchChanged(attribute, state)
		{
			if (attribute.includes('location')) {
				this.team.settings.showLocation = state;
			}

			if (attribute.includes('roster')) {
				this.team.settings.showRoster = state;
			}
		},
	},
	
	ready()
	{
		this.init_switches();
	},
};

</script>

<style lang="stylus">
	
@import '/resources/assets/stylus/variables.styl'
	
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