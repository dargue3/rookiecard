<template>
	<div class="Feedback__wrapper">
		
		<div class="Feedback -container">
		
			<div class="header">
				<h2>Thanks for making Rookiecard awesomer!</h2>
			</div>

			<div class="top">
				<div class="type">
					<label>I'm submitting a&hellip;</label>
					<select data-style="btn-select btn-lg" Feedback class="selectpicker form-control show-tick"
									:class="{'form-error' : errors.details}" v-model="type">
						<option value="bug">Bug Report</option>
						<option value="suggestion">Suggestion</option>
						<option value="compliment">Compliment •ᴗ•</option>
					</select>
					<span v-show="errors.type" class="form-error">{{ errors.type }}</span>
				</div>
				<div class="submit">
					<a class="btn btn-primary -input-height -no-margin" v-touch:tap="submit()"
							:class="{'click-me' : details.length}">
						<span v-show="! loading_save">SUBMIT</span>
						<spinner v-show="loading_save" color="white"></spinner>
					</a>
				</div>
			</div>

			<div class="details">
				<textarea v-autosize="details" class="form-control" maxlength="5000" rows="3"
									:class="{'form-error' : errors.details}"
								 	:placeholder="placeholder" v-model="details"></textarea>
				<span v-show="errors.details" class="form-error">{{ errors.details }}</span>
			</div>

		</div>
	</div>
</template>

<script>

import Validator from '../../mixins/Validator.js'

export default  {
	
	name: 'Feedback',

	mixins: [ Validator ],

	data()
	{
		return {
			type: 'bug',
			details: '',
			loading_save: false,
		}
	},

	computed:
	{
		placeholder()
		{
			if (this.type === 'bug') {
				return 'When I was... I expected... instead this happened...';
			}
			if (this.type === 'suggestion') {
				return "I'd really like to see...";
			}
			if (this.type === 'compliment') {
				return 'I love how...';
			}
		}
	},

	events:
	{
		Feedback_submitted(response)
		{
			this.details = '';
			this.loading_save = false;
			this.$root.banner('good', 'Submitted. Thanks!');
		},
	},

	methods:
	{
		submit()
		{
			if (this.errorCheck() > 0) {
				return
			}

			let data = {
				type: this.type,
				details: this.details,
			}

			this.loading_save = true;
			this.$root.post(`${this.$parent.prefix}/options/feedback`, 'Feedback_submitted', data);
		}
	},

	ready()
	{
		$(function() {
			$('.selectpicker[Feedback]').selectpicker();
		});
	},

	beforeCompile()
	{
		this.registerErrorChecking('type', 'required', 'What are you submitting?', false);
		this.registerErrorChecking('details', 'required', 'Give us some feedback!', false);
	},
};

</script>

<style lang="stylus" scoped>
@import '/resources/assets/stylus/variables.styl'

.Feedback__wrapper
	padding 1em
	+mobile()
		padding 0.5em
	
.Feedback
	display flex
	flex-flow column
	justify-content center
	align-items center
	margin 0 auto
	margin-top 40px
	max-width 650px
	
.header
	margin-bottom 30px
	margin-top 10px
	text-align center
	h2
		margin 0
		+media(450px)
			font-size 25px

.top
	width 100%
	height 100px
	display flex
	flex-flow row nowrap
	justify-content space-between
	align-items flex-end
	margin-bottom 30px
	.submit
		width 150px
		margin-left 10px
		+media(450px)
			margin 0 0 20px 0
			width 100%
			order 1
	.type
		+media(450px)
			width 100%
			order 2
	+media(450px)
		flex-flow column
		align-items center
		height auto
		margin-bottom 10px
			
.details
	width 100%

</style>