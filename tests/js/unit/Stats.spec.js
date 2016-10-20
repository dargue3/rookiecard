import Vue from 'vue'

describe("Stats.vue", function() {

	var vm;
	var data;
	var Stats;

	// instantiate new Vue instance every test
	beforeEach(function() {
		Stats = require('./../../../resources/assets/js/components/Stats.vue');
		data = Stats.data();

		vm = new Vue({
	      template: '<div><test></test></div>',
	      components: { 'test' : Stats },
    }).$mount();
	});

  it('should have data', function () {
      expect(typeof Stats.data).toBe('function');
  });


  it('should initialize ', function () {
  	data.rawStats = [];
  	data.players = [];
  	data.statKeys = ['pts', 'ast'];
  	data.total = false
  	data.type = 'teamRecent';
  	data.sport = 'basketball';

  	expect(typeof data.valLookup).toBe('object');
  	expect(data.sport).toEqual('basketball');

  	// compile the stats
  	Stats.methods.compileStats()

  	// give it time to asynchronously compile the data down
  	setTimeout(function() {


  		expect(data.valLookup.length).toEqual(2)
  		expect(typeof data.valLookup.pts).toBe('function')
  		expect(typeof data.valLookup.ast).toBe('function')
  		expect(typeof data.keyClassLookup.pts).toBe('function')
  		expect(typeof data.keyClassLookup.ast).toBe('function')
  		expect(typeof data.valClassLookup.pts).toBe('function')
  		expect(typeof data.valClassLookup.ast).toBe('function')
  		expect(typeof data.keyNames.pts).toBe('function')
  		expect(typeof data.keyNames.ast).toBe('function')
  		expect(data.sortOrders.pts).toEqual(-1)
  		expect(data.sortOrders.ast).toEqual(-1)

  		expect(data.stats.length).toEqual(1);
  		expect(data.stats[0].pts).toEqual(null);

  	}, 50)
  });

    
});