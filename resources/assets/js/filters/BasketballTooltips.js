//converts column name to human for stats table tooltips

module.exports = (function(val) {
	switch(val) {
		case 'date':
			return 'Date of Game';
			break;
		case 'opp':
			return 'Opponent';
			break;
		case 'win':
			return 'Win or Loss';
			break;		
		case 'gs':
			return 'Games Started';
			break;
		case 'gp':
			return 'Games Played';
			break;		
		case 'min':
			return 'Minutes Played';
			break;
		case 'dnp':
			return 'Did Not Play';
			break;	
		case 'pts':
			return 'Points';
			break;
		case 'fgm':
			return 'Field Goals Made';
			break;
		case 'fga':
			return 'Field Goals Attempted';
			break;
		case 'fg_':
			return 'Field Goal Percentage';
			break;
		case 'threepm':
			return 'Three Pointers Made';
			break;
		case 'threepa':
			return 'Three Pointers Attempted';
			break;
		case 'threep_':
			return 'Three Point Percentage';
			break;
		case 'ftm':
			return 'Free Throws Made';
			break;
		case 'fta':
			return 'Free Throws Attempted';
			break;
		case 'ft_':
			return 'Free Throw Percentage';
			break;
		case 'ast':
			return 'Assists';
			break;
		case 'reb':
			return 'Rebounds';
			break;
		case 'oreb':
			return 'Offensive Rebounds';
			break;
		case 'stl':
			return 'Steals';
			break;
		case 'blk':
			return 'Blocks';
			break;
		case 'to':
			return 'Turnovers';
			break;
		case 'pf':
			return 'Personal Fouls';
			break;
		case 'dd2':
			return 'Double Doubles';
			break;
		case 'td3':
			return 'Triple Doubles';
			break;
		case 'efg_':
			return 'Effective Field Goal Percentage';
			break;
		case 'ts_':
			return 'True Shooting Percentage';
			break;
		case 'ast-to':
			return 'Assist to Turnover Ratio';
			break;
		case 'eff':
			return 'Player Efficiency';
			break;
				
		default:
			return '';
			break;	
	}
})