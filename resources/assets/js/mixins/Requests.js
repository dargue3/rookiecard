export default
{
	data()
	{
		return {
			outstanding: {
				gets: [],
				posts: [],
				puts: [],
				deletes: [],
			},
		}
	},


	methods:
	{
		// send a GET request with the given parameters
		// execute the given event string when finished
		get(url, successEvent = null, data = [], failEvent = null, options = {}, allowMultiple = false)
		{
			var self = this;

			if (! options.headers) {
				options.headers = {'X-CSRF-TOKEN' : $('#_token').attr('value')};
			} 

			if (! allowMultiple && this.outstanding.gets.indexOf(url) !== -1) {
				// there is already a GET request to this url outstanding
				return;
			}

			this.outstanding.gets.push(url);

			this.$http.get(url, data, options)
				.then(function(response)
				{
					this.requestFinished('gets', url);

					if (response.data.ok === false) {
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
					this.requestFinished('gets', url);

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
		post(url, successEvent = null, data = [], failEvent = null, options = {}, allowMultiple = false)
		{
			var self = this;

			if (! options.headers) {
				options.headers = {'X-CSRF-TOKEN' : $('#_token').attr('value')};
			} 

			if (! allowMultiple && this.outstanding.posts.indexOf(url) !== -1) {
				// there is already a GET request to this url outstanding
				return;
			}

			this.outstanding.posts.push(url);

			this.$http.post(url, data, options)
				.then(function(response)
				{
					this.requestFinished('posts', url);

					if (response.data.ok === false) {
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
					this.requestFinished('posts', url);

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
		put(url, successEvent = null, data = [], failEvent = null, options = {}, allowMultiple = false)
		{
			var self = this;

			if (! options.headers) {
				options.headers = {'X-CSRF-TOKEN' : $('#_token').attr('value')};
			} 

			if (! allowMultiple && this.outstanding.puts.indexOf(url) !== -1) {
				// there is already a GET request to this url outstanding
				return;
			}

			this.outstanding.puts.push(url);

			this.$http.put(url, data, options)
				.then(function(response)
				{
					this.requestFinished('puts', url);

					if (response.data.ok === false) {
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
					this.requestFinished('puts', url);

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
		delete(url, successEvent = null, data = [], failEvent = null, options = {}, allowMultiple = false)
		{
			var self = this;

			if (! options.headers) {
				options.headers = {'X-CSRF-TOKEN' : $('#_token').attr('value')};
			} 

			if (! allowMultiple && this.outstanding.deletes.indexOf(url) !== -1) {
				// there is already a GET request to this url outstanding
				return;
			}

			this.outstanding.deletes.push(url);

			this.$http.delete(url, data, options)
				.then(function(response)
				{
					this.requestFinished('deletes', url);

					if (response.data.ok === false) {
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
					this.requestFinished('deletes', url);

					if (failEvent) {
						self.$broadcast(failEvent, response);
					}
					else {
						self.errorMsg(response);
					}
				});
		},

		/**
		 * A request has returned, remove this url from the list of outstanding requests
		 * Each verb has their own array
		 */
		requestFinished(verb, url)
		{
			let outstandingRequests = this.$get(`outstanding.${verb}`);
			let index = outstandingRequests.indexOf(url);
			while (index !== -1) {
				outstandingRequests.splice(index, 1);
				index = outstandingRequests.indexOf(url);
			}
		},
	},
}