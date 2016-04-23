module.exports = (function(string) { 

  //split up string of data into array
	var data = string.split(':');

	var start = moment(data[0] * 1000);
	var end = moment(data[1] * 1000);
	var daysOfWeek = data[2].split(',');
	var count = daysOfWeek.length;

	//initialize the human version of repeating string
	var prefix = 'Repeats every';
	var suffix = ' from ' + start.format('MMM. D') + ' until ' + end.format('MMM. D');

	//trivial if it repeats everyday
	if(count === 7) {
    prefix = 'Everyday';
    return prefix + suffix;
  }

  var done = false;
  for(var x = 0; x < count; x++) {
    if(x === count - 1) {
      if(count > 1)
      	//on last repeating day, add an 'and'
        prefix = prefix + ' and';
      done = true;
    }
    switch(daysOfWeek[x]) {
    	//tack on name of day of week
      case 'Su':
        prefix = prefix + ' Sunday';
        break;
      case 'M':
        prefix = prefix + ' Monday';
        break;
      case 'T':
        prefix = prefix + ' Tuesday';
        break;
      case 'W':
        prefix = prefix + ' Wednesday';
        break;
      case 'R':
        prefix = prefix + ' Thursday';
        break;
      case 'F':
        prefix = prefix + ' Friday';
        break;
      case 'S':
        prefix = prefix + ' Saturday';
        break;
    }
    if(!done && count > 2)
  		//and add a comma
      prefix = prefix + ',';
  }

  return prefix + suffix;
  
});