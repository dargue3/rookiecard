// set up detection on stats tables for whether or not there is more data hidden and needs to be scrolled
// jQuery listeners wait for scroll, update overflow object in parent
export default {

	data() {
		return {
			overflowed: {},
		}
	},

	methods: {

		/**
		 * Checks to see if the first column of stats is overflowed and hidden
		 */
		isFirstCellHidden(element, container)
		{
    	let rect = element[0].getBoundingClientRect();
    	let threshold = container[0].getBoundingClientRect().left
    	//console.log(`left: ${rect.right}`);
    	//console.log(`threshold: ${threshold - rect.width}`);

    	return rect.right <= threshold;
		},


		/**
		 * Checks to see if the last column of stats is overflowed and hidden
		 */
		isLastCellHidden(element, container)
		{
			let rect = element[0].getBoundingClientRect();
			let threshold = container[0].getBoundingClientRect().left + container[0].getBoundingClientRect().width;
    	//console.log(`left: ${rect.left}`)
    	//console.log(`threshold: ${threshold}`)
    	return rect.left >= threshold;
    },


		// set up listeners to constantly check visibility on scroll
		attachScrollListener(element) {
			setTimeout(function() {
				var firstElement = $(element +  ' th:first-child');
				var lastElement = $(element +  ' th:last-child');
				var container = $(element);

				this.overflowed = {first: false, last: false};

				this.overflowed.last = this.isLastCellHidden(lastElement, container);

				var self = this;
				// listen for scroll, update the flag if now in view
				container.on('scroll', function() {
					self.overflowed.first = self.isFirstCellHidden(firstElement, container);
					self.overflowed.last = self.isLastCellHidden(lastElement, container);
				});
			}.bind(this), 50)
		}
	},


}


