<template>
	<div class="SecretPanel__wrapper">
		<div v-if="authorized === true && dataReady" class="SecretPanel -container" transition="fade-slow">

			<div class="title bottom-separator marginT10 text-center">
				<h2 class="margin0 marginB10">Secret Control Panel</h2>
				<div class="header-subtext">
					<span>Home of Rookiecard's Black Ops</span>
				</div>
			</div>

			<div class="stats bottom-separator">
				<div class="entry">
					<div class="value"><span>{{ $root.numForHumans(counts.users) }}</span></div>
					<div class="attr"><span class="hug-bottom">USERS</span></div>
				</div>

				<div class="entry">
					<div class="value"><span>{{ $root.numForHumans(counts.teams) }}</span></div>
					<div class="attr"><span class="hug-bottom">TEAMS</span></div>
				</div>

				<div class="entry">
					<div class="value"><span>{{ $root.numForHumans(counts.events) }}</span></div>
					<div class="attr"><span class="hug-bottom">EVENTS</span></div>
				</div>

				<div class="entry">
					<div class="value"><span>{{ $root.numForHumans(counts.stats) }}</span></div>
					<div class="attr"><span class="hug-bottom">STATS</span></div>
				</div>
			</div>

			<div class="tester">
				<div class="email">
					<input type="text" class="form-control" placeholder="dbargue@gmail.com" v-model="newTester">
				</div>
				<div class="add-tester">
					<a class="btn btn-primary -input-height margin0" 
						:class="{ 'click-me' : newTester }" v-touch:tap="addTester()">
						<span v-show="! loading_save">ADD TO ALPHA</span>
						<spinner v-show="loading_save" color="white"></spinner>
					</a>
				</div>
			</div>
			
			<div v-if="feedback.length" class="feedback top-separator">
				<div class="top">
					<div class="attr">FEEDBACK <span class="gray-dash">— </span><span class="value">{{ feedback.length }}</span></div>
					<div class="wipe">
						<a v-touch:tap="wipe()">
							<i class="material-icons">delete_sweep</i>
						</a>
					</div>
				</div>

				<div v-for="entry in feedback | orderBy 'done'" class="entry" transition>
					<div class="type" :class="entry.type">{{ entry.type | capitalize }}</div>
					<div class="details">{{ entry.details}}</div>
					<div class="status" :class="{ 'done' : entry.done }" v-touch:tap="complete(entry)"></div>
				</div>
			</div>
			<div v-else class="top-separator">
				<h3 class="all-done">No unread feedback</h3>
			</div>

		</div>
		<div v-if="authorized === false" class="SecretPanel -container unauthorized">
			<h3>Nothing suspicious here!</h3>
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
			dataReady: false,
			authorized: undefined,
			feedback: [],
			counts: {
				users: '',
				teams: '',
				events: '',
				stats: '',
			}
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
				this.fetch();
				document.title = 'Secret Panel';
			}
			else {
				this.authorized = false;
			}
		},

		SecretPanel_unauthorized(response)
		{
			this.authorized = false;
		},

		SecretPanel_dataReady(response)
		{
			this.feedback = response.data.feedback;
			this.dataReady = true;
			this.counts = response.data.counts;
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
		 * Fetch all of the cool data to show
		 */
		fetch()
		{
			this.$root.get(`${this.$root.prefix}/admin/data`, 'SecretPanel_dataReady');
		},

		/**
		 * Mark this feedback item as being 'done'
		 */
		complete(entry)
		{
			entry.done = ! entry.done;
			this.$root.post(`${this.$root.prefix}/admin/feedback/${entry.id}`);
		},

		/**
		 * Delete all the completed items in the feedback list
		 */
		wipe()
		{
			this.feedback = this.feedback.filter((entry) => ! entry.done);
			this.$root.post(`${this.$root.prefix}/admin/feedback/wipe`);
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
	max-width 700px
	margin 0 auto
	&.unauthorized
		align-items center
		justify-content center
		height 250px
		
.value
	color rc_blue 
	font-size 27px
	+mobile()
		font-size 22px
.attr
	color rc_win
	font-size 20px
	+mobile()
		font-size 16px
		
.stats
	display flex
	flex-flow row nowrap
	justify-content center
	align-items center
	padding 0.75em
	.entry
		flex 1
		display flex
		flex-flow column
		justify-content flex-end
		align-items center
		margin-bottom 25px
		&:not(:first-child)
			border-left 3px solid rc_super_lite_gray
			+mobile()
				border-width 2px
		.value
			margin-bottom 15px
			
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
	align-items center
	margin-bottom 15px
	.value
	.attr
		font-size 23px
	.wipe
		margin-left auto
		i
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
			margin 0 20px
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