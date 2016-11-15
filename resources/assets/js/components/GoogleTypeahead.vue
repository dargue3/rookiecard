
<template>
	<div>
			<label>{{ label }}</label>
			<input id="placeSearch" type="text" class="form-control"
							:class="{'form-error' : error}" v-model="location">
			<span v-show="error" class="form-error">{{ error }}</span>
	</div>
</template>

<script>

export default  {
	
	name: 'GoogleTypeahead',

	props: ['city', 'long', 'lat', 'timezone', 'label', 'error'],

	data()
	{
		return {
			location: '',
			selected: false,
		}
	},

	watch()
	{
		city()
		{
			if (! this.selected) {
				this.location = this.city + ', United States'
			}
		}
	},

	created()
	{
		// if city is already filled in when starting, default the v-model to that value
		if (this.city) {
			this.location = this.city + ', United States'
		}
	},

	events:
	{
		GoogleTypeahead_tz(response)
		{
			this.timezone = response.data.timeZoneId;
		},
	},

	methods:
	{
		/**
		 * Parse out the latitude, longitude, and City, State format of address
		 */
		placeSelected(place)
		{
			var address = place.formatted_address.split(',');
			this.city = address[0] + ', ' + address[1][1] + address[1][2];
			this.lat = Math.round(place.geometry.location.lat() * 10000) / 10000;
			this.long = Math.round(place.geometry.location.lng() * 10000) / 10000;
			this.selected = true;

			this.fetchTimezone();
		},


		/**
		 * Use newly found lat and long to fetch the timezone string
		 */
		fetchTimezone()
		{
			let url = `https://maps.googleapis.com/maps/api/timezone/json?location=${this.lat},${this.long}&key=AIzaSyB1owCjwNQ_oRU2mDULAPLDj5oEdu-xj9c&timestamp=${moment().unix()}`;
			this.$root.get(url, 'GoogleTypeahead_tz', null, null, {headers: {}});
		}
	},

	ready()
	{
		var self = this;
		$(function() {
			// when the page is loaded, init google maps api
			var input = document.getElementById('placeSearch');
			var options = {
			  types: ['(cities)'],
			  componentRestrictions: {country: "us"}
			};
			var autocomplete = new google.maps.places.Autocomplete(input, options);

			// set up listener, tell this.placeSelected when there was a selection
			autocomplete.addListener('place_changed', function() {
				self.placeSelected(autocomplete.getPlace());
			});
		})
	},

};

</script>

<style lang="stylus">
	
@import '/resources/assets/stylus/variables.styl'
	

</style>