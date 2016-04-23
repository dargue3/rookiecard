
//formats the time string to be as readable as possible
module.exports = (function(start, end) {

	start = moment.utc(start * 1000).local();
	end = moment.utc(end * 1000).local();

  var startTime, endTime;    

  if(moment(start).isSame(end, 'day')) {
    //starts and stops on same day, drop date in string

    if((moment(start).hour() < 12 && moment(end).hour() < 12) ||
       (moment(start).hour() >= 12 && moment(end).hour() >= 12)) {
      //both are am or pm, drop that from string as well
      var startTime = moment(start).format('MMM.   Do h:mm');
      var endTime   = moment(end).format('h:mm a');
    }
    else {
      var startTime = moment(start).format('MMM.   Do h:mm a');
      var endTime   = moment(end).format('h:mm a');
    }
    return startTime + " – " + endTime;
  }
  else {
    return moment(start).format('MMM.   Do h:mm a') + ' - ' + 
            moment(end).format('MMM.   Do h:mm a')
  }


});