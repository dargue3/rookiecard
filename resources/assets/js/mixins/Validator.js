/**
 * Validator mixin inspired by Laravel's Validator API
 *
 * Example variables:
 * 		'players'
 * 		'location.city.zip'
 * 		'players.*.email'
 * 		'players.*.name.firstname'
 *
 * Example rules (definitions below):
 * 		'required|max:15'
 * 		'email'
 * 		'required|alpha_num'
 */
export default
{
	data()
	{
		return {
			vars_: {},
			errors: {},
			errMsg_: {},
			validRules_: {
				required: 		function(args) { return this.required_(args) },		// the field needs to have something in it
				max: 			function(args) { return this.max_(args) }, 			// the field must be less than a given argument in length or size
				min: 			function(args) { return this.min_(args) }, 			// the field must be greater than a given argument in length or size
				size: 			function(args) { return this.size_(args) }, 		// the field must be of a given size in length or value
				same: 			function(args) { return this.same_(args) }, 		// the field must equal to a given value
				in: 			function(args) { return this.in_(args) }, 			// the field must equal one of the given arguments
				alpha_num: 		function(args) { return this.alpha_num_(args) },  	// the field must be a string with only alphanumeric characters
				email: 			function(args) { return this.email_(args) }, 		// the field must be a valid email
			},
			value_: null, 		// the value of the variable in question
			variable_: null, 	// the full path of the variable (e.g. user.name.firstname)
			root_: null, 		// the name of the root of the variable (e.g. user)
			rules_: null, 		// the rules applied to this variable
			messages_: null, 	// the error messages to set
			count_: null,		// the index into the array counter
			isArray_: null,		// whether or not the given variable is an array
			temp_: {}, 			// temporary useless variable to utilize $set functionality
		}
	},

	methods:
	{
		/**
		 * Register a given variable for error checking against given rules
		 * 
		 * @param {string} variable The variable being registered for error checking		
		 * @param {string} rules    Rules that should be applied to the variable
		 * @param {array} messages  Error messages (1 to 1 with given rules)
		 * @param {boolean} watch  	Whether or not to run error checking when the variable changes
		 */
		registerErrorChecking(variable, rules, messages, watch = true)
		{
			this.variable_ = variable;
			this.root_ = variable;
			this.rules_ = rules;
			this.messages_ = messages;
			this.count_ = 0;
			this.isArray_ = false;
			this.indices_ = '';

			// variable could have various indices beyond just the parent
			var varArray = variable.split('.');
			if (varArray.length > 1) {

				this.root_ = varArray[0];

				if (varArray[1] === '*') {
					// dealing with an array
					this.isArray_ = true;
					this.indices_ = ''

					if (varArray.length > 2) {
						// variable looks like 'players.*.name.firstname', save the index past the 'name.firstname'
						this.indices_ = varArray.slice(2).join('.');
					}
	
					this.variable_ = this.root_ + '.' + this.indices_;
					this.register_();
				}
				else {
					// variable looks like 'player.name'
					this.indices_ = varArray.slice(1).join('.');
					this.register_();
				}
			}
			else {
				// otherwise looks like 'player'
				this.register_();
			}

			if (watch) {
				// whenever this variable changes, re-run the error check
				this.$watch(this.root_, function() { this.errorCheck(this.root_) });
			}
		},


		/**
		 * Register the saved attributes for error checking
		 */
		register_()
		{
			if (typeof this.vars_[this.root_] === 'undefined') {
				// new entry
				this.$set('vars_.' + this.root_, {
					rules: [this.addRules()],
					isArray: this.isArray_,
					indices: [this.indices_]
				});
			}
			else {
				// add these rules
				this.checkIfWasPreviouslyAnArray();
				this.vars_[this.root_].rules.push(this.addRules());
				this.vars_[this.root_].indices.push(this.indices_);
			}

			if (! this.isArray_) {
				// initialize errors to an empty string
				this.$set('errors.' + this.variable_, '');
			}

			else {
				// initialize errors to array of empty strings
				this.initializeErrorArray();
			}
		},



		/**
		 * Format the rules and store for this variable
		 */
		addRules()
		{
			var formatted = {};
			var ruleArray = this.rules_.split('|');

			if (this.messages_.length !== ruleArray.length) {
				throw "Pass in an error message for each rule"
			}

			for (var rule in ruleArray) {
				// could have an argument, like 'max:18'
				var argumentsArray = ruleArray[rule].split(':');

				this.validateRule(argumentsArray[0]);

				// save the error message for this rule
				this.$set('errMsg_.' + this.variable_ + '.' + argumentsArray[0], this.messages_[this.count_]);
				this.count_++;
 
				if (argumentsArray.length > 1) {
					// attach as array of arguments
					var args = argumentsArray[1].split(','); 
					for (var arg in args) {
						// if they're able to convert to integers, do so
						if (parseFloat(args[arg])) {
							args[arg] = parseFloat(args[arg]);
						}
					}
					formatted[argumentsArray[0]] = args;
				}
				else {
					// attach no arguments
					formatted[argumentsArray[0]] = [];
				}
			}

			return formatted;
		},


		initializeErrorArray()
		{
			// initialize errors to array of empty strings
			this.value_ = this.$get(this.root_);

			if (typeof this.errors[this.root_] === 'undefined') {
				this.errors[this.root_] = [];
			}

			// create an error message for each index
			// like: errors.players[x].name.firstname
			for (var x = 0; x < this.value_.length; x++) {
				this.$set('temp_.' + this.indices_, ''); // looks like name.firstname
				if (typeof this.errors[this.root_][x] === 'undefined') {
					// new entry
					this.errors[this.root_].$set(x, this.temp_);
				}
				else {
					// copy over existing content and add new index
					this.errors[this.root_][x] = Object.assign(this.errors[this.root_][x], this.temp_);
				}
			}
		},


		addArrayErrorIndex(variable)
		{
			this.root_ = variable;

			// initialize errors to array of empty strings
			this.value_ = this.$get(this.root_);

			if (typeof this.errors[this.root_] === 'undefined') {
				throw "'" + variable + "' has not been registered for error checking yet";
				return;
			}	

			for (var x = 0; x < this.value_.length; x++) {
				if (typeof this.errors[this.root_][x] === 'undefined') {
					// new entry
					this.errors[this.root_][x] = this.errors[this.root_][0];
				}
			}
		},


		/**
		 * Make sure the given rule is valid before assigning it
		 *
		 * @param {string} rule
		 */
		validateRule(rule)
		{
			if(! (rule in this.validRules_)) {
				if (rule === '') {
					throw "There is a trailing '|' or duplicate '||' in the rules for " + this.variable_;
				}
				else {
					throw "'" + rule + "' is not a valid rule";
				}
			}
		},


		checkIfWasPreviouslyAnArray()
		{
			if (this.isArray_ && ! this.vars_[this.root_].isArray) {
				throw "'" + this.variable_ + "' was not previously registered as an array"
				return;
			}
			else if (! this.isArray_ && this.vars_[this.root_].isArray) {
				throw "'" + this.variable_ + "' was already saved for error checking as an array"
				return;
			}
		},


		/**
		 * Run error checks on a given variable
		 *
		 * @param {string} variable
		 */
		errorCheck(variable = null)
		{
			var errors = 0;
			if (variable === null) {
				errors = this.errorCheckAll();
			}

			errors = this.errorCheckSpecific(variable);

			return errors;

			// if (errors > 0) {
			// 	return false;
			// }
			// else {
 		//  		return true;
			// }
		},


		/**
		 * Check all registered variables for errors
		 */
		errorCheckAll() 
		{
			var errors = 0;
			for (var variable in this.vars_) {
				this.variable_ = variable;
				this.value_ = this.$get(variable);

				for (var rule in this.vars_[variable].rules) {
					if (! this.validRules_[rule].call(this, this.vars_[variable].rules[rule])) {
						errors++;
						this.setError_(rule);
						break; // no sense in continuing if it has failed a check already
					}
					else {
						this.clearError_();
					}
				}
			}

			return errors;
		},


		/**
		 * Check only one given variable for errors
		 * Accepts 'players' to check all indices,
		 * or specific indices like 'players.*.email' or 'location.city.zip'
		 *
		 * @param {string} variable 
		 */
		errorCheckSpecific(variable)
		{
			variable = variable.split('.');
			this.root_ = variable[0];

			if (! this.checkRootWasRegistered()) {
				return 1;
			}

			if (variable.length > 1) {
				if (this.checkIfArray(variable)) {
					return this.errorCheckArray(variable)
				}

				this.indices_ = variable.splice(1).join('.');

				var index = this.vars_[this.root_].indices.indexOf(this.indices_);

				return this.checkSpecificIndex(index);
			}
			else {
				this.indices_ = '';
				this.variable_ = this.root_;
				return this.checkAllIndices();
			}
		},


		/**
		 * Check if the given variable is an array
		 *
		 * @param {string} variable 
		 */
		checkIfArray(variable)
		{
			return false;
		},


		/**
		 * Run error checks on just a specific index of the root variable
		 *
		 * @param {int} index
		 */
		checkSpecificIndex(index)
		{
			if (! this.checkIndexWasRegistered(index)) {
				return 1;
			}

			this.variable_ = this.root_ + '.' + this.indices_;
			this.value_ = this.$get(this.variable_);

			var rules = this.vars_[this.root_].rules[index];

			return this.runErrorCheckOnRules(rules);
		},


		/**
		 * Loop through and check all of the regsitered indices
		 */
		checkAllIndices()
		{
			// loop through array of rule objects
			var errors = 0;
			for (var index = 0; index < this.vars_[this.root_].indices.length; index++) {
				// run a set of rules and save outcome
				errors += this.checkSpecificIndex(index);
			}

			return errors;
		},


		/**
		 * Check that the root variable was registered for error checking
		 */
		checkRootWasRegistered()
		{
			if (! (this.root_ in this.vars_)) {
				throw "'" + this.root_ + "' was never registered for error checking";
				return false;
			}

			return true;
		},


		/**
		 * Check that the given index is valid
		 *
		 * @param {int} index  The index into vars_.root_.indices that this error check takes place on
		 */
		checkIndexWasRegistered(index)
		{
			if (index === -1) {
				throw "The index '" + this.indices_ + "' was never registered for error checking on '" + this.root_ + "'";
				return false;
			}

			return true;
		},



		runErrorCheckOnRules(rules)
		{
			var errors = 0;
			for (var rule in rules) {
				var args = rules[rule];
				if (! this.validRules_[rule].call(this, args)) {
					errors++;
					this.setError_(rule);
					break; // no sense in continuing if it has failed a check already
				}
				else {
					this.clearError_();
				}
			}

			return errors;
		},


		/**
		 * Set the error message according to the rule that the variable has broken
		 *
		 * @param {string} rule 
		 */
		setError_(rule, index = null)
		{
			if (index === null) {
				var error = this.$get('errMsg_.' + this.variable_ + '.' + rule);
				this.$set('errors.' + this.variable_, error);
			}
		},


		/**
		 * Clear the errors for the variable
		 */
		clearError_(index = null)
		{
			if (index === null) { 
				this.$set('errors.' + this.root_  + '.' + this.indices_, '');
			}
			else {
				this.$set('temp_.' + this.indices_, '');
				this.errors.$set(index, this.temp_);
			}
		},


		/**
		 * The given method could not give a valid answer about the error status
		 *
		 * @param {string} method
		 */
		uncertainInput(method)
		{
			throw "Having a hard time resolving '" + this.variable_ + "' for rule '" + method + "'";

			return false;
		},


		/**
		 * The variable must have something inside it
		 */
		required_()
		{
			if (typeof this.value_ === 'undefined') {
				return false;
			}

			if (typeof this.value_ === 'number') {
				return true;
			} 

			if (typeof this.value_ === 'string') {
				return this.value_.length > 0;
			}

			return this.uncertainInput('required');
		},

		/**
		 * The variable must be greater than a given value in size or length
		 */
		max_(args)
		{
			if (typeof this.value_ === 'number') {
				return this.value_ <= args[0];
			}
			
			if (typeof this.value_ === 'string') {
				return this.value_.length <= args[0];
			}

			if (typeof this.value_ === 'object') {
				return this.value_.length <= args[0];
			}

			return this.uncertainInput('max');
		},


		/**
		 * The variable must be less than a given value in size or length
		 */
		min_(args)
		{
			if (typeof this.value_ === 'number') {
				return this.value_ >= args[0];
			}
			
			if (typeof this.value_ === 'string') {
				return this.value_.length >= args[0];
			}

			if (typeof this.value_ === 'object') {
				return this.value_.length >= args[0];
			}

			return this.uncertainInput('max');
		},


		/**
		 * The field must equal one of the given arguments
		 */
		in_(args)
		{
			if (args.indexOf(this.value_) === -1) {
				return false;
			}

			return true;
		},


		/**
		 * The variable must be of a given size
		 */
		size_(args)
		{
			if (typeof this.value_ === 'number') {
				return this.value_ === args[0];
			}
			
			if (typeof this.value_ === 'string') {
				return this.value_.length === args[0];
			}

			if (typeof this.value_ === 'object') {
				return this.value_.length === args[0];
			}

			return this.uncertainInput('size');
		},


		/**
		 * The variable must match a given regular expression
		 */
		reg_ex_(expression)
		{
			if (! this.value_.match(expression)) {
				return false;
			}
			else {
				return true;
			}
		},


		/**
		 * The variable must be a valid email address
		 */
		email_()
		{
			return this.reg_ex_(/^[-a-z0-9~!$%^&*_=+}{\'?]+(\.[-a-z0-9~!$%^&*_=+}{\'?]+)*@([a-z0-9_][-a-z0-9_]*(\.[-a-z0-9_]+)*\.(aero|arpa|biz|com|coop|edu|gov|info|int|mil|museum|name|net|org|pro|travel|mobi|[a-z][a-z])|([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}))(:[0-9]{1,5})?$/i);
		},


		/**
		 * The variable must be a string with only alphanumeric characters
		 */
		alpha_num_()
		{
			return this.reg_ex_(/^[a-zA-Z0-9]+$/);
		},
	},
}