import Vue from 'vue'
import Stats from './../../../resources/assets/js/mixins/Stats.js'

describe("Stats", function() {

	var vm;

	// instantiate new Vue instance every test
	beforeEach(function() {
		vm = new Vue({
	      template: '<div></div>',
	      mixins: [ Stats ],
	    }).$mount();
	});

    it('should have data', function () {
        expect(typeof vm.teamMeta).toBe('object');
    });

    
});