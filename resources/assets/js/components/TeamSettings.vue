
<template>
	<div>

		<div class="Settings__header">

			<div class="save">
				<a v-if="! settingsSaved" class="btn btn-primary" :class="{ 'click-me' : ! settingsSaved }" v-touch:tap="save()">
    			<span v-show="! loading_save">SAVE</span>
    			<spinner v-show="loading_save" color="white"></spinner>
    		</a>
    		<a v-else class="btn btn-cancel">SAVED</a>
			</div>

			<div class="header">
				<h2>Settings</h2>
			</div>

		</div>


		<div class="Settings">

			<div class="settings-nav">
				<ul>
					<li :class="{ '--active' : tab === 'info' }" v-touch:tap="tab = 'info'">Info</li>
					<li :class="{ '--active' : tab === 'stats' }" v-touch:tap="tab = 'stats'">Stats</li>
					<li :class="{ '--active' : tab === 'privacy' }" v-touch:tap="tab = 'privacy'">Privacy</li>
					<li :class="{ '--active' : tab === 'notifications' }" v-touch:tap="tab = 'notifications'">Notifications</li>
					<li class="danger-zone" :class="{ '--active' : tab === 'danger zone' }" v-touch:tap="tab = 'danger zone'">Danger Zone</li>
				</ul>
			</div>
			
			<div class="settings-container">
				<div class="form-group">
					<div>
						<label>Team Name</label>
						<input type="text" class="form-control" :class="{'form-error' : errors.team.name}" 
									required maxlength="25" v-focus="focused.name" @focus="focused.name = true" @blur="focused.name = false" 
									placeholder="WHS Varsity Basketball" v-model="team.name">
						<span class="form-error">{{ errors.team.name }}</span>
					</div>

					<div>
						<label>Team URL</label>
						<input type="text" class="form-control" :class="{'form-error' : errors.team.teamname}"
										maxlength="18" placeholder="whsbasketball16" required @blur="checkAvailability()" v-model="team.teamname">
						<span v-show="errors.team.teamname" class="form-error">{{ errors.team.teamname }}</span>
						<span v-else class="input-info">rookiecard.com/team/{{ team.teamname }}</span>	
					</div>
				</div>

				<div class="form-group">
					<div>
						<label>Slogan</label>
						<span v-if="team.slogan" class="remaining"><strong>{{ team.slogan.length }}</strong> / 50</span>
						<input type="text" class="form-control" required maxlength="50"
									 v-focus="focused.slogan" @focus="focused.slogan = true" @blur="focused.slogan = false" 
									v-model="team.slogan">
					</div>
				</div>

				<div class="form-group">
					<div>
						<label>Homefield</label>
						<input type="text" class="form-control" required maxlength="25"
									v-focus="focused.homefield" @focus="focused.homefield = true" @blur="focused.homefield = false" 
									placeholder="Cowell Stadium" v-model="team.homefield">
					</div>
					
					<google-autocomplete v-if="enableTypeahead" :city.sync="team.city" :long.sync="team.long"
																:lat.sync="team.lat" label="City / Town" :error="errors.city">
					</google-autocomplete>
				</div>

				<div class="photos">
					<div class="upload-pic">
						<label>Team Photo</label>
						<form class="dropzone --pic" id="team-pic"></form>
					</div>

					<div class="upload-pic">
						<label>Backdrop Photo</label>
						<form class="dropzone --backdrop" id="team-backdrop"></form>
					</div>
				</div>
			</div>
			

		</div>
	</div>
</template>

<script>

import Validator from '../mixins/Validator.js'
import GoogleTypeahead 	from './GoogleTypeahead.vue'
import { mixin as VueFocus } from 'vue-focus'

