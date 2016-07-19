<?php
namespace App\RC\Sports;

use App;
use Exception;
use App\StatColumn;
use App\RC\Stat\StatRepository;

class Basketball extends Sport implements SportInterface
{
	/**
	 * The name of this sport
	 * 
	 * @var string
	 */
	public $name = 'basketball';


	/**
	 * The keys that are valid when creating stats
	 * 
	 * @var array
	 */
	public $validKeys = ['id', 'member_id', 'gs', 'gp', 'min', 'dnp', 'pts', 'fgm', 'fga', 'fg_', 'threepm', 'threepa', 'threep_', 
            'ftm', 'fta', 'ft_', 'ast', 'reb', 'oreb', 'stl', 'blk', 'to', 'pf', 'efg_', 'ts_', 'astto', 'eff', 'dd2', 'td3'];


    /**
     * All possible keys in player stats
     * 
     * @var array
     */
    public $playerKeys = ['name', 'gs', 'gp', 'min', 'pts', 'fgm', 'fga', 'fg_', 'threepm', 'threepa', 'threep_', 
            'ftm', 'fta', 'ft_', 'ast', 'reb', 'oreb', 'stl', 'blk', 'to', 'pf', 'efg_', 'ts_', 'astto', 'eff', 'dd2', 'td3'];

    /**
     * All possible keys in team stats
     * 
     * @var array
     */
    public $teamKeys = ['date', 'win', 'opp', 'pts', 'fgm', 'fga', 'fg_', 'threepm', 'threepa', 'threep_', 
            'ftm', 'fta', 'ft_', 'ast', 'reb', 'oreb', 'stl', 'blk', 'to', 'pf'];


    /**
     * The keys that are always used in player stats
     * 
     * @var array
     */
    public $permanentPlayerKeys = ['name'];


    /**
     * The keys that are always used in team stats
     * 
     * @var array
     */
    public $permanentTeamKeys = ['date', 'win', 'opp'];


    /**
     * The possible positions a player could play
     * 
     * @var array
     */
    public $positions = ['pg', 'sg', 'sf', 'pf', 'c'];



	/**
	 * Fine-grain details of each stat key and the defaults
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
		 *   	subtext: human readable form of requriments 
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