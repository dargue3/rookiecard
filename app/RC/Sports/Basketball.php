<?php
namespace App\RC\Sports;

class Basketball extends Sport implements SportInterface
{
	use SportHelpers;

	/**
	 * The name of this sport
	 * 
	 * @var string
	 */
	public $name = 'basketball';


    /**
     * All possible stat keys
     * 
     * @var array
     */
    protected $statKeys = ['date', 'name', 'win', 'opp', 'gs', 'gp', 'min', 'pts', 'fgm', 'fga', 'fg_', 'threepm', 'threepa', 'threep_', 
            'ftm', 'fta', 'ft_', 'ast', 'reb', 'oreb', 'stl', 'blk', 'to', 'pf', 'efg_', 'ts_', 'astto', 'eff', 'dd2', 'td3'];



    /**
     * Keys that will be used to generate random stats
     * 
     * @var array
     */
    protected $keysForGeneration = ['min', 'gs', 'pts', 'fgm', 'fga', 'threepm', 'threepa', 'ftm', 'fta', 'ast', 'reb', 'oreb', 'stl',
    								'blk', 'to', 'pf'];


    /**
     * The stat keys that are used in tables whether the admin wants them or not
     * 
     * @var array
     */
    protected $alwaysShown = ['date', 'name', 'win', 'opp'];


    /**
     * The keys that are included during stat creation in the stats object
     * Get unset before inserting into database
     * 
     * @var array
     */
    protected $keysOnlyUsedDuringCreation = ['id', 'member_id', 'dnp', 'lastname', 'name', 'fg_', 'threep_', 'ft_'];


    /**
     * All possible positions
     * 
     * @var array
     */
    protected $positions = ['pg', 'sg', 'sf', 'pf', 'c'];



    /**
     * Return truthy if the stats show this player did not play
     * 
     * @param  array $stats 
     * @return boolean        
     */
    public function theyDidNotPlay($stats)
    {
    	if (isset($stats['min']) and $stats['min'] == 0) {
			return true;
		}

		if (isset($stats['dnp']) and $stats['dnp'] == true) {
			return true;
		}

		return false;
    }


    /**
     * Change any falsey values to a default of zero
     * 
     * @param array $stats
     * @return array
     */
    public function setEmptyValues($stats)
    {
    	foreach ($stats as $key => $value) {
    		if (is_null($value)) {
    			$stats[$key] = 0;
    		}
    	}

    	return $stats;
    }


    /**
     * Generate random stats
     * 
     * @param  array $keys  Which stat keys to include
     * @return array         
     */
    public function generate($keys = [])
    {
    	if (empty($keys)) {
    		$keys = $this->keysForGeneration;
    	}

    	$stats = [];
    	foreach ($keys as $key) {
    		switch ($key) {
    			case 'min': $stats['min'] = rand(0, 42); break;
    			case 'gs': $stats['gs'] = true; break;
    			case 'pts': $stats['pts'] = 0; break;
    			case 'fgm': $stats['fgm'] = rand(0, 14); break;
    			case 'fga': $stats['fga'] = rand($stats['fgm'], $stats['fgm'] + 10); break;
    			case 'threepm': $stats['threepm'] = rand(0, 5); break;
    			case 'threepa': $stats['threepa'] = rand($stats['threepm'], $stats['threepm'] + 7); break;
    			case 'ftm': $stats['ftm'] = rand(0, 11); break;
    			case 'fta': $stats['fta'] = rand($stats['ftm'], $stats['ftm'] + 3); break;
    			case 'ast': $stats['ast'] = rand(0, 15); break;
    			case 'reb': $stats['reb'] = rand(0, 17); break;
    			case 'oreb': $stats['oreb'] = rand(0, 10); break;
    			case 'stl': $stats['stl'] = rand(0, 11); break;
    			case 'blk': $stats['blk'] = rand(0, 11); break;
    			case 'to': $stats['to'] = rand(0, 8); break;
    			case 'pf': $stats['pf'] = rand(0, 6); break;
    		}
    	}

    	return $this->calculateRest($keys, $stats);
    }


    /**
     * Calculate the rest of the stats based on the randomized seeds
     * 
     * @param  array $keys    The keys being used
     * @param  array $stats   The randomized stats so far
     * @return array          The randomized stats with extra calculated values
     */
    protected function calculateRest($keys, $stats)
    {	
    	foreach ($keys as $key) {
    		switch ($key) {
    			case 'fgm': $stats['pts'] += $stats['fgm'] * 2; break;
    			case 'threepm': 
    				$stats['pts'] += $stats['threepm'] * 3;
    				$stats['fgm'] += $stats['threepm'];
    				break;
    			case 'threepa': $stats['fga'] += $stats['threepa']; break;
    			case 'ftm': $stats['pts'] += $stats['ftm']; break;
    		}
    	}
    	return $stats;
    }

