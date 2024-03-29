import Vue from 'vue'
import Validator from './../../../resources/assets/js/mixins/Validator.js'

describe("Validator", function() {

	var vm;

	// instantiate new Vue instance every test
	beforeEach(function() {
		vm = new Vue({
	      template: '<div></div>',
	      mixins: [ Validator ],
	    }).$mount();
	});
	
    it('has a valid rules object', function () {
        expect(typeof vm.validator_.validRules).toBe('object');
    });

    it('has a rules object which contains functions', function () {
    	for (var rule in vm.validator_.validRules) {
    		expect(typeof vm.validator_.validRules[rule]).toBe('function');
    	}
    });

    it('has a "required" rule that makes sure a variable is not empty', function() {
    	vm.validator_.value = '';
    	expect(vm.required_()).toBeFalsy();

    	vm.validator_.value = 1;
    	expect(vm.required_()).toBeTruthy();

    	vm.validator_.value = 'test';
    	expect(vm.required_()).toBeTruthy();

    	vm.validator_.value = true;
    	expect(vm.required_()).toBeTruthy();

    	vm.validator_.value = null;
    	expect(vm.required_).toThrow();
    });


    it('has a "max" rule that returns true if a variable is less than or equal to a given number in size or length', function() {
    	var arg = [10];

    	vm.validator_.value = '';
    	expect(vm.max_(arg)).toBeTruthy();

    	vm.validator_.value = 9;
    	expect(vm.max_(arg)).toBeTruthy();

    	vm.validator_.value = 'testankljahsdf022r';
    	expect(vm.max_(arg)).toBeFalsy();

    	vm.validator_.value = 9;
    	expect(vm.max_(arg)).toBeTruthy();
    });


    it('has a "min" rule that returns true if a variable is greater than or equal to a given number in size or length', function() {
    	var arg = [10];

    	vm.validator_.value = 'Boy, I sure do love tests';
    	expect(vm.min_(arg)).toBeTruthy();

    	vm.validator_.value = 11;
    	expect(vm.min_(arg)).toBeTruthy();

    	vm.validator_.value = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
    	expect(vm.min_(arg)).toBeTruthy();

    	vm.validator_.value = 10;
    	expect(vm.min_(arg)).toBeTruthy();

    	vm.validator_.value = 'fails';
    	expect(vm.min_(arg)).toBeFalsy();

    	vm.validator_.value = 9;
    	expect(vm.min_(arg)).toBeFalsy();

    	vm.validator_.value = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    	expect(vm.min_(arg)).toBeFalsy();
    });


    it('has a "size" rule that returns true if a variable is equal to a given size in length or value', function () {
    	var arg = [10];

    	vm.validator_.value = 'Ten chars!';
    	expect(vm.size_(arg)).toBeTruthy();

    	vm.validator_.value = 10;
    	expect(vm.size_(arg)).toBeTruthy();

    	vm.validator_.value = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    	expect(vm.size_(arg)).toBeTruthy();

    	vm.validator_.value = 'fails';
    	expect(vm.size_(arg)).toBeFalsy();

    	vm.validator_.value = 9;
    	expect(vm.size_(arg)).toBeFalsy();

    	vm.validator_.value = 11;
    	expect(vm.size_(arg)).toBeFalsy();

    	vm.validator_.value = [1, 2, 3];
    	expect(vm.size_(arg)).toBeFalsy();
    });

    it('has an "equals" rule that returns true if a variable is equal to a given argument', function () {
    	var arg = [10];

    	vm.validator_.value = 10;
    	expect(vm.equals_(arg)).toBeTruthy();

    	vm.validator_.value = '10';
    	expect(vm.equals_(arg)).toBeTruthy();

    	arg = ['test'];
    	vm.validator_.value = 'test';
    	expect(vm.equals_(arg)).toBeTruthy();

    	vm.validator_.value = '';
    	expect(vm.equals_(arg)).toBeFalsy();
    });


    it('has an "in" rule that returns true if a variable is one of the given arguments', function () {
    	var arg = [10, 'yep'];

    	vm.validator_.value = 10;
    	expect(vm.in_(arg)).toBeTruthy();

    	vm.validator_.value = 'yep';
    	expect(vm.in_(arg)).toBeTruthy();

    	vm.validator_.value = 11;
    	expect(vm.in_(arg)).toBeFalsy();

    	vm.validator_.value = '10';
    	expect(vm.in_(arg)).toBeFalsy();

    	vm.validator_.value = '';
    	expect(vm.in_(arg)).toBeFalsy();
    });


    it('has an "email" rule that returns true if a variable is a valid email', function () {
    	vm.validator_.value = 'tester@rookiecard.com';
    	expect(vm.email_()).toBeTruthy();

    	vm.validator_.value = '';
    	expect(vm.email_()).toBeTruthy();

    	vm.validator_.value = 'blah@gmail';
    	expect(vm.email_()).toBeFalsy();

    	vm.validator_.value = 10;
    	expect(vm.email_()).toBeFalsy();
    });


    it('has an "alpha_num" rule that returns true if a variable is comprised of only alphanumeric characters', function () {
    	vm.validator_.value = 'thebesttest';
    	expect(vm.alphaNum_()).toBeTruthy();

    	vm.validator_.value = 't3stsArEC00l';
    	expect(vm.alphaNum_()).toBeTruthy();

    	vm.validator_.value = 10;
    	expect(vm.alphaNum_()).toBeTruthy();

    	vm.validator_.value = 'd@ntheman!';
    	expect(vm.alphaNum_()).toBeFalsy();
    });


    it('has an "alpha_dash" rule that returns true if a variable is comprised of only alphanumeric characters and dashes + underscores', function () {
        vm.validator_.value = 'thebes_ttest';
        expect(vm.alphaDash_()).toBeTruthy();

        vm.validator_.value = 't3sts-ArE-C00l';
        expect(vm.alphaDash_()).toBeTruthy();

        vm.validator_.value = 10;
        expect(vm.alphaDash_()).toBeTruthy();

        vm.validator_.value = 'd@n_theman!';
        expect(vm.alphaDash_()).toBeFalsy();
    });


    it('has a "boolean" rule that returns true if a variable is a boolean', function () {
    	vm.validator_.value = true;
    	expect(vm.boolean_()).toBeTruthy();

    	vm.validator_.value = false;
    	expect(vm.boolean_()).toBeTruthy();

    	vm.validator_.value = 10;
    	expect(vm.boolean_()).toBeFalsy();

    	vm.validator_.value = 'test';
    	expect(vm.boolean_()).toBeFalsy();
    });


    it('has an "array" rule that returns true if a variable is an array', function () {
    	vm.validator_.value = [];
    	expect(vm.array_()).toBeTruthy();

    	vm.validator_.value = [1, 2, 3];
    	expect(vm.array_()).toBeTruthy();

    	vm.validator_.value = 10;
    	expect(vm.array_()).toBeFalsy();

    	vm.validator_.value = 'test';
    	expect(vm.array_()).toBeFalsy();
    });


    it('has a "string" rule that returns true if a variable is a string', function () {
    	vm.validator_.value = 'test';
    	expect(vm.string_()).toBeTruthy();

    	vm.validator_.value = '';
    	expect(vm.string_()).toBeTruthy();

    	vm.validator_.value = 10;
    	expect(vm.string_()).toBeFalsy();

    	vm.validator_.value = [];
    	expect(vm.string_()).toBeFalsy();

    	vm.validator_.value = false;
    	expect(vm.string_()).toBeFalsy();
    });


    it('has a "number" rule that returns true if a variable is a number', function () {
    	vm.validator_.value = 10;
    	expect(vm.number_()).toBeTruthy();

    	vm.validator_.value = 2484.242;
    	expect(vm.number_()).toBeTruthy();

    	vm.validator_.value = [];
    	expect(vm.number_()).toBeFalsy();

    	vm.validator_.value = false;
    	expect(vm.number_()).toBeFalsy();

    	vm.validator_.value = 'test';
    	expect(vm.number_()).toBeFalsy();
    });


    it('has a "regex" rule that returns true if a variable matches a given regular expression', function () {

    	// the expression used in this test requires the variable to be comprised of only numbers
    	
    	// argument as string in an array (how the argument looks if you used the regex rule specifically)
    	var args = ['^[0-9]+$'];

    	vm.validator_.value = '123';
    	expect(vm.regex_(args)).toBeTruthy();

    	vm.validator_.value = 'testing 123';
    	expect(vm.regex_(args)).toBeFalsy();

    	vm.validator_.value = 10;
    	expect(vm.regex_(args)).toBeTruthy();

		// same as above but developer also included forward-slashes at beginning and end
    	args = ['/^[0-9]+$/'];

    	vm.validator_.value = '123';
    	expect(vm.regex_(args)).toBeTruthy();

    	vm.validator_.value = 'testing 123';
    	expect(vm.regex_(args)).toBeFalsy();

    	vm.validator_.value = 10;
    	expect(vm.regex_(args)).toBeTruthy();

    	// as a plain expression (how the argument looks if called by another rule such as 'email')
    	args = /^[0-9]+$/;

    	vm.validator_.value = '123';
    	expect(vm.regex_(args)).toBeTruthy();

    	vm.validator_.value = 'testing 123';
    	expect(vm.regex_(args)).toBeFalsy();

    	vm.validator_.value = 10;
    	expect(vm.regex_(args)).toBeTruthy();
    });

    it('creates an entry in errors object that the developer can manually set/get', function () {
    	vm.team = {
    		name: '',
    		location: '',
    	};

    	vm.manualErrorChecking('team.name');
    	vm.manualErrorChecking('team.location', 'Enter a location');

    	expect(vm.errors.team.name).toEqual(''); // the error message defaults to empty
    	expect(vm.errors.team.location).toEqual('Enter a location'); // or uses a given one
    });

    it('registers a variable with no further keys for error checking', function () {
    	vm.teamname = 'testname';

    	// the teamname must be filled
    	// and must be made up of only alphanumeric characters
    	vm.registerErrorChecking('teamname', 'required|alpha_num', ['Enter a teamname', 'Only letters and numbers']);

    	expect(vm.errors.teamname).toEqual(''); // error message empty until an errorCheck() is run

    	// store possible error messages for each rule
    	expect(vm.validator_.errMsg.teamname.required).toEqual('Enter a teamname');
    	expect(vm.validator_.errMsg.teamname.alpha_num).toEqual('Only letters and numbers');

    	// store meta data about the variable
    	expect(vm.validator_.vars.teamname.keys[0]).toEqual('');
    	expect(vm.validator_.vars.teamname.isArray).toBeFalsy();
    	expect(vm.validator_.vars.teamname.rules[0]).toEqual({
    		required: [],
    		alpha_num: [],
    	});
    });

    it('registers a variable with further keys for error checking', function () {
    	vm.location = {}
    	vm.$set('location.city.zip', '03842');

    	// must be filled
    	// must be equal to a size of 5
    	// must be a number
    	vm.registerErrorChecking('location.city.zip', 'required|size:5|number', ['Enter a zip', 'Invalid zip', 'Invalid zip']);

    	expect(vm.errors.location.city.zip).toEqual('');

    	expect(vm.validator_.errMsg.location.city.zip.required).toEqual('Enter a zip');
    	expect(vm.validator_.errMsg.location.city.zip.size).toEqual('Invalid zip');

    	expect(vm.validator_.vars.location.keys[0]).toEqual('city.zip');
    	expect(vm.validator_.vars.location.isArray).toBeFalsy();
    	expect(vm.validator_.vars.location.rules[0]).toEqual({
    		required: [],
    		size: [5],
    		number: [],
    	});
    });


    it('can register other keys of a variable that was already registered', function () {
    	vm.location = {}
    	vm.$set('location.city.name', 'Hampton');
    	vm.$set('location.city.zip', '03842');

    	vm.registerErrorChecking('location.city.zip', 'required|size:5|number', ['Enter a zip', 'Invalid zip']);
    	vm.registerErrorChecking('location.city.name', 'required', ['Enter your city']);

    	expect(vm.errors.location.city.zip).toEqual('');
    	expect(vm.errors.location.city.name).toEqual('');

    	expect(vm.validator_.errMsg.location.city.zip.required).toEqual('Enter a zip');
    	expect(vm.validator_.errMsg.location.city.zip.size).toEqual('Invalid zip');
    	expect(vm.validator_.errMsg.location.city.name.required).toEqual('Enter your city');

    	expect(vm.validator_.vars.location.keys[0]).toEqual('city.zip');
    	expect(vm.validator_.vars.location.isArray).toBeFalsy();
    	expect(vm.validator_.vars.location.rules[0]).toEqual({
    		required: [],
    		size: [5],
    		number: [],
    	});
    	expect(vm.validator_.vars.location.keys[1]).toEqual('city.name');
    	expect(vm.validator_.vars.location.isArray).toBeFalsy();
    	expect(vm.validator_.vars.location.rules[1]).toEqual({
    		required: [],
    	});
    });


    it('registers an array with further keys for error checking', function () {
    	vm.players = [
    		{name: 'Tester', email: 'tester@rookiecard.com'},
    		{name: 'Testy', email: 'testy@rookiecard.com'},
    	];

    	vm.registerErrorChecking('players.*.email', 'email', ['Invalid email']);
    	vm.registerErrorChecking('players.*.name.firstname', 'required', ['Name this player']);

    	expect(vm.errors.players[0].email).toEqual('');
    	expect(vm.errors.players[1].email).toEqual('');
    	expect(vm.errors.players[0].name.firstname).toEqual('');
    	expect(vm.errors.players[1].name.firstname).toEqual('');

    	expect(vm.validator_.errMsg.players.email.email).toEqual('Invalid email');
    	expect(vm.validator_.errMsg.players.name.firstname.required).toEqual('Name this player');

    	expect(vm.validator_.vars.players.keys[0]).toEqual('email');
    	expect(vm.validator_.vars.players.isArray).toBeTruthy();
    	expect(vm.validator_.vars.players.rules[0]).toEqual({
    		email: [],
    	});
    	expect(vm.validator_.vars.players.keys[1]).toEqual('name.firstname');
    	expect(vm.validator_.vars.players.isArray).toBeTruthy();
    	expect(vm.validator_.vars.players.rules[1]).toEqual({
    		required: [],
    	});
    });


    it('uses the last given error message for remaining rules if messages.length !== rules.length', function () {
    	vm.teamname = 'testname';

    	vm.registerErrorChecking('teamname', 'required|alpha_num|max:18', ['Invalid teamname']);

    	// same error message used for all rules
    	expect(vm.validator_.errMsg.teamname.required).toEqual('Invalid teamname');
    	expect(vm.validator_.errMsg.teamname.alpha_num).toEqual('Invalid teamname');
    	expect(vm.validator_.errMsg.teamname.max).toEqual('Invalid teamname');
    });


    it('uses a generic error message if there are none given', function () {
    	vm.teamname = 'testname';

    	vm.registerErrorChecking('teamname', 'required|alpha_num|max:18');

    	// same error message used for all rules
    	expect(vm.validator_.errMsg.teamname.required).toEqual('Invalid input');
    	expect(vm.validator_.errMsg.teamname.alpha_num).toEqual('Invalid input');
    	expect(vm.validator_.errMsg.teamname.max).toEqual('Invalid input');
    });


    it('error checks a registered variable with no further keys', function () {
    	vm.teamname = 'testname';

    	vm.registerErrorChecking('teamname', 'required|alpha_num', ['Enter a teamname', 'Only letters and numbers']);

    	expect(vm.errorCheck('teamname')).toEqual(0);
    	expect(vm.errors.teamname).toEqual('');

    	vm.teamname = 'testname_';
    	expect(vm.errorCheck('teamname')).toEqual(1);
    	expect(vm.errors.teamname).toEqual('Only letters and numbers');

    	vm.teamname = '';
    	expect(vm.errorCheck('teamname')).toEqual(1);
    	expect(vm.errors.teamname).toEqual('Enter a teamname');
    });


    it('error checks a registered variable with further keys', function () {
    	vm.location = {}
    	vm.$set('location.city.zip', '03842');

    	vm.registerErrorChecking('location.city.zip', 'required|size:5', ['Enter a zip', 'Invalid zip']);

    	expect(vm.errorCheck('location.city.zip')).toEqual(0);
    	expect(vm.errors.location.city.zip).toEqual('');

    	vm.location.city.zip = '02';
    	expect(vm.errorCheck('location.city.zip')).toEqual(1);
    	expect(vm.errors.location.city.zip).toEqual('Invalid zip');

    	vm.location.city.zip = '';
    	expect(vm.errorCheck('location.city.zip')).toEqual(1);
    	expect(vm.errors.location.city.zip).toEqual('Enter a zip');
    });


    it('error checks a registered variable with multiple different further keys', function () {
    	vm.location = {}
    	vm.$set('location.city.zip', '03842');
    	vm.$set('location.city.name', 'Hampton');

    	vm.registerErrorChecking('location.city.zip', 'required|size:5', ['Enter a zip', 'Invalid zip']);
    	vm.registerErrorChecking('location.city.name', 'required', ['Enter your city']);

    	expect(vm.errorCheck('location')).toEqual(0);
    	expect(vm.errors.location.city.zip).toEqual('');
    	expect(vm.errors.location.city.name).toEqual('');

    	vm.location.city.zip = '02';
    	vm.location.city.name = '';
    	expect(vm.errorCheck('location')).toEqual(2);
    	expect(vm.errors.location.city.zip).toEqual('Invalid zip');
    	expect(vm.errors.location.city.name).toEqual('Enter your city');

    	vm.location.city.zip = '';
    	vm.location.city.name = 'test';
    	expect(vm.errorCheck('location')).toEqual(1);
    	expect(vm.errors.location.city.zip).toEqual('Enter a zip');
    	expect(vm.errors.location.city.name).toEqual('');
    });


    it('error checks a registered array', function () {
    	vm.players = [
    		{name: 'Tester', email: 'tester@rookiecard.com'},
    		{name: 'Testy', email: 'testy@rookiecard.com'},
    	];

    	vm.registerErrorChecking('players.*.email', 'email', ['Invalid email']);

    	expect(vm.errorCheck('players')).toEqual(0);

    	vm.players = [
    		{name: 'Tester', email: 'tester@rookiecard'},
    		{name: 'Testy', email: 'testy@rookiecardcom'},
    	];

    	expect(vm.errorCheck('players')).toEqual(2);
    	expect(vm.errors.players[0].email).toEqual('Invalid email');
    	expect(vm.errors.players[1].email).toEqual('Invalid email');
    });
    

    it('changes the size of this.errors to match the array if the array length has increased', function () {
    	vm.players = [
    		{name: 'Tester', email: 'tester@rookiecard.com'},
    	];

    	vm.registerErrorChecking('players.*.email', 'email', ['Invalid email']);

    	// this.errors remains as large as the array it's error checking
    	expect(vm.errors.players.length).toEqual(1);

    	// a player was added to the array
    	vm.players = [
    		{name: 'Tester', email: 'tester@rookiecard.com'},
    		{name: 'Tester', email: 'tester@rookiecard.com'},
    		{name: 'Tester', email: 'tester@rookiecard.com'},
    	];

    	vm.errorCheck('players');

		// same length as players again
    	expect(vm.errors.players.length).toEqual(3); 


    	// a player was removed from the array
    	vm.players = [
    		{name: 'Tester', email: 'tester@rookiecard.com'},
    		{name: 'Tester', email: 'tester@rookiecard.com'},
    	];

    	vm.errorCheck('players');

		// same length as players again
    	expect(vm.errors.players.length).toEqual(3); 
    });


    it('preallocates an array within this.errors to the length of the given fifth argument', function () {
        vm.players = [
            {name: 'Tester', email: 'tester@rookiecard.com'},
        ];

        vm.registerErrorChecking('players.*.email', 'email', ['Invalid email'], null, 3);

        expect(vm.errors.players.length).toEqual(3);
    });


    it('error checks a registered array that has further keys', function () {
    	vm.players = [
    		{name: {firstname: 'Tester', lastname: 'McGee'}},
    		{name: {firstname: 'Tester', lastname: 'McGee'}},
    	];

    	vm.registerErrorChecking('players.*.name.firstname', 'required', ['Enter a name']);

    	expect(vm.errorCheck('players')).toEqual(0);

    	vm.players = [
    		{name: {firstname: '', lastname: ''}},
    		{name: {firstname: '', lastname: ''}},
    	];

    	expect(vm.errorCheck('players')).toEqual(2);
    	expect(vm.errors.players[0].name.firstname).toEqual('Enter a name');
    	expect(vm.errors.players[1].name.firstname).toEqual('Enter a name');
    });


    it('error checks a certain registered key in an array', function () {
    	vm.players = [
    		{name: 'Tester', email: 'tester@rookiecard.com'},
    		{name: 'Testy', email: 'testy@rookiecard.com'},
    	];

    	vm.registerErrorChecking('players.*.email', 'email', ['Invalid email']);
    	vm.registerErrorChecking('players.*.name', 'required', ['Enter a name']);

    	expect(vm.errorCheck('players.email')).toEqual(0);

    	vm.players = [
    		{name: '', email: 'tester@rookiecard'},
    		{name: '', email: 'testy@rookiecardcom'},
    	];

    	// notice how players[x].name SHOULD fail, but isn't being checked

    	expect(vm.errorCheck('players.email')).toEqual(2);
    	expect(vm.errors.players[0].email).toEqual('Invalid email');
    	expect(vm.errors.players[1].email).toEqual('Invalid email');
    	expect(vm.errors.players[0].name).toEqual('');
    	expect(vm.errors.players[1].name).toEqual('');
    });


    it('error checks a certain index in an array', function () {
    	vm.players = [
    		{name: ''},
    		{name: ''},
    		{name: ''},
    		{name: ''},
    	];

    	vm.registerErrorChecking('players.*.name', 'required', ['Enter a name']);

    	// notice how all of players SHOULD fail, but aren't being checked

    	expect(vm.errorCheck('players.2')).toEqual(1);

    	expect(vm.errors.players[0].name).toEqual('');
    	expect(vm.errors.players[1].name).toEqual('');
    	expect(vm.errors.players[2].name).toEqual('Enter a name');
    	expect(vm.errors.players[3].name).toEqual('');
    });


    it('error checks a certain key at a certain index in an array', function () {
    	vm.players = [
    		{name: 'Tester'},
    		{name: 'Tester'},
    		{name: 'Tester'},
    		{name: 'Tester'},
    	];

    	vm.registerErrorChecking('players.*.name', 'required', ['Enter a name']);

    	expect(vm.errorCheck('players.2.name')).toEqual(0)

    	vm.players = [
    		{name: ''},
    		{name: ''},
    		{name: ''},
    		{name: ''},
    	];

    	// notice how all of players.name SHOULD fail, but aren't being checked

    	expect(vm.errorCheck('players.2.name')).toEqual(1);

    	expect(vm.errors.players[0].name).toEqual('');
    	expect(vm.errors.players[1].name).toEqual('');
    	expect(vm.errors.players[2].name).toEqual('Enter a name');
    	expect(vm.errors.players[3].name).toEqual('');
    });


    it('error checks every key in every registered variable', function () {
    	vm.teamname = 'testname';
    	vm.location = {}
    	vm.$set('location.city.zip', '424');
    	vm.players = [
    		{name: 'Tester', email: 'tester@rookiecard'},
    		{name: 'Testy', email: 'testy@rookiecard.com'},
    	];

    	vm.registerErrorChecking('teamname', 'required|alpha_num', ['Enter a teamname', 'Only letters and numbers']);
    	vm.registerErrorChecking('location.city.zip', 'required|size:5', ['Enter a zip', 'Invalid zip']);
    	vm.registerErrorChecking('players.*.email', 'email', ['Invalid email']);

    	var errors = vm.errorCheck();

    	expect(errors).toEqual(2);
    	expect(vm.errors.teamname).toEqual('');
    	expect(vm.errors.location.city.zip).toEqual('Invalid zip');
    	expect(vm.errors.players[0].email).toEqual('Invalid email');
    	expect(vm.errors.players[1].email).toEqual('');
    });


    it('can clear any previously registered error checking', function () {
        vm.teamname = 'testname';

        vm.registerErrorChecking('teamname', 'required|alpha_num', ['Enter a teamname', 'Only letters and numbers']);

        vm.resetErrorChecking();

        expect(vm.errors.length).toBeUndefined();
        expect(vm.validator_.vars.length).toBeUndefined();
        expect(vm.validator_.errMsg.length).toBeUndefined();
    });






});