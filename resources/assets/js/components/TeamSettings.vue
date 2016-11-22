
<template>
	<div>

		<div class="Settings__header">
		
			<div class="left">
				<div class="save">
					<a v-if="! saved" class="btn btn-primary" :class="{ 'click-me' : ! saved }" v-touch:tap="save()">
	    			<span v-show="! loading_save">SAVE</span>
	    			<spinner v-show="loading_save" color="white"></spinner>
	    		</a>
	    		<a v-else class="btn btn-cancel">SAVED</a>
				</div>

				<div class="header">
					<h2>Settings</h2>
				</div>
			</div>
				
			<div v-show="! saved" class="right">
				<div class="discard">
					<span v-touch:tap="cancel()">Discard Changes</span>
				</div>
			</div>
			
		</div>

		

		<div class="Settings">

			<div class="settings-nav">
				<ul>
					<li :class="{ '--active' : tab === 'info' }" v-touch:tap="tab = 'info'">Info</li>
					<li :class="{ '--active' : tab === 'stats' }" v-touch:tap="tab = 'stats'">Stats</li>
					<li :class="{ '--active' : tab === 'privacy' }" v-touch:tap="tab = 'privacy'">Privacy</li>
					<li :class="{ '--active' : tab === 'notifications' }" v-touch:tap="tab = 'notifications'">Notifications</li>
					<li class="danger-zone" :class="{ '--active' : tab === 'danger-zone' }" v-touch:tap="tab = 'danger-zone'">Danger Zone</li>
				</ul>
			</div>
			


			<!-- INFO -->
			<div v-show="tab === 'info'" class="settings-wrapper">
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





			<!-- STATS -->
			<div v-show="tab === 'stats'" class="settings-wrapper">

				<stats v-if="showStatTable" type="playerSeason" :stat-keys="newStatKeys" :sport="team.sport"
								:raw-stats="stats" :players="player" :centered="false" :disable-sorting="true">

								<div class="outcome">
									<span class="away loss --no-border">Demo</span>
								</div>

    		</stats>

				<stat-selection v-if="team.sport" :sport="team.sport" :user-selected.sync="userSelected" :sample-stats.sync="stats"
												:rc-selected.sync="rcSelected" :existing="team.settings.statKeys">
				</stat-selection>

			</div>






			<!-- PRIVACY -->
			<div v-show="tab === 'privacy'" class="settings-wrapper">
				<div class="settings-container">

					<div class="settings-entry">
						<span class="description">Who can view the team's location?</span>
						<div class="switch">
							<input type="checkbox" bootstrap-switch="TeamSettings-location" >
						</div>
					</div>

					<div class="settings-entry">
						<span class="description">Who can view the roster?</span>
						<div class="switch">
							<input type="checkbox" bootstrap-switch="TeamSettings-roster">
						</div>
					</div>

					<div class="settings-entry">
						<span class="description">Who can view team events?</span>
						<div class="switch">
							<input type="checkbox" bootstrap-switch="TeamSettings-events">
						</div>
					</div>

					<div class="settings-entry">
						<span class="description">How can people join?</span>
						<div class="switch">
							<input type="checkbox" bootstrap-switch="TeamSettings-join">
						</div>
					</div>

					<div class="settings-entry">
						<span class="description">How can people become a fan?</span>
						<div class="switch">
							<input type="checkbox" bootstrap-switch="TeamSettings-fan">
						</div>
					</div>


				</div>
			</div>




			<!-- NOTIFICATIONS -->
			<div v-show="tab === 'notifications'" class="settings-wrapper">
					
			</div>





			<!-- DANGER-ZONE -->
			<div v-show="tab === 'danger-zone'" class="settings-wrapper">
					
			</div>
			

		</div>
	</div>
</template>

<script>


import Validator from '../mixins/Validator.js'
import GoogleTypeahead 	from './GoogleTypeahead.vue'
import StatSelection 	from './StatSelection.vue'
import Stats 	from './Stats.vue'
import { mixin as VueFocus } from 'vue-focus'