export default  {
	
	name: 'TeamSettings',

	props: ['team', 'settingsSaved', 'focused'],

	mixins: [ Validator, VueFocus ],

	components:
	{
		'google-autocomplete' : GoogleTypeahead,
	},

	data()
	{
		Dropzone.autoDiscover = false;

		return {
			tab: 'info',
			backup: {},
			debounce: 1500,
			enableTypeahead: false,
		}
	},


	beforeCompile()
	{
		this.registerErrorChecking('team.name', 'required', 'Enter a name');
		this.registerErrorChecking('team.teamname', 'required|alpha_dash', ['Pick a team URL', 'No special characters']);
	},

	events:
	{
		/**
		 * Request back from the server about whether this team URL is available
		 */
		TeamSettings_availability(response)
		{
			if (! response.data.available && this.team.teamname !== this.backup.teamname) {
				this.errors.team.teamname = 'Already taken'
			}
		},
	},

	watch:
	{
		/**
		 * Make non-reactive backup of the original team data
		 */
		team()
		{
			this.$set('backup', JSON.parse(JSON.stringify(this.team)));

			this.dropzone();

			this.enableTypeahead = true;
		},


		/**
		 * Watch all of the following parameters for changes
		 * Mark 'saved' as false until otherwise noted
		 */
		'team.name' : function(newVal, oldVal)
		{
			if (typeof oldVal !== 'undefined') {
				this.settingsSaved = false;
			}
		},

		'team.teamname' : function(newVal, oldVal)
		{
			if (typeof oldVal !== 'undefined') {
				this.settingsSaved = false;
			}
		},

		'team.homefield' : function(newVal, oldVal)
		{
			if (typeof oldVal !== 'undefined') {
				this.settingsSaved = false;
			}
		},

		'team.slogan' : function(newVal, oldVal)
		{
			if (typeof oldVal !== 'undefined') {
				this.settingsSaved = false;
			}
		},

		'team.city' : function(newVal, oldVal)
		{
			if (typeof oldVal !== 'undefined') {
				this.settingsSaved = false;
			}
		},

		'team.pic' : function(newVal, oldVal)
		{
			if (typeof oldVal !== 'undefined') {
				this.settingsSaved = false;
			}
		},

		'team.backdrop' : function(newVal, oldVal)
		{
			if (typeof oldVal !== 'undefined') {
				this.settingsSaved = false;
			}
		},
	},

	methods:
	{
		/**
		 * Save any changes to the server
		 */
		save()
		{
			this.settingsSaved = true;

			this.$root.banner('good', 'Settings saved');
		},


		/**
		 * Ask the server if this teamname that was just typed in is taken yet
		 */
		checkAvailability()
		{
			if (this.errorCheck('team.teamname') === 0) {
				this.$root.get(`${this.$root.prefix}/team/create/${this.team.teamname}`, 'TeamSettings_availability');
			}
		},


		/**
		 * Setup configurations and attach Dropzone to the DOM
		 */
		dropzone()
		{
			let options = {
				paramName: 'pic',
				url: '', // set later
				headers: {'X-CSRF-TOKEN': this.$http.headers.common['X-CSRF-TOKEN'] },
				maxFiles: 1,
				maxFilesize: 5,
				acceptedFiles: 'image/jpg,image/jpeg,image/png,image/svg,image/gif',
				addRemoveLinks: true,
				dictDefaultMessage: 'Drag and drop or click here',
				dictRemoveFile: '×',
				dictCancelUpload: '',
			};

			options.url = `${this.$parent.prefix}/pic`;
			let pic = new Dropzone('#team-pic', options);

			options.url = `${this.$parent.prefix}/backdrop`;
			options.thumbnailWidth = 210;
			let backdrop = new Dropzone('#team-backdrop', options);


			// set the thumbnails to show a default image
			this.mockThumbnails(pic, backdrop);


			// picture uploaded successfully to the server
			// returned with file object and response
			pic.on('success', function(file, response) {
				//let newPic = response.data.pic;
				this.$root.banner('good', 'Picture uploaded')
			}.bind(this));


			// backdrop photo uploaded successfully to the server
			// returned with file object and response
			backdrop.on('success', function(file, response) {
				//let newBackdrop = response.data.pic;
				this.$root.banner('good', 'Picture uploaded')
			}.bind(this));


			// picture reverted back to original in server
			// returned with file object and response
			pic.on('removedfile', function(file, response) {
				this.$root.banner('good', 'Reverted to original photo')
			}.bind(this));


			// backdrop photo reverted back to original in server
			// returned with file object and response
			backdrop.on('removedfile', function(file, response) {
				this.$root.banner('good', 'Reverted to original photo')
			}.bind(this));
		},	


		/**
		 * Set the default thumbnails to their current saved photos
		 */
		mockThumbnails(pic, backdrop)
		{
			let mock = { name: 'Team Photo', size: 424214 }
			pic.emit('addedfile', mock);
			pic.createThumbnailFromUrl(mock, this.team.pic);
			pic.emit('complete', mock);

			let mock2 = { name: 'Backdrop Photo', size: 643244 }
			backdrop.emit('addedfile', mock2);
			backdrop.createThumbnailFromUrl(mock2, this.team.backdrop);
			backdrop.emit('complete', mock2);
		}
	},

};

