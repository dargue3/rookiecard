// set up detection on stats tables for whether or not there is more data hidden and needs to be scrolled
// jQuery listeners wait for scroll, update overflow object in parent
export default {

	data() {
		return {
			overflowed: {},
			estimatedTotalWidth: undefined,
			avgWidthPerKey: 55, // avg width per stat key in pixels
		}
	},

	methods: {

		/**
		 * Checks to see if the first column of stats is overflowed and hidden
		 */
		isFirstCellHidden(element, container)
		{
			if (! element[0]) {
				return false;
			}
			
    	let rect = element[0].getBoundingClientRect();
    	let threshold = container[0].getBoundingClientRect().left

    	return rect.right <= threshold;
		},


		/**
		 * Checks to see if the last column of stats is overflowed and hidden
		 */
		isLastCellHidden(element, container)
		{
			if (! element[0]) {
				return false;
			}

			let rect = element[0].getBoundingClientRect();
			let threshold = container[0].getBoundingClientRect().left + container[0].getBoundingClientRect().width;
    	
    	if (rect.left == 0 && threshold == 0) {
    		// this means the stat table is currently hidden (user looking at different tab)
    		// best we can do is just guess until it is actually scrolled on
    		return this.guesstimate();
    	}
    	
    	return rect.left >= threshold;
    },


		// set up listeners to constantly check visibility on scroll
		attachScrollListener(element) {
			setTimeout(function() {
				let firstElement = $(element +  ' th:first-child');
				let lastElement = $(element +  ' th:last-child');
				let container = $(element);

				this.overflowed = {first: false, last: false};
				this.estimatedTotalWidth = this.statKeys.length * this.avgWidthPerKey;

				this.overflowed.last = this.isLastCellHidden(lastElement, container);

				let self = this;
				// listen for scroll, update the flag if now in view
				container.on('scroll', function() {
					self.overflowed.first = self.isFirstCellHidden(firstElement, container);
					self.overflowed.last = self.isLastCellHidden(lastElement, container);
				});
				$(window).on('resize', function() {
					self.overflowed.first = self.isFirstCellHidden(firstElement, container);
					self.overflowed.last = self.isLastCellHidden(lastElement, container);
				});
			}.bind(this), 50)
		},


		/**
		 * If the stats table isn't in view, estimate whether or not to show the last-cell scroll indicator
		 */
		guesstimate()
		{
			if ($(window).width() >= this.estimatedTotalWidth) {
				return false;
			}

			return true;
		},
	},


}


