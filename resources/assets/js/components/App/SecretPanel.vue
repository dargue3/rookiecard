<template>
	<div class="SecretPanel__wrapper">
		<div v-if="authorized === true" class="SecretPanel -container">

			<div class="title">
				<h2 class="no-margin">Top Secret Control Panel</h2>
				<div class="subtext">
					<span>Home of Rookiecard's Black Ops</span>
				</div>
			</div>

			<div class="tester top-separator">
				<div class="email">
					<label>New Alpha Tester</label>
					<input type="text" class="form-control" v-model="newTester" placeholder="dbargue@gmail.com">
				</div>
				<div class="add-tester">
					<a class="btn btn-primary -input-height -no-margin" v-touch:tap="addTester()">
						<span v-show="! loading_save">ADD</span>
						<spinner v-show="loading_save" color="white"></spinner>
					</a>
				</div>
			</div>
			
			<div v-if="feedback.length" class="feedback top-separator">
				<div class="top">
					<div class="clear-done">
						<a v-touch:tap="clearDone()">
							<i class="material-icons">delete_sweep</i>
						</a>
					</div>
				</div>

				<div v-for="entry in feedback | orderBy 'done'" class="entry" transition>
					<div class="type" :class="entry.type">{{ entry.type | capitalize }}</div>
					<div class="details">{{ entry.details}}</div>
					<div class="status" :class="{ 'done' : entry.done }" v-touch:tap="toggleCompletion(entry)"></div>
				</div>
			</div>
			<div v-else class="top-separator">
				<h3 class="all-done">No unread feedback</h3>
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
			feedback: [],
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
			this.loading_save = false;
		},

		SecretPanel_authorized(response)
		{
			if (response.data.authorized) {
				this.authorized = true;
				this.fetchFeedback();
				document.title = 'TOP SECRET';
			}
			else {
				this.authorized = false;
			}
		},

		SecretPanel_unauthorized(response)
		{
			this.authorized = false;
		},

		SecretPanel_feedback(response)
		{
			this.feedback = response.data.feedback;
		},
	},

	methods:
	{
		/**
		 * Tell the server to add another alpha tester's email to the database
		 */
		addTester()
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

		/**
		 * Only Rookiecard devs are allowed to see this page
		 */
		fetchFeedback()
		{
			this.$root.get(`${this.$root.prefix}/admin/feedback`, 'SecretPanel_feedback');
		},

		/**
		 * Mark this feedback item as being 'done'
		 */
		toggleCompletion(entry)
		{
			entry.done = ! entry.done;
			this.$root.post(`${this.$root.prefix}/admin/feedback/${entry.id}`);
		},


		/**
		 * Delete all the completed items in the feedback list
		 */
		clearDone()
		{
			this.$root.post(`${this.$root.prefix}/admin/feedback/wipe`, 'SecretPanel_feedback');
		},
	},
};

</script>

<style lang="stylus" scoped>
@import '/resources/assets/stylus/variables.styl'

.SecretPanel__wrapper
	margin-top 75px
	padding 1.5em
	+mobile()
		padding 0.75em

.SecretPanel
	display flex
	flex-flow column
	max-width 650px
	margin 0 auto
	
.title
	text-align center
	.subtext
		color rc_med_gray
		font-size 15px
		margin-top 15px

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
	.add-tester
		width 150px
		margin-left 10px
		+mobile()
			width 100%
			margin-left 0
			
.top
	display flex
	flex-flow row nowrap
	justify-content flex-end
	align-items center
	margin-bottom 15px
	.clear-done i
		font-size 30px
			
.feedback
	display flex
	flex-flow column
	.entry
		flex 1
		display flex
		flex-flow row nowrap
		align-items center
		padding 20px 0
		border-top 1px dashed rc_lite_gray
		.type
			display flex
			flex-flow row
			justify-content center
			align-items center
			margin-right 25px
			width 100px
			min-width 100px
			height 30px
			border-radius 4px
			color white
			text-align center
			+mobile()
				font-size 12px
				width 80px
				min-width 80px
				height 25px
			&.bug
				background rc_red
			&.compliment
				background rc_bright_green
			&.suggestion
				background rc_blue
			&.question
				background rc_loss
		.details
			font-size 13px
			max-width 420px
			margin-right 15px
		.status
			margin-left auto
			border-radius 50%
			width 30px
			min-width 30px
			height 30px
			border 1px solid rc_med_gray
			&.done
				background rc_yellow
				border-color darken(rc_yellow, 10%)
			&:hover
				cursor pointer
</style>