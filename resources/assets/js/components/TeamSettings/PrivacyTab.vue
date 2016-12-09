<template>
	<div class="settings-wrapper">
		<div class="settings-container">

			<div class="settings-entry">
				<span class="description">Who can view the team's location?</span>
				<div class="switch">
					<input type="checkbox" bootstrap-switch="PrivacyTab-location">
				</div>
			</div>

			<div class="settings-entry">
				<span class="description">Who can view the roster?</span>
				<div class="switch">
					<input type="checkbox" bootstrap-switch="PrivacyTab-roster">
				</div>
			</div>

			<div class="settings-entry">
				<span class="description">Who can view team events?</span>
				<div class="switch">
					<input type="checkbox" bootstrap-switch="PrivacyTab-events">
				</div>
			</div>

			<div class="settings-entry">
				<span class="description">How can people join?</span>
				<div class="switch">
					<input type="checkbox" bootstrap-switch="PrivacyTab-join">
				</div>
			</div>

			<div class="settings-entry">
				<span class="description">How can people become a fan?</span>
				<div class="switch">
					<input type="checkbox" bootstrap-switch="PrivacyTab-fan">
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
		  $('input[bootstrap-switch="PrivacyTab-location"]').bootstrapSwitch(options);

		  options.state = this.team.settings.onlyMembersCanViewRoster;
		  options.onText = 'MEMBERS & FANS';
		  options.offText = 'ANYONE';
		  $('input[bootstrap-switch="PrivacyTab-roster"]').bootstrapSwitch(options);

		  options.state = this.team.settings.onlyMembersCanViewEvents;
		  options.onText = 'MEMBERS & FANS';
		  options.offText = 'ANYONE';
		  $('input[bootstrap-switch="PrivacyTab-events"]').bootstrapSwitch(options);

		  options.state = this.team.settings.membersAreInviteOnly;
		  options.onText = 'INVITE ONLY';
		  options.offText = 'ASK OR INVITE';
		  $('input[bootstrap-switch="PrivacyTab-join"]').bootstrapSwitch(options);

		  options.state = this.team.settings.fansRequireAcceptance;
		  options.onText = 'ASK OR INVITE';
		  options.offText = "JUST CLICK ‘FAN’";
		  $('input[bootstrap-switch="PrivacyTab-fan"]').bootstrapSwitch(options);
		},

		/**
		 * One of the bootstrap switches were changed
		 * Attribute is taken from the html element, where it says bootstrap-switch="PrivacyTab-***"
		 */
		switchChanged(attribute, state)
		{
			if (attribute.includes('location')) {
				this.team.settings.onlyMembersCanViewLocation = state;
			}

			if (attribute.includes('roster')) {
				this.team.settings.onlyMembersCanViewRoster = state;
			}

			if (attribute.includes('events')) {
				this.team.settings.onlyMembersCanViewEvents = state;
			}

			if (attribute.includes('join')) {
				this.team.settings.membersAreInviteOnly = state;
			}

			if (attribute.includes('fan')) {
				this.team.settings.fansRequireAcceptance = state;
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
			

</style>