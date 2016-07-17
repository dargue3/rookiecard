import Validator from './../../../resources/assets/js/mixins/Validator.js'

describe("Validator", function() {

	var app = Validator;

    it('should have data', function () {
        expect(typeof app.data).toBe('function');
    });

	var data = app.data();

    it('should have valid rules', function () {
        expect(typeof data.validRules_).toBe('object');
    });
});