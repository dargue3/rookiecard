//set up detection on stats tables for whether or not there is more data hidden and needs to be scrolled
//jQuery listeners wait for scroll, update overflow object in parent
export default {

	data() {
		return {
			overflowed: {
				
			},
		}
	},

	methods: {

		//checks to see if that element is visible on screen or not
		isHidden(element) {
	    element = element[0];
	    var rect = element.getBoundingClientRect();
	    return !(
	        rect.top >= 0 &&
	        rect.left >= 0 &&
	        rect.bottom <= ($(window).innerHeight() || $(window).height()) &&
	        rect.right <= ($(window).innerWidth() || $(window).width()) 
	    );
		},


		//set up listeners to constantly check visibility on scroll
		attachScrollListener(element, overflowIndex) {
			var firstElement = $(element +  ' th:first-child');
			var lastElement = $(element +  ' th:last-child');
			var parent = $(element);

			this.$set('overflowed.' + overflowIndex, {first: false, last: false});

			this.overflowed[overflowIndex].last = this.isHidden(lastElement);

			var self = this;
			//listen for scroll, update the flag if now in view
			parent.on('scroll', function() {
				self.overflowed[overflowIndex].first = self.isHidden(firstElement);
				self.overflowed[overflowIndex].last = self.isHidden(lastElement);
			});

		}
	},


}


