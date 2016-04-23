<template>
	
	
		<div :class="alertClasses">

				<i class="material-icons alert-icon pull-left" v-show="type === 'good'">done</i>
				<i class="material-icons alert-icon pull-left" v-show="type === 'bad'">error</i>
				<i class="material-icons alert-icon pull-left" v-show="type === 'info'">info_outline</i>

				<!-- show X for 'info' and 'bad' (they last longer and are dismissable) -->
				<span @click="$root.hideAlert(type)" class="close" v-show="type !== 'good'">&times;</span>
				<span>
					<slot></slot>
				</span>
		</div>

</template>


<script>

export default  {
	
	name: 'Alert',

	props: ['type', 'show'],

	watch: {
		//only confusing part about this component.
		//if two alerts in quick succession, second replaces the first
		//set timeouts on removing each one, alert is hidden when 
		//show == 0
		show(val) {
			//if any alerts left
			if(val > 0) {
				//choose a timeout length
				if(this.type != 'good')
					var timeout = 8000;
				else
					var timeout = 4000;

				//display event, then remove one instance (don't allow neg.)
				setTimeout(function() {
					if(this.show > 0) 
						this.show -= 1;
				}.bind(this), timeout)

			}
		},
	},

	computed: {
		//returns an array of classes for the alert
		//info and error last longer and have a close option
		alertClasses() {
			return {
				'alert': true,
				'alert-dismissable': this.type != 'good',
				'alert-success': this.type == 'good',
				'alert-danger': this.type == 'bad',
				'alert-info': this.type == 'info',
			}
		},

	},

	methods: {

	},

};

</script>


<!-- Alert styling -->
<style lang="stylus">
	
.alert 
	position fixed
	top 88px
	right 36px
	opacity 0.9
	z-index 9000
	vertical-align middle
	border none
	box-shadow none
	text-shadow none
	&.alert-success
		background-color lighten(#90C07F, 50%)
		color darken(#90C07F, 50%)
		background-image none

	.alert-icon
		margin-right 15px
		font-size 22px
	.close
		color black	




</style>


