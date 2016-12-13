<template>
	<div class="settings-wrapper">
		<div class="settings-container">

			<div class="settings-entry">
				<span class="description">Notify members about new events?</span>
				<div class="switch">
					<input type="checkbox" bootstrap-switch="NotifTab-newEvent">
				</div>
			</div>

			<div class="settings-entry">
				<span class="description">Notify members when an event is updated?</span>
				<div class="switch">
					<input type="checkbox" bootstrap-switch="NotifTab-editedEvent">
				</div>
			</div>

			<div class="settings-entry">
				<span class="description">Notify members when an event is deleted?</span>
				<div class="switch">
					<input type="checkbox" bootstrap-switch="NotifTab-deletedEvent">
				</div>
			</div>

			<div class="settings-entry">
				<span class="description">Notify members when new stats are posted?</span>
				<div class="switch">
					<input type="checkbox" bootstrap-switch="NotifTab-stats">
				</div>
			</div>

			<div class="settings-entry">
				<span class="description">Notify members when someone joins the team?</span>
				<div class="switch">
					<input type="checkbox" bootstrap-switch="NotifTab-newMember">
				</div>
			</div>


		</div>
	</div>
</template>

<script>

export default  {
	
	name: 'NotificationTab',

	props: ['team'],

	data()
	{
		return {
			switches: {
				newEvent: undefined,
				editedEvent: undefined,
				deletedEvent: undefined,
				stats: undefined,
				newMember: undefined,
			}
		}
	},

	events:
	{
		TeamSettings_discard_changes(team)
		{
			this.resetValues(team.settings);
		},
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
				onSwitchChange: function(e, state) {
					self.switchChanged(this.getAttribute('bootstrap-switch'), state);
				},
			};

			options.state = this.team.settings.notifyOnNewEvent;
		  this.switches.newEvent = $('input[bootstrap-switch="NotifTab-newEvent"]').bootstrapSwitch(options);

		  options.state = this.team.settings.notifyOnEditedEvent;
		  this.switches.editedEvent = $('input[bootstrap-switch="NotifTab-editedEvent"]').bootstrapSwitch(options);

		  options.state = this.team.settings.notifyOnDeletedEvent;
		  this.switches.deletedEvent = $('input[bootstrap-switch="NotifTab-deletedEvent"]').bootstrapSwitch(options);

		  options.state = this.team.settings.notifyOnNewStats;
		  this.switches.stats = $('input[bootstrap-switch="NotifTab-stats"]').bootstrapSwitch(options);

		  options.state = this.team.settings.notifyOnNewMember;
		  this.switches.newMember = $('input[bootstrap-switch="NotifTab-newMember"]').bootstrapSwitch(options);
		},

		/**
		 * One of the bootstrap switches were changed
		 * Attribute is taken from the html element, where it says bootstrap-switch="NotifTab-***"
		 */
		switchChanged(attribute, state)
		{
			if (attribute.includes('newEvent')) {
				this.team.settings.notifyOnNewEvent = state;
			}
			if (attribute.includes('editedEvent')) {
				this.team.settings.notifyOnEditedEvent = state;
			}
			if (attribute.includes('deletedEvent')) {
				this.team.settings.notifyOnDeletedEvent = state;
			}
			if (attribute.includes('stats')) {
				this.team.settings.notifyOnNewStats = state;
			}
			if (attribute.includes('newMember')) {
				this.team.settings.notifyOnNewMember = state;
			}
		},

		resetValues(settings)
		{
			$(this.switches.newEvent.selector).bootstrapSwitch('state', settings.notifyOnNewEvent);
			$(this.switches.editedEvent.selector).bootstrapSwitch('state', settings.notifyOnEditedEvent);
			$(this.switches.deletedEvent.selector).bootstrapSwitch('state', settings.notifyOnDeletedEvent);
			$(this.switches.stats.selector).bootstrapSwitch('state', settings.notifyOnNewStats);
			$(this.switches.newMember.selector).bootstrapSwitch('state', settings.notifyOnNewMember);
		}
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