<template>
	
	<div class="Alert__container" v-show="show">
		<div :class="alertClasses">

			<i class="material-icons alert-icon pull-left" v-show="type === 'good'">done</i>
			<i class="material-icons alert-icon pull-left" v-show="type === 'bad'">error</i>
			<i class="material-icons alert-icon pull-left" v-show="type === 'info'">info_outline</i>

			<!-- show X for 'info' and 'bad' (they last longer and are dismissable) -->
			<span @click="show = false" class="close" v-show="type !== 'good'">&times;</span>
			<span>
				{{ msg }}
			</span>

		</div>
	</div>
		

</template>


<script>

export default  {
	
	name: 'Alert',

	props: ['show'],

	data() {
		return {
			alerts: [],
			alertCounter: 0,
			type: 'info',
			msg: 'You better check yoself',
		}
	},

	events:
	{
		// event from App to show an alert
		displayAlert(type, msg)
		{
			// add an alert
			this.alertCounter++;
			this.msg = msg;
			this.type = type;

			// choose a timeout length
			if(this.type !== 'good')
				var timeout = 8000;
			else
				var timeout = 3000;

			var self = this;
			// set an async timer
			setTimeout(function() {
				// when the timer is up, remove this alert
				self.alertCounter--;
				if(!self.alertCounter)
					// if there's no alerts remaining, hide
					self.show = false;
			}, timeout);
			
		},
	},

	computed: {
		// returns an array of classes for the alert
		// info and error last longer and have a close option
		alertClasses() {
			return {
				'alert': true,
				'alert-dismissable': this.type !== 'good',
				'alert-success': this.type === 'good',
				'alert-danger': this.type === 'bad',
				'alert-info': this.type === 'info',
			}
		},

	},

};

</script>


<!-- Alert styling -->
<style lang="stylus">

@import '/resources/assets/stylus/variables.styl'

.Alert__container
	position fixed
	width 100%
	top 90px
	display flex
	flex-flow row
	justify-content flex-end
	align-items center
	z-index 5000
	@media screen and (max-width 767px)
		justify-content center
.alert 
	opacity 0.9
	border none
	box-shadow none
	text-shadow none
	margin-right 30px
	@media screen and (max-width 767px)
		margin-right 0
	&.alert-success
		background-color rc_alert_success
		color darken(rc_alert_success, 70%)
		background-image none
	&.alert-info
		background-color rc_alert_info
		color darken(rc_alert_info, 70%)
		background-image none
	&.alert-danger
		background-color rc_alert_danger
		color darken(rc_alert_danger, 55%)
		background-image none	

	.alert-icon
		margin-right 15px
		font-size 22px
	.close
		color black	




</style>


