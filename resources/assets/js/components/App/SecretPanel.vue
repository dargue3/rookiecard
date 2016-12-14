<template>
	<div class="SecretPanel__wrapper">
		<div v-if="authorized === true" class="SecretPanel -container">

			<div class="header">Top Secret Panel</div>

			<div class="tester">
				<div class="email">
					<label>New Alpha Tester</label>
					<input type="text" class="form-control" v-model="newTester">
				</div>
				<div class="submit">
					<a class="btn btn-primary -input-height -no-margin" v-touch:tap="submit()">
						<span v-show="! loading_save">SUBMIT</span>
						<spinner v-show="loading_save" color="white"></spinner>
					</a>
				</div>
			</div>
		</div>
		<div v-if="authorized === false" class="SecretPanel -container">
			<div class="header">Nothing suspicious here!</div>
		</div>
	</div>
</template>

<script>

export default  {
	
	name: 'SecretPanel',

	props: [],

	data()
	{
		return {
			newTester: '',
			loading_save: false,
			authorized: undefined,
		}
	},

	created()
	{
		this.authorize();
	},

	events:
	{
		SecretPanel_tester(response)
		{
			this.$root.banner('good', 'Added new tester');
			this.newTester = '';
		},

		SecretPanel_authorized(response)
		{
			if (response.data.authorized) {
				this.authorized = true;
			}
			else {
				this.authorized = false;
			}
		},

		SecretPanel_unauthorized(response)
		{
			this.authorized = false;
		},
	},

	methods:
	{
		submit()
		{
			this.loading_save = true;
			this.$root.post(`${this.$root.prefix}/admin/tester`, 'SecretPanel_tester', { email: this.newTester });
		},

		/**
		 * Only Rookiecard devs are allowed to see this page
		 */
		authorize()
		{
			this.$root.get(`${this.$root.prefix}/admin/authorize`, 'SecretPanel_authorized', {}, 'SecretPanel_unauthorized');
		},
	},
};

</script>

<style lang="stylus" scoped>
@import '/resources/assets/stylus/variables.styl'

.SecretPanel__wrapper
	padding 1.5em

.SecretPanel
	display flex
	flex-flow column
	max-width 650px
	margin 0 auto
	
.header
	font-size 25px
	font-weight bold
	text-align center
	margin-bottom 30px

.tester
	display flex
	flex-flow row
	justify-content space-between
	align-items flex-end
	+mobile()
		flex-flow column
		align-items center
	.email
		+mobile()
			width 100%
			margin-bottom 15px
	.submit
		width 150px
		margin-left 10px
		+mobile()
			width 100%
</style>