</script>

<style lang="stylus">
	
@import '/resources/assets/stylus/variables.styl'

.Settings
	display flex
	flex-flow row
	justify-content center
	max-width 775px
	margin 0 auto
	
.Settings__header
	display flex
	flex-flow row nowrap
	margin 0 auto
	margin-bottom 10px
	align-items center
	max-width 775px
	.save
		width 183px
		.btn
			margin 0
			width 100%
			&.btn-cancel:hover
				background rc_med_gray
				cursor default
	.header
		margin-left 21px
		display flex
		align-items center
		h2
			margin 0
		
.settings-nav
	flex 1
	font-size 20px
	color link_blue
	ul
		list-style none
		padding 0
		margin 0
		li
			padding 1em
			background whitesmoke
			border-left 2px solid rc_super_lite_gray
			transition border-left 150ms ease
			&.--active
				background white
				font-weight bold
				&:hover
					cursor default
					border-left 2px solid rc_super_lite_gray
					color link_blue
			&.danger-zone
				color rc_red
				transition all 150ms ease
				border-left-color rgba(201, 0, 25, 0.1)
				&:hover
					color rc_red_hover
					border-left 4px solid rgba(201, 0, 25, 0.4)
					transition all 150ms ease
					&.--active
						border-left 2px solid rgba(201, 0, 25, 0.1)
						color rc_red
			&:hover
				cursor pointer
				border-left 4px solid rc_lite_gray
				transition all 150ms ease
				color link_blue_hover
				
				
.settings-container
	display flex
	flex-flow row wrap
	flex 3
	background white
	padding 1.5em
	.form-group
		flex-basis 100%
		display flex
		margin-bottom 20px
		div
			flex 1
			&:not(:first-child)
				margin-left 10px
		
		
.photos
	flex-basis 100%
	display flex
	flex-flow row nowrap
	border-top 2px solid rc_super_lite_gray
	margin 25px 0
	padding 40px 0 0 0
	+mobile()
		flex-flow row wrap
	.upload-pic
		flex 1
		text-align center
		&:last-child
				margin-left 10px
		+mobile()
			flex-basis 100%
			&:last-child
				margin-top 10px
				margin-left 0px
		.dropzone
			height 200px
			display flex
			justify-content center
			align-items center
			border-radius 10px
			transition all 300ms
			color link_blue
			&:hover
				transition all 300ms
				color link_blue_hover
				border 2px dashed link_blue_hover
			&:active
			&:focus
				border 2px solid link_blue_hover
			.dz-remove
				color rc_red
				font-size 40px
				position absolute
			&.success
				border 2px dashed rc_bright_green
				transition border .3s
			&.--pic
				width 200px
				border-radius 50%
				.dz-image
					border-radius 50%
				.dz-remove
					display inherit
					position absolute
					bottom -49px
					left 52px
			&.--backdrop
				width 333px
				.dz-preview
					width 210px
					.dz-image
						border-radius 15px
						width 210px
					.dz-remove
						left 98px
						bottom -49px
			
					
	
</style>