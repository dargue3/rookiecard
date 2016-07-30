export default {
	data()
	{
		return {

		}
	},

	methods: 
	{
		/**
		 * Given a part and a whole, calculate the percentage
		 *
		 * @param {int} part
		 * @param {int} whole
		 * @param {int} precision  The amount of digits past the decimal place
		 * @return {float}
		 */
		percentage(part, whole, precision = 1)
		{
			return this.average(part * 100, whole, precision)
		},


		/**
		 * Return an average of total based on the count
		 * 
		 * @param {int} total  		The number being averaged
		 * @param {int} count   	How many times it occured
		 * @param {int} precision  	The amount of digits past the decimal place
		 * @return {float}
		 */
		average(total, count, precision = 1)
		{
			return this.round(total / count, precision);
		},


		/**
		 * Round a given number to a given precision past the decimal place
		 *
		 * @param {float} number
		 * @param {int} precision
		 */
		round(number, precision = 1)
		{
			precision = Math.pow(10, precision);

			return Math.round(number * precision) / precision;
		},
	},
}