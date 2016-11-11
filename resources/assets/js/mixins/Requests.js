export default
{
	methods:
	{
		// send a GET request with the given parameters
		// execute the given event string when finished
		get(url, successEvent = null, data = [], failEvent = null)
		{
			var self = this;
			this.$http.get(url, data)
				.then(function(response)
				{
					if (! response.data.ok) {
						throw response.data.error
					}

					if (successEvent) {
						if (successEvent.includes('App_')) {
							self.$emit(successEvent, response);
						}
						else {
							self.$broadcast(successEvent, response);
						}
					}
				})
				.catch(function(response)
				{
					if (failEvent) {
						self.$broadcast(failEvent, response);
					}
					else {
						self.errorMsg(response);
					}
				});
		},


		// send a POST request with the given parameters
		// execute the given event string when finished
		post(url, successEvent = null, data = [], failEvent = null)
		{
			var self = this;
			this.$http.post(url, data)
				.then(function(response)
				{
					if (! response.data.ok) {
						throw response.data.error
					}

					if (successEvent) {
						if (successEvent.includes('App_')) {
							self.$emit(successEvent, response);
						}
						else {
							self.$broadcast(successEvent, response);
						}
					}
				})
				.catch(function(response)
				{
					if (failEvent) {
						self.$broadcast(failEvent, response);
					}
					else {
						self.errorMsg(response);
					}
				});
		},


		// send a PUT request with the given parameters
		// execute the given event string when finished
		put(url, successEvent = null, data = [], failEvent = null)
		{
			var self = this;
			this.$http.put(url, data)
				.then(function(response)
				{
					if (! response.data.ok) {
						throw response.data.error
					}

					if (successEvent) {
						if (successEvent.includes('App_')) {
							self.$emit(successEvent, response);
						}
						else {
							self.$broadcast(successEvent, response);
						}
					}
				})
				.catch(function(response)
				{
					if (failEvent) {
						self.$broadcast(failEvent, response);
					}
					else {
						self.errorMsg(response);
					}
				});
		},


		// send a DELETE request with the given parameters
		// execute the given event string when finished
		delete(url, successEvent = null, data = [], failEvent = null)
		{
			var self = this;
			this.$http.delete(url, data)
				.then(function(response)
				{
					if (! response.data.ok) {
						throw response.data.error
					}

					if (successEvent) {
						if (successEvent.includes('App_')) {
							self.$emit(successEvent, response);
						}
						else {
							self.$broadcast(successEvent, response);
						}
					}
				})
				.catch(function(response)
				{
					if (failEvent) {
						self.$broadcast(failEvent, response);
					}
					else {
						self.errorMsg(response);
					}
				});
		},
	},
}