
//formats the json version of a stat name to the basketball version
module.exports = (function(val) {

	//if key is 'win', return 'W/L'
	if(val === 'win')
		return 'W/L';

	//'astto' becomes 'AST/TO'
	if(val === 'astto')
		return 'AST/TO';

	if(val === 'opp')
		return 'OPPONENT';

	//everywhere with a _ becomes a %
	val = val.replace(/_/g , '%');

	//everywhere with a - becomes a /
	val = val.replace(/-/g , '/');

	//everywhere there's a 'three' becomes a '3'
	val = val.replace(/three/g, '3');

	//and also return all capitalized
	return val.toUpperCase();


});