	/**
	 * Fine-grain details of each stat key and the defaults.
	 * Used during team creation process
	 * 
	 * @return array 
	 */
	public function statDetails()
	{
		/**
		 * Some explanations about how this huge JSON object works
		 * 
		 * user: the stat keys that will be inputted by a user
		 * 		val: human readable version of key
		 * 
		 * rc: the stat keys that are extrapolated by rookiecard based on user inputs
		 * 		val: human readable version of key
		 * 		req: an array of keys that are prerequisites for calculation of that stat
		 *   	subtext: human readable form of requirements 
		 *    	disabled: whether or not that stat is currently disabled/enabled in the picker
		 * 
		 * userSelected: a suggestion of which keys the user should input
		 * rcSelected: a suggestion of which keys rookiecard should calculate
		 */
		return 
		   '{
		   	"user": {
		        "pts": {
		            "val": "Points"
		        },
		        "min": {
		            "val": "Minutes Played"
		        },
		        "gs": {
		            "val": "Games Started"
		        },
		        "fgm": {
		            "val": "Field Goals Made"
		        },
		        "fga": {
		            "val": "Field Goals Attempted"
		        },
		        "ftm": {
		            "val": "Free Throws Made"
		        },
		        "fta": {
		            "val": "Free Throws Attempted"
		        },
		        "threepm": {
		            "val": "3 Pointers Made"
		        },
		        "threepa": {
		            "val": "3 Pointers Attempted"
		        },
		        "ast": {
		            "val": "Assists"
		        },
		        "reb": {
		            "val": "Rebounds"
		        },
		        "oreb": {
		            "val": "Offensive Rebounds"
		        },
		        "stl": {
		            "val": "Steals"
		        },
		        "blk": {
		            "val": "Blocks"
		        },
		        "to": {
		            "val": "Turnovers"
		        },
		        "pf": {
		            "val": "Personal Fouls"
		        }
		    },
		    "rc": {
		        "fg_": {
		            "val": "Field Goal Percentage",
		            "subtext": "Requires FGM & FGA",
		            "req": [
		                "fgm",
		                "fga"
		            ],
		            "disabled": false
		        },
		        "ft_": {
		            "val": "Free Throw Percentage",
		            "subtext": "Requires FTM & FTA",
		            "req": [
		                "ftm",
		                "fta"
		            ],
		            "disabled": false
		        },
		        "threep_": {
		            "val": "3 Point Percentage",
		            "subtext": "Requires 3PM & 3PA",
		            "req": [
		                "threepm",
		                "threepa"
		            ],
		            "disabled": false
		        },
		        "gp": {
		            "val": "Games Played",
		            "subtext": "",
		            "req": [],
		            "disabled": false
		        },
		        "efg_": {
		            "val": "Effective Field Goal Percentage",
		            "subtext": "Requires FG% & 3P%",
		            "req": [
		                "fg_",
		                "threep_"
		            ],
		            "disabled": false
		        },
		        "ts_": {
		            "val": "True Shooting Percentage",
		            "subtext": "Requires PTS, FG%, FT%",
		            "req": [
		                "pts",
		                "fg_",
		                "ft_"
		            ],
		            "disabled": false
		        },
		        "astto": {
		            "val": "Assist to Turnover Ratio",
		            "subtext": "Requires AST & TO",
		            "req": [
		                "ast",
		                "to"
		            ],
		            "disabled": false
		        },
		        "eff": {
		            "val": "Player Efficiency",
		            "subtext": "Requires PTS, REB, AST, STL, BLK, FG%, FT%, GP",
		            "req": [
		                "pts",
		                "reb",
		                "ast",
		                "stl",
		                "blk",
		                "fg_",
		                "ft_",
		                "gp"
		            ],
		            "disabled": false
		        },
		        "dd2": {
		            "val": "Double Doubles",
		            "subtext": "Requires PTS, AST, REB, BLK, STL",
		            "req": [
		                "pts",
		                "ast",
		                "reb",
		                "blk",
		                "stl"
		            ],
		            "disabled": false
		        },
		        "dd3": {
		            "val": "Triple Doubles",
		            "subtext": "Requires PTS, AST, REB, BLK, STL",
		            "req": [
		                "pts",
		                "ast",
		                "reb",
		                "blk",
		                "stl"
		            ],
		            "disabled": false
		        }
		    },
		    "userSelected": [
		        "pts",
		        "fgm",
		        "fga",
		        "threepm",
		        "threepa",
		        "ast",
		        "reb",
		        "stl",
		        "blk"
		    ],
		    "rcSelected": [
		        "fg_",
		        "threep_",
		        "gp"
		    ]
		}'; // end of json string
	}
}