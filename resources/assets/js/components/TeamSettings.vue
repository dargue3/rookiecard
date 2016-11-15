
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
																:lat.sync="team.lat" :timezone.sync="team.timezone" label="City / Town" :error="errors.city">
					</google-autocomplete>
				</div>

				<div class="photos">
					<div class="upload-pic">
						<label>Team Photo</label>
						<form class="dropzone --pic" id="team-pic"></form>
						<div v-show="picUploaded" class="crop">
							<a v-touch:tap="cropping('pic')">Crop</a>
						</div>
					</div>

					<div class="upload-pic">
						<label>Backdrop Photo</label>
						<form class="dropzone --backdrop" id="team-backdrop"></form>
						<div v-show="backdropUploaded" class="crop">
							<a v-touch:tap="cropping('backdrop')">Crop</a>
						</div>
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
			enableTypeahead: false,
			lastCheckedName: this.$route.params.name,
			dropzone: { 
				pic: null,
				backdrop: null,
				options: {
					paramName: 'pic',
					url: `${this.$parent.prefix}/temp_pic`,
					headers: { 'X-CSRF-TOKEN': $('#_token').attr('value') },
					maxFiles: 1,
					maxFilesize: 5,
					acceptedFiles: 'image/jpg,image/jpeg,image/png,image/svg,image/gif',
					addRemoveLinks: true,
					dictDefaultMessage: 'Drag and drop or click here',
					dictRemoveFile: '×',
					dictCancelUpload: '',
				},
			},
			croppie: { active: null, type: null },
			crops: { pic: {}, backdrop: {}},
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

			this.lastCheckedName = response.data.teamname;
		},


		/**
		 * Request back from the server after pressing 'save'
		 */
		TeamSettings_saved(response)
		{
			this.$dispatch('Team_updated_team', response.data.team);
			this.settingsSaved = true;
			this.$root.banner('good', 'Settings saved');
		},


		/**
		 * A photo has been cropped by the user
		 * Save the points and level of zoom for server-side cropping
		 */
		TeamSettings_cropped()
		{
			let data = this.croppie.active.croppie('get');

			this.resize_dropzone(this.croppie.type,
				data.points[0], data.points[1], data.points[2], data.points[3]
			);

			this.$set(`crops.${this.croppie.type}`, data);

			this.$root.hideModal('cropModal');
		},
	},

	computed:
	{
		/**
		 * Has a new profile photo been uploaded?
		 */
		picUploaded()
		{
			if (this.team.pic && this.backup.pic) {
				return this.team.pic !== this.backup.pic;
			}
			return false;
		},

		/**
		 * Has a new backdrop photo been uploaded?
		 */
		backdropUploaded()
		{
			if (this.team.pic && this.backup.pic) {
				return this.team.backdrop !== this.backup.backdrop;
			}
			return false;
		},
	},


	methods:
	{
		/**
		 * Save any changes to the server
		 */
		save()
		{
			if (this.checkInputs() > 0) {
				// there are errors in the fields
				return;
			}

			let data = {
				name: this.team.name,
				teamURL: this.team.teamname,
				homefield: this.team.homefield,
				slogan: this.team.slogan,
				city: this.team.city,
				lat: this.team.lat,
				long: this.team.long,
				timezone: this.team.timezone,
				pic: this.team.pic,
				backdrop: this.team.backdrop,
				userStats: this.team.settings.statKeys,
				rcStats: [],
			}

			let url = `${this.$parent.prefix}/settings`;
			this.$root.post(url, 'TeamSettings_saved', data);
		},


		/**
		 * Before submitting, check forms for errors and teamname for uniqueness
		 */
		checkInputs()
		{
			if (this.lastCheckedName !== this.team.teamname) {
				this.checkAvailability();
				return 1;
			}

			return this.errorCheck();
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
		init_dropzone_pic()
		{
			let options = JSON.parse(JSON.stringify(this.dropzone.options));

			this.dropzone.pic = new Dropzone('#team-pic', options);

			// set the thumbnails to show a default image
			//this.mockThumbnails(pic, backdrop);

			let self = this;

			// photo was uploaded to temp storage on S3
			// show modal to optionally crop photo
			this.dropzone.pic.on('success', function(file, response) {
				self.team.pic = response.pic;
				self.cropping('pic');
			});


			// whatever photo they had uploaded was discarded
			this.dropzone.pic.on('removedfile', function(file, response) {
				self.crops.pic = null;
			});
		},	


		/**
		 * Setup configurations and attach Dropzone to the DOM
		 */
		init_dropzone_backdrop()
		{
			let options = JSON.parse(JSON.stringify(this.dropzone.options));

			options.thumbnailWidth = 210;
			this.dropzone.backdrop = new Dropzone('#team-backdrop', options);


			// set the thumbnails to show a default image
			//this.mockThumbnails(pic, backdrop);

			let self = this;

			// photo was uploaded to temp storage on S3
			// show modal to optionally crop photo
			this.dropzone.backdrop.on('success', function(file, response) {
				self.team.backdrop = response.pic;
				self.cropping('backdrop');
			});


			// whatever photo they had uploaded was discarded
			this.dropzone.backdrop.on('removedfile', function(file, response) {
				self.crops.backdrop = null;
			});
		},	


		/**
		 * An uploaded image has been cropped, reinitialize dropzone with the cropped image
		 */
		resize_dropzone(pic_type, topLeftX, topLeftY, bottomRightX, bottomRightY)
		{
			let self = this;
			let srcX = topLeftX;
			let srcY = topLeftY;
			let srcWidth = bottomRightX - topLeftX;
			let srcHeight = bottomRightY - topLeftY;
			let resize = function(file) {
        // drawImage(image, srcX, srcY, srcWidth, srcHeight, trgX, trgY, trgWidth, trgHeight) takes an image, clips it to
        // the rectangle (srcX, srcY, srcWidth, srcHeight), scales it to dimensions (trgWidth, trgHeight), and draws it
        // on the canvas at coordinates (trgX, trgY).
        let info = {
          srcX: srcX,
          srcY: srcY,
          srcWidth: srcWidth,
          srcHeight: srcHeight,
          trgX:0,
          trgY:0,
          trgWidth: this.options.thumbnailWidth,
          trgHeight: parseInt(this.options.thumbnailWidth * srcHeight / srcWidth)
        }
        return info;
    	};

    	// add the resizing feature to dropzone options object
    	let options = JSON.parse(JSON.stringify(this.dropzone.options));
    	options.resize = resize;

    	// disable the existing dropzone element
    	this.dropzone[pic_type].removeAllFiles(true);
    	this.dropzone[pic_type].options.resize = resize;
    	this.dropzone[pic_type].options.maxFiles = 0;

    	// load a new dropzone thumbnail with crops by mocking an upload
    	let mock = { name: '', size: 424214, accepted: true, kind: 'image' }
    	let pic = this.$get(`team.${pic_type}`);
    	this.dropzone[pic_type].emit('addedfile', mock);
			this.dropzone[pic_type].createThumbnailFromUrl(mock, pic, null, 'anonymous');
			this.dropzone[pic_type].emit('complete', mock);
			this.dropzone[pic_type].files.push(mock);
		},


		init_croppie(pic_type)
		{
			this.croppie.type = pic_type;
			let cropper;
			let options = {}

			// destroy current croppie element if already initialized
			if (this.croppie.active) {
				this.croppie.active.croppie('destroy');
				this.croppie.active = null;
			}

			if (pic_type === 'pic') {
				options.url = this.team.pic;
				options.viewport = { width: 200, height: 200, type: 'circle'};
				cropper = $('#croppie').croppie(options);
			}

			if (pic_type === 'backdrop') {
				options.url = this.team.backdrop;
				options.viewport = { width: 400, height: 150, type: 'square'};
				cropper = $('#croppie').croppie(options);
			}

			let previousCrops = this.$get(`crops.${pic_type}`);
			if (previousCrops) {
				cropper.croppie('bind', {
					url: this.$get(`team.${pic_type}`),
					points: previousCrops.points
				});		
			}

			this.croppie.active = cropper;
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
		},


		/**
		 * User wants to crop their picture before saving
		 */
		cropping(pic_type)
		{
			this.init_croppie(pic_type);
			this.$root.showModal('cropModal');
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
			this.init_dropzone_pic();
			this.init_dropzone_backdrop();
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
		.crop
			margin-top 5px
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
					top -53px
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
						top -53px
						
.croppie
	width 100%
	height 250px
	margin-top 15px
	margin-bottom 35px
	.cr-slider-wrap
		margin 20px auto
		.cr-slider
			background rc_med_gray
	
.croppie-wrapper
	padding 10px
	.save-button-wrapper
		margin-top 10px
	
	

			
					
	
</style>