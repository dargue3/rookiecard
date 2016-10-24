export default
{
	data()
	{
		return {

		}
	},

	watch:
	{
		compile(val)
		{
			if (val) {
				this.setup();
			}
		},
	},


	methods:
	{
		setup()
		{
			// ignore some keys during stat inputs
			this.keys = this.keys.filter(key => this.ignore.indexOf(key) === -1);

			// add dnp if they aren't inputting minutes played
			if (this.keys.indexOf('min') === -1 && this.keys.indexOf('dnp') === -1) {
				this.keys.splice(1, 0, 'dnp');
			}
		
			this.calculatedKeys = this.calculated;

			this.keys.forEach(key => {
				this.keyNames[key] = this.lookupKeyNames(key);
				this.tooltips[key] = this.lookupTooltips(key);
				this.valueLookup[key] = this.lookupValue(key);
				this.valClassLookup[key] = this.lookupValClasses(key);
				this.defaultValues[key] = this.lookupDefaultValues(key);
			});

			this.sportSpecificErrorCheck = this.errorCheck();

			// tell EditStats.vue the data is ready, but after the data is definitely set in
			setTimeout(() => { this.$dispatch('EditStats_compiled') }, 25);
		},
	},
}