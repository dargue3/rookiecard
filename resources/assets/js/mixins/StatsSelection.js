export default {

	data() {
		return {
			//optional stats inputted by user
			userStatsList: {},

			//stats calculated by rookiecard
			rcStatsList: {},

			//the pre-selected ones for user inputs
			userSelected: [],

			//the pre-selected ones for rc calculated
			rcSelected: [],

			//array of the keys of the objects
			userStatKeys: [],
			rcStatKeys: [],
		}
	},

	methods: {

		initSelections(sport) {
			this.getStatsBySport(sport);
		},

		//calculates which stats are disabled or not
		setDependencies() {
			var stats = this.rcStatsList;

			//loop through all the keys, check their dependencies and enable/disable
			for(var key in stats) {		
				var disabled = false;
				for(var x = 0; x < stats[key].req.length; x++) {
					//check that the required stats are already checked
					var req = stats[key].req[x];
					if(this.userSelected.indexOf(req) === -1 && this.rcSelected.indexOf(req) === -1) {
						//they don't have all the requirements needed for this statistic, disable the option
						disabled = true;
			
						//uncheck on the picker if it's selected already
						var index = this.userSelected.indexOf(key);
						if(index !== -1)
							this.userSelected.splice(index, 1);
						var index = this.rcSelected.indexOf(key);
						if(index !== -1)
							this.rcSelected.splice(index, 1);
					}
				}
				stats[key].disabled = disabled;		
			}
			this.rcStatsList = stats;


			setTimeout(function() {
				this.$dispatch('renderSelectPicker');
			}.bind(this), 50)
			
		},

		//request all the stat columns for this sport from the server
		getStatsBySport(sport) {
			var url =  this.prefix + 'stats/' + sport;
			var self = this;
			this.$http.get(url)
				.then(function(response) {
					self.userStatsList = response.data.user;
					self.rcStatsList = response.data.rc;
					self.userSelected = response.data.userSelected;
					self.rcSelected = response.data.rcSelected;
					self.userStatKeys = Object.keys(response.data.user);
					self.rcStatKeys = Object.keys(response.data.rc)
					self.setDependencies();
					setTimeout(function() {
						self.$dispatch('initSelectPicker');
					}, 50)
				})
				.catch(function() {
					self.$root.banner('bad', 'There was a server problem, try refreshing the page before continuing');
				})
		},
	},
}