export default  {
	
	name: 'TeamSettings',

	props: ['team', 'saved', 'focused'],

	mixins: [ Validator, VueFocus ],

	components:
	{
		'google-autocomplete' : GoogleTypeahead,
		'stat-selection': StatSelection,
		'stats': Stats,
	},

	data()
	{
		Dropzone.autoDiscover = false;

		return {
			tab: 'privacy',
			backup: {},
			enableTypeahead: false,
			loading_save: false,
			lastCheckedName: this.$route.params.name,
			photoURLs: { pic: null, backdrop: null },
			rcSelected: [],
			userSelected: [],
			newStatKeys: [],
			showStatTable: false,
			stats: [],
			player: [{'abbrName': 'Ghost', 'member_id': 0, 'user_id': 0}],
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
			crops: { pic: { valid: false }, backdrop: { valid: false }},
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
			this.saved = true;
			this.loading_save = false;
			this.$root.banner('good', 'Settings saved');
		},


		/**
		 * The keys being calculated in StatSelection are finished
		 */
		TeamSettings_keys_set(keys)
		{
			this.newStatKeys = keys;
			this.showStatTable = true;
			this.$broadcast('Stats_recompile');
		},


		/**
		 * A photo has been cropped by the user
		 * Save the points and level of zoom for server-side cropping
		 */
		TeamSettings_cropped()
		{
			let data = this.croppie.active.croppie('get');

			// console.log(`topLeftX: ${data.points[0]}`);
			// console.log(`topLeftY: ${data.points[1]}`);
			// console.log(`bottomRightX: ${data.points[2]}`);
			// console.log(`bottomRightY: ${data.points[3]}`);

			this.resize_dropzone(this.croppie.type,
				data.points[0], data.points[1], data.points[2], data.points[3]
			);

			this.crops[this.croppie.type].data = data;

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

			let { pic, backdrop } = this.formatPhotoData();

			let data = {
				name: this.team.name,
				teamURL: this.team.teamname,
				homefield: this.team.homefield,
				slogan: this.team.slogan,
				city: this.team.city,
				lat: this.team.lat,
				long: this.team.long,
				timezone: this.team.timezone,
				pic: pic,
				backdrop: backdrop,
				userStats: this.team.settings.statKeys,
				rcStats: [],
			}

			this.loading_save = true;

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
		 * Discard all the changes they made
		 */
		cancel()
		{
			this.saved = true;
		},


		/**
		 * Parse through the uploaded/cropped photo data and decide what to send server
		 */
		formatPhotoData()
		{
			let pic = undefined;
			let backdrop = undefined;
			if (this.dropzone.pic.files.length && this.crops.pic.valid) {
				pic = { crops: this.crops.pic.data.points, url: this.photoURLs.pic };
			}
			if (this.dropzone.backdrop.files.length && this.crops.backdrop.valid) {
				backdrop = { crops: this.crops.backdrop.data.points, url: this.photoURLs.backdrop };
			}

			return { pic, backdrop };
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
				self.saved = false;
				self.photoURLs.pic = response.pic;
				self.cropping('pic');
			});

			// whatever changes they were making to their photo is erased
			this.dropzone.pic.on('removedfile', function(file, response) {
				this.options.resize = null;
				self.photoURLs.pic = null;
				this.options.maxFiles = 1;
				self.crops.pic.valid = false;
				this.enable();
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

			let self = this;

			// photo was uploaded to temp storage on S3
			// show modal to optionally crop photo
			this.dropzone.backdrop.on('success', function(file, response) {
				self.saved = false;
				self.photoURLs.backdrop = response.pic;
				self.cropping('backdrop');
			});

			// whatever photo they had uploaded was discarded
			this.dropzone.backdrop.on('removedfile', function(file, response) {
				this.options.resize = null;
				self.photoURLs.backdrop = null;
				this.options.maxFiles = 1;
				self.crops.backdrop.valid = false;
				this.enable();
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
    	let url = JSON.parse(JSON.stringify(this.photoURLs[pic_type]));
    	let mock = { name: '', size: 424214, mock: true }
    	this.dropzone[pic_type].emit('addedfile', mock);
			this.dropzone[pic_type].createThumbnailFromUrl(mock, url);
			this.dropzone[pic_type].emit('complete', mock);
			this.dropzone[pic_type].files.push(mock);
			this.dropzone[pic_type].disable();
			this.photoURLs[pic_type] = url;
			this.crops[pic_type].valid = true;
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

			let previousCrops = this.crops[pic_type].data
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


		/**
		 * Initialize the bootstrap switches on the page to their saved settings
		 */
		init_switches()
		{
			let self = this;
			let options = {
				state: false,
				onText: 'YES',
				offText: 'NO',
				handleWidth: '115px',
				onSwitchChange: function(e, state) {
					self.switchChanged(this.getAttribute('bootstrap-switch'), state);
				},
			};

			options.state = this.team.settings.onlyMembersCanViewLocation;
			options.onText = 'MEMBERS & FANS';
			options.offText = 'ANYONE';
		  $('input[bootstrap-switch="TeamSettings-location"]').bootstrapSwitch(options);

		  options.state = this.team.settings.onlyMembersCanViewRoster;
		  options.onText = 'MEMBERS & FANS';
		  options.offText = 'ANYONE';
		  $('input[bootstrap-switch="TeamSettings-roster"]').bootstrapSwitch(options);

		  options.state = this.team.settings.onlyMembersCanViewEvents;
		  options.onText = 'MEMBERS & FANS';
		  options.offText = 'ANYONE';
		  $('input[bootstrap-switch="TeamSettings-events"]').bootstrapSwitch(options);

		  options.state = this.team.settings.membersAreInviteOnly;
		  options.onText = 'INVITE ONLY';
		  options.offText = 'ASK OR INVITE';
		  $('input[bootstrap-switch="TeamSettings-join"]').bootstrapSwitch(options);

		  options.state = this.team.settings.fansAreInviteOnly;
		  options.onText = 'INVITE ONLY';
		  options.offText = "JUST CLICK ‘FAN’";
		  $('input[bootstrap-switch="TeamSettings-fan"]').bootstrapSwitch(options);
		},

		/**
		 * One of the bootstrap switches were changed
		 * Attribute is taken from the html element, where it says bootstrap-switch="TeamSettings-***"
		 */
		switchChanged(attribute, state)
		{
			this.saved = false;

			if (attribute.includes('location')) {
				this.team.settings.showLocation = state;
			}

			if (attribute.includes('roster')) {
				this.team.settings.showRoster = state;
			}
		},
	},


	watch:
	{
		/**
		 * Watch all of the keys in the team object for changes
		 * Once this.saved is falsey, the save button will be enabled
		 */
		'team' : { handler : function() { this.saved = false }, deep: true },
	},


	ready()
	{
		// create backup of original
	  this.$set('backup', JSON.parse(JSON.stringify(this.team))); 

	  // initialize plugins now that DOM is ready
		this.init_dropzone_pic();
		this.init_dropzone_backdrop();
		this.init_switches();
		this.enableTypeahead = true;
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
	justify-content space-between
	max-width 775px
	.left
		display flex
		flex-flow row nowrap
		align-items center
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
	.right
		display flex
		flex-flow row nowrap
		align-items flex-end
		.discard
			color rc_med_gray
			font-size 15px
			float right
			&:hover
				color rc_dark_gray
				cursor pointer
		
.settings-nav
	width 185px
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
				color black
				&:hover
					cursor default
					border-left 2px solid rc_super_lite_gray
					color black
			&.danger-zone
				color rc_red
				transition all 150ms ease
				border-left-color rgba(201, 0, 25, 0.1)
				&:hover
					color rc_red_hover
					border-left 4px solid rgba(201, 0, 25, 0.4)
					transition all 150ms ease
				&.--active
					border-left 2px solid rc_super_lite_gray
					color black
			&:hover
				cursor pointer
				border-left 4px solid rc_lite_gray
				transition all 150ms ease
				color link_blue_hover

.settings-wrapper
	display flex
	flex-flow row wrap
	width 590px
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
	.stat-selector
		&:last-child
			margin-left 10px
	.stat-selector-wrapper
		margin-top 25px
	.stats-overflow
		margin-top 0
		
		
		
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


.settings-container
	display flex
	flex-flow row wrap
	align-content flex-start
	width 100%
	.settings-entry
		display flex
		flex-flow row nowrap
		justify-content space-between
		align-items center
		width 100%
		border-bottom 1px solid rc_super_lite_gray
		padding 17px 0
		max-height 65px
		+the-first-one()
			margin-top 0
			padding-top 0
		+the-last-one()
			border-bottom 0
			padding-bottom 0
		.switch
			display flex
			flex-flow row nowrap
			align-items center
			justify-content flex-end
		.description
			font-size 17px
			
	
	
	

			
					
	
</style>