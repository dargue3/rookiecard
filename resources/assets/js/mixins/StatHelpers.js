export default {
	methods:
	{
		/**
		 * Given a part and a whole, calculate the percentage
		 *
		 * @param {int | float} part 		The small number
		 * @param {int | float} whole		The bigger number
		 * @param {int} precision  			The amount of digits past the decimal place
		 * @return {float}
		 */
		percentage(part, whole, precision = 1)
		{
			return this.average(part * 100, whole, precision)
		},


		/**
		 * Return an average of total based on the count
		 * 
		 * @param {int | float} total  	The total
		 * @param {int | float} count   Over how many iterations
		 * @param {int} precision  			The amount of digits past the decimal place
		 * @return {float}
		 */
		average(total, count, precision = 1)
		{
			let avg = total / count;
			if (isNaN(avg)) {
				avg = null;
			}

			return this.round(avg, precision);
		},


		/**
		 * Round a number to a given precision past the decimal place
		 *
		 * @param {float} number
		 * @param {int} precision
		 */
		round(number, precision = 1)
		{
			if (number !== null) {
				precision = Math.pow(10, precision);
				return Math.round(number * precision) / precision;
			}
			else {
				return null
			}
		},


		/**
		 * Makes sure any falsey values are replaced with a '-' filler
		 *
		 * @param {int | float} val
		 */
		lastCheck(val)
		{
			if (val === null) {
				return '-'
			}
			if (typeof val !== 'string' && isNaN(val)) {
				return '-';
			}

			return val;
		},


		/**
		 * Make sure that percentages are valid
		 * Used during stat editing to tell the user they made a mistake
		 *
		 * @param {float} percentage
		 * @return {float | string} 
		 */
		checkPercentage(percentage)
		{
			if (percentage > 100) {
				return 'ERROR'
			}

			return percentage;
		},
	},
}