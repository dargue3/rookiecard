<template>
	<template>
		<label>Primary</label>
	  <select data-style="btn-select btn-lg" EditUser="positions[0]" class="selectpicker form-control show-tick"
	  				multiple :data-max-options="maxOptions" v-model="model">
	    <option v-for="position in positions" :value="position">{{ position | uppercase }}</option>    
	  </select>
	</template>
</template>

<script>

export default  {
	
	name: 'SelectPicker',

	props: ['model', 'maxOptions', 'options'],

	data() {
		
		return {

		}
	},

	created()
	{

	},

	computed:
	{
		
	},

	methods:
	{
		
	}, 

};

</script>

<style lang="stylus">
	
@import '/resources/assets/stylus/variables.styl'
	

</style>