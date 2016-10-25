<template>
	
	<div class="Alert__container" v-show="show">
		<div class="alert alert-dismissable" :class="alertClasses">

			<i class="material-icons" v-show="type === 'good'">done</i>
			<i class="material-icons" v-show="type === 'bad'">error</i>
			<i class="material-icons" v-show="type === 'info'">info_outline</i>

			<span v-touch:tap="routeToLink()" :class="[ link.length ? 'alert-link' : '' ]">{{ msg }}</span>
			
			<span v-touch:tap="close()" class="close">&times;</span>

		</div>
	</div>
		

</template>


<script>

export default  {
	
	name: 'Alert',

	props: ['show'],

	data() {
		return {
			alertCounter: 0,
			type: '',
			link: '',
			msg: '',
		}
	},

	events:
	{
		/**
		 * Display an alert with the given type and message
		 *
		 * Event is dispatched from App.vue after a $root.banner() call
		 *
		 * @param {string} type  	The type of the alert. e.g. 'good', 'bad', 'info'
		 * @param {string} msg 		The message to display
		 * @param {string} link 	A link to route to if the user clicks the alert
		 */
		Alert_display(type, msg, link)
		{
			// add an alert
			this.alertCounter++;

			this.msg = msg;
			this.type = type;
			this.link = link;

			let timeout = 3000;

			// choose a timeout length
			if (this.type !== 'good') {
				timeout = 8000;
			}

			let self = this;
			// set an async timer
			setTimeout(function() {
				// when the timer is up, remove this alert
				self.alertCounter--;
				if (! self.alertCounter) {
					// if there are no alerts remaining, hide
					self.show = false;
					self.link = '';
				}
			}, timeout);
			
		},
	},

	computed: 
	{
		/**
		 * Returns an array of classes depending on the type of alert
		 * @return {array} 
		 */
		alertClasses()
		{
			return {
				'alert-success': this.type === 'good',
				'alert-danger': this.type === 'bad',
				'alert-info': this.type === 'info',
			}
		},
	},

	methods:
	{
		/**
		 * User clicked on alert, link them if necessary
		 */
		routeToLink()
		{
			if (this.link.length) {
				this.$router.go(this.link);
			}

			this.show = false;
			this.link = '';
		},


		/**
		 * Hide the alert
		 */
		close()
		{
			this.show = false;
			this.alertCounter = 0;
			this.link = '';
		}
	},

};

</script>


<!-- Alert styling -->
<style lang="stylus">

@import '/resources/assets/stylus/variables.styl'

.Alert__container
	position fixed
	top 90px
	right 10px
	display inline-block
	z-index 5000
div.alert 
	border none
	box-shadow none
	text-shadow none
	float right
	position relative
	padding-left 45px
	padding-right 39px
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
			
	.alert-link
		font-weight 400
		color inherit
		&:hover
				cursor pointer

	.material-icons
		position absolute
		top 13px
		left 9px
		font-size 22px
	.close
		color black
		position absolute
		font-size 22px
		top 14px
		right 9px




</style>


