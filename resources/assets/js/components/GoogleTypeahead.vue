
<template>
	<div>
			<label>{{ label }}</label>
			<input id="placeSearch" type="text" class="form-control">
	</div>
</template>

<script>

export default  {
	
	name: 'GoogleTypeahead',

	props: ['city', 'long', 'lat', 'label'],

	methods: {

		//format the results into the necessary items
		placeSelected(place) {
			var city = place.address_components[0].long_name;
			var state = place.address_components[2].short_name;
			this.city = city + ', ' + state;
			this.long = place.geometry.access_points[0].location.lng;
			this.lat = place.geometry.access_points[0].location.lat;
		}
	},

	ready() {
		var self = this;
		$(function() {
			//when the page is loaded, init google maps api
			var input = document.getElementById('placeSearch');
			var autocomplete = new google.maps.places.Autocomplete(input);

			//set up listener, tell this.placeSelected when there was a selection
			autocomplete.addListener('place_changed', function() {
				var place = autocomplete.getPlace()
				self.placeSelected(place);
			});

		})
	},

};

</script>

<style lang="stylus">
	
@import '/resources/assets/stylus/variables.styl'
	

</style>