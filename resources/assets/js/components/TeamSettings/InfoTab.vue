<template>
	<div class="settings-wrapper">
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
				<span v-else class="input-info">rookiecard.io/team/{{ team.teamname }}</span>	
			</div>
		</div>

		<div class="form-group">
			<div>
				<label>Slogan</label>
				<span v-if="team.slogan" class="remaining"><strong>{{ team.slogan.length }}</strong> / 50</span>
				<input type="text" class="form-control" required maxlength="50" placeholder="Home of the Wildcats"
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
			
			<google-autocomplete :city.sync="team.city" :long.sync="team.long"
														:lat.sync="team.lat" :timezone.sync="team.timezone" label="City / Town" :error="errors.city">
			</google-autocomplete>
		</div>

		<div class="photos with-separator">
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
</template>

<script>

import Validator from '../../mixins/Validator.js'
import GoogleTypeahead 	from '../GoogleTypeahead.vue'
import { mixin as VueFocus } from 'vue-focus'

export default  {
	
	name: 'InfoTab',

	props: ['focused', 'team', 'backup', 'errorChecker', 'pic', 'backdrop'],

	mixins: [ Validator, VueFocus ],

	components:
	{
		'google-autocomplete' : GoogleTypeahead,
	},

	data()
	{
		Dropzone.autoDiscover = false;

		return {
			lastCheckedName: this.$route.params.name,
			checkingForErrors: false,
			photoURLs: { pic: null, backdrop: null, previous: { pic: null, backdrop: null } },
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
			crops: { pic: { valid: false, data: [] }, backdrop: { valid: false, data: [] }},
		}
	},

	beforeCompile()
	{
		this.registerErrorChecking('team.name', 'required', 'Enter a name');
		this.registerErrorChecking('team.teamname', 'required|alpha_dash', ['Pick a team URL', 'No special characters']);
	},

	computed:
	{
		/**
		 * Has a new profile photo been uploaded?
		 */
		picUploaded()
		{
			return this.photoURLs.pic !== null;
		},
		
		/**
		 * Has a new backdrop photo been uploaded?
		 */
		backdropUploaded()
		{
			return this.photoURLs.backdrop !== null;
		},
	},

	events:
	{
		/**
		 * Request back from the server about whether this team URL is available
		 */
		TeamSettings_availability(response)
		{
			this.lastCheckedName = response.data.teamname;

			if (! response.data.available && this.team.teamname !== this.backup.teamname) {
				this.errors.team.teamname = 'Already taken'
			}
			else if (this.checkingForErrors) {
				// if this check was a part of an overall error check, continue it
				this.$emit('TeamSettings_checkErrors');
			}
		},


		/**
		 * A photo has been cropped by the user
		 * Save the points and level of zoom for server-side cropping
		 */
		TeamSettings_cropped()
		{
			let data = this.croppie.active.croppie('get');
			this.crops[this.croppie.type].data = data;

			this.resize_dropzone(this.croppie.type,
				data.points[0], data.points[1], data.points[2], data.points[3]
			);

			this.$root.hideModal('cropModal');
		},

		/**
		 * Signal from TeamSettings to check all the inputs for errors
		 */
		TeamSettings_checkErrors()
		{
			this.checkingForErrors = true;
			this.errorChecker.call(this, this.checkInputs());
		},


		/**
		 * The settings have been saved, reset variables to defaults
		 */
		TeamSettings_saved()
		{
			this.dropzone.pic.destroy();
			this.dropzone.backdrop.destroy();
			this.init_dropzone_pic();
			this.init_dropzone_backdrop();
		},
	},

	methods:
	{
		/**
		 * Before submitting, check forms for errors and teamname for uniqueness
		 */
		checkInputs()
		{
			if (this.lastCheckedName !== this.team.teamname) {
				this.checkAvailability();
				return 1;
			}

			this.checkingForErrors = false;
			let errors = this.errorCheck();

			if (errors > 0) {
				return errors;
			}

			return errors;
		},

		/**
		 * Parse through the uploaded/cropped photo data and decide what to send server
		 */
		formatPhotoData()
		{
			// set initially to undefined (gets ignored in a POST request)
			this.team.tempPic = undefined;
			this.team.tempBackdrop = undefined;

			if (this.dropzone.pic.files.length && this.crops.pic.valid) {
				this.team.tempPic = { crops: this.crops.pic.data.points, url: this.photoURLs.pic };
			}
			if (this.dropzone.backdrop.files.length && this.crops.backdrop.valid) {
				this.team.tempBackdrop = { crops: this.crops.backdrop.data.points, url: this.photoURLs.backdrop };
			}
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

			let self = this;

			// photo was uploaded to temp storage on S3
			// show modal to optionally crop photo
			this.dropzone.pic.on('success', function(file, response) {
				self.crops.pic.valid = false;
				self.photoURLs.pic = response.pic;
				self.photoURLs.previous.pic = response.pic;
				self.formatPhotoData();
				self.cropping('pic');
			});

			// whatever changes they were making to their photo is erased
			this.dropzone.pic.on('removedfile', function(file, response) {
				self.photoURLs.pic = null;
				self.crops.pic.valid = false;
				this.options.resize = null;
				this.options.maxFiles = 1;
				this.enable();
				self.formatPhotoData();
			});
		},


		/**
		 * Setup configurations and attach Dropzone to the DOM
		 */
		init_dropzone_backdrop()
		{
			let options = JSON.parse(JSON.stringify(this.dropzone.options));

			options.thumbnailWidth = 320;
			this.dropzone.backdrop = new Dropzone('#team-backdrop', options);

			let self = this;

			// photo was uploaded to temp storage on S3
			// show modal to optionally crop photo
			this.dropzone.backdrop.on('success', function(file, response) {
				self.crops.backdrop.valid = false;
				self.photoURLs.backdrop = response.pic;
				self.photoURLs.previous.backdrop = response.pic;
				self.formatPhotoData();
				self.cropping('backdrop');
			});

			// whatever photo they had uploaded was discarded
			this.dropzone.backdrop.on('removedfile', function(file, response) {
				self.crops.backdrop.valid = false;
				self.photoURLs.backdrop = null;
				this.options.resize = null;
				this.options.maxFiles = 1;
				this.enable();
				self.formatPhotoData();
			});
		},	


		/**
		 * An uploaded image has been cropped
		 * Reinitialize Dropzone with the cropped image according to the given vertices
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
        return {
          srcX: srcX,
          srcY: srcY,
          srcWidth: srcWidth,
          srcHeight: srcHeight,
          trgX:0,
          trgY:0,
          trgWidth: this.options.thumbnailWidth,
          trgHeight: this.options.thumbnailHeight
        }
    	};

    	// add the resizing feature to dropzone options object
    	let options = JSON.parse(JSON.stringify(this.dropzone.options));
    	options.resize = resize;

    	// disable the existing dropzone element
    	this.dropzone[pic_type].removeAllFiles(true);
    	this.dropzone[pic_type].options.resize = resize;
    	this.dropzone[pic_type].options.maxFiles = 0;

    	// load a new dropzone thumbnail with crops by mocking an upload
    	let url = JSON.parse(JSON.stringify(this.photoURLs.previous[pic_type]));
    	let mock = { name: '', size: 424214, mock: true }
    	this.dropzone[pic_type].emit('addedfile', mock);
			this.dropzone[pic_type].createThumbnailFromUrl(mock, url);
			this.dropzone[pic_type].emit('complete', mock);
			this.dropzone[pic_type].files.push(mock);
			this.dropzone[pic_type].disable();
			this.photoURLs[pic_type] = url;
			this.crops[pic_type].valid = true;
			this.formatPhotoData();
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
				options.url = this.photoURLs.pic;
				options.viewport = { width: 200, height: 200, type: 'circle' };
				cropper = $('#croppie').croppie(options);
			}

			if (pic_type === 'backdrop') {
				options.url = this.photoURLs.backdrop;
				options.viewport = { width: 400, height: 150, type: 'square' };
				cropper = $('#croppie').croppie(options);
			}

			let previousCrops = JSON.parse(JSON.stringify(this.crops[pic_type].data));
			if (previousCrops && this.crops[pic_type].valid) {
				cropper.croppie('bind', {
					url: this.photoURLs[pic_type],
					points: previousCrops.points
				});		
			}

			this.croppie.active = cropper;
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
	
	ready()
	{
	  // initialize plugins now that DOM is ready
		this.init_dropzone_pic();
		this.init_dropzone_backdrop();
	},
};

</script>

<style lang="stylus">
	
@import '/resources/assets/stylus/variables.styl'

		
.photos
	display flex
	flex-flow row nowrap
	flex-basis 100%
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
			.dz-details
				display none
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
					.dz-error-message
						left 35px
						
.croppie
	width 100%
	height 250px
	margin-top 15px
	margin-bottom 45px
	.cr-slider-wrap
		margin 23px auto
		.cr-slider
			background rc_med_gray

.croppie-wrapper
	padding 10px
	.save-button-wrapper
		margin-top 10px

</style>