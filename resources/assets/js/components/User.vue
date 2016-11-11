<template>
	<div>
	
		<div class="user-wrapper">
			<div class="filler">
				<span>
					{{ $route.params.name | uppercase }}'S ROOKIECARD HERE
				</span>
			</div>
		</div>

	</div>
</template>

<script>

export default  {
	
	name: 'User',

	props: [],

	data()
	{
		return {

		}
	},

	created()
	{

	},

	computed:
	{
		
	}, //end computed props

	methods:
	{
		
	}, //end methods
	
	ready()
	{

	},
};

</script>

<style lang="stylus">
	
@import '/resources/assets/stylus/variables.styl'

.user-wrapper
	display flex
	justify-content center
	align-items center
	height 100%
	width 100%
	margin-top 70px
	.filler
		display flex
		justify-content center
		align-items center
		text-align center
		border 3px dashed rc_red
		height 650px
		width 500px
		font-size 40px
		color link_blue
	

</style>