
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

	props: ['city', 'long', 'lat', 'label', 'error'],

	data()
	{
		return {
			location: '',
			selected: false,
		}
	},

	watch:
	{
		//if they have edited something previously selected, reset the data
		location(val)
		{
			if(this.selected) {
				this.selected = false;
				this.city = '';
				this.lat = '';
				this.long = '';
			}
		}
	},

	methods:
	{
		//format the results into the necessary items
		placeSelected(place)
		{
			var address = place.formatted_address.split(',');
			this.city = address[0] + ', ' + address[1][1] + address[1][2];
			this.lat = place.geometry.location.lat();
			this.long = place.geometry.location.lng();
			this.selected = true;
		}
	},

	ready()
	{
		var self = this;
		$(function() {
			//when the page is loaded, init google maps api
			var input = document.getElementById('placeSearch');
			var options = {
			  types: ['(cities)'],
			  componentRestrictions: {country: "us"}
			 };
			var autocomplete = new google.maps.places.Autocomplete(input, options);

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