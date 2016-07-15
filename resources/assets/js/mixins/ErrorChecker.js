export default
{
	data()
	{
		return {
			fields: {},
			errMsg: {},
			errors: {},
		}
	},

	methods:
	{
		/**
		 * Check all registered fields for errors
		 *
		 * Essentially it loops through all of the fields to be checked, each of
		 * the requirements within the fields contain a callable function, which is called
		 * to check for errors
		 *
		 * @param {string} key 			The field to error check
		 * @param {string} requirement 	The req. to check
		 */
		errorCheck(key = null, requirement = null)
		{
			var errors = 0;

			// for each of the registered fields
			for (var field in this.fields) {

				// if checking this key or none given
				if (key === field || key === null) {

					// for each of the requirements for this field
					for (var req in this.fields[field]) {

						// if checking this requirement or none given
						if (req === requirement || requirement === null) {

							// if this field is an array of values
							if (Array.isArray(this.fields[field][req])) {

								// loop through each entry and check for errors
								for (var index = 0; index < this.fields[field][req].length; index++) {

									// if there is an error, set it
									if (! this.fields[field][req][index].call(this, index)) {
										errors++;
										this.setError(field, this.errMsg[field][req], index);
										break;
									}

									// otherwise clear errors for this field
									else {
										this.clearError(field, index);
									}
								}
							}

							// otherwise check for errors
							else {

								// if there is an error, set it
								if (! this.fields[field][req].call(this)) {
									errors++;
									this.setError(field, this.errMsg[field][req]);
									break;
								}

								// otherwise clear errors for this field
								else {
									this.clearError(field);
								}
							}
						}
					}
				}
			}

			return errors;
		},


		/**
		 * Add a field to be error checked
		 * 
		 * To explain this, imagine adding error checking for a 'username' input field.
		 * The value of username should be stored in this.username
		 * Usernames should be under 18 characters but greater than 5. This looks like:
		 * addErrorCheck('username', 'max', function(username) { return username.length < 5 }, 'Use more characters')
		 * addErrorCheck('username', 'min', function(username) { return username.length > 18 }, 'Use less chracters')
		 *
		 * Note the functions should return false if there is an error
		 *
		 * If you add the same field and requirement more than once, it creates an array of errors and
		 * will pass in the index to the closure
		 * 
		 * @param {string} field 	The name of this variable in the parent
		 * @param {string} req 		The name of this check 
		 * @param {closure} closure The function that will run to check for errors (should return boolean)
		 * @param {string} msg 		The error to display
		 */
		registerErrorCheckingOnField(field, req, closure, msg, isArray = false)
		{
			// if this field hasn't been registered
			if (! (field in this.fields)) {
				this.fields[field] = {};
				this.errMsg[field] = {};
				this.errors[field] = '';
			}

			var exists = req in this.fields[field];

			// if this requirement doesn't exist for this field yet
			if (! exists && ! isArray) {
				this.fields[field][req] = closure;
				this.errMsg[field][req] = msg;
			}

			// otherwise make it an array, which will signal to check every index of this field
			else {
				if (exists) {
					var index = this.fields[field][req].length;
					this.errors[field].push('');
					this.fields[field][req][index] = closure;
					this.errMsg[field][req] = msg;
				}
				else {
					this.errors[field] = [''];
					this.fields[field][req] = [closure];
				}

				this.errMsg[field][req] = msg;
			}
			
			// attach a listener, when the variable changes it will check for errors again
			this.$watch(field, function() { this.errorCheck(field) });
		},


		removeErrorCheck(field, req = null) {
			if (req) {
				delete this.fields[field][req];
				delete this.errMsg[field][req];
			}
			else {
				delete this.fields[field];
				delete this.errMsg[field];
			}
		},


		/**
		 * Set the error message of a particular field to a given value
		 */
		setError(field, error, index = -1)
		{
			// have to do this weird copying technique for reactivity
			var tempErrors = JSON.parse(JSON.stringify(this.errors));

			if (index >= 0) {
				tempErrors[field][index] = error;
			}	
			else {
				tempErrors[field] = error;
			}

			this.errors = tempErrors;
		},


		clearError(field, index = -1)
		{
			this.setError(field, '', index);
		},
	},
}