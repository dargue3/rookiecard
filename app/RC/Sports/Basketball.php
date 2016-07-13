<?php
namespace App\RC\Sports;

use App;
use Exception;
use App\RC\Stat\StatRepository;

class Basketball implements SportInterface
{
	/**
	 * An instance of a stat repository
	 * 
	 * @var StatRepository
	 */
	protected $stat;


	/**
	 * The keys that are able to be inserted into the database
	 * 
	 * @var array
	 */
	protected $fillable = ['id', 'member_id', 'min', 'dnp', 'pts', 'fgm', 'fga', 'fg_', 'threepm', 'threepa', 'threep_', 
            'ftm', 'fta', 'ft_', 'ast', 'reb', 'oreb', 'stl', 'blk', 'to', 'pf'];


	public function __construct()
	{
		$this->stat = App::make(StatRepository::class);
	}


	/**
	 * Fetch the positions associated with basketball
	 * 
	 * @return array
	 */
	public function positions()
	{
		return ['pg', 'sg', 'sf', 'pf', 'c'];
	}


	/**
	 * Fetch all possible keys for player stats
	 * 
	 * @return array
	 */
	public function playerStatKeys()
	{
		return ['name', 'gs', 'gp', 'min', 'pts', 'fgm', 'fga', 'fg_', 'threepm', 'threepa', 'threep_', 
            'ftm', 'fta', 'ft_', 'ast', 'reb', 'oreb', 'stl', 'blk', 'to', 'pf', 'efg_', 'ts_', 'astto', 'eff', 'dd2', 'td3'];
	}


	/**
	 * Fetch all possible keys for team stats
	 * 
	 * @return array
	 */
	public function teamStatKeys()
	{
		return ['date', 'win', 'opp', 'pts', 'fgm', 'fga', 'fg_', 'threepm', 'threepa', 'threep_', 
            'ftm', 'fta', 'ft_', 'ast', 'reb', 'oreb', 'stl', 'blk', 'to', 'pf'];
	}


	/**
	 * Check that this array of stats only has valid stat keys
	 * 
	 * @param  array $stats
	 * @return array 
	 */
	protected function validate(array $stats)
	{
		foreach($stats as $key => $value) {
			if (! in_array($key, $this->fillable)) {
				throw new Exception("'$key' is not a valid stat key in Basketball");
			}
		}

		return $stats;
	}


	/**
	 * Validate and format the team stats before returning back to HandlesStatLogic
	 * 
	 * @param  array $stats
	 * @return array
	 */
	public function validateTeamStats($stats)
	{
		return $this->validate($stats);
	}


	/**
	 * Validate and format the player stats before returning back to HandlesStatLogic
	 * 
	 * @param  array $stats
	 * @return array
	 */
	public function validatePlayerStats($stats)
	{
		$validated = [];
		foreach ($stats as $stat) {

			if (isset($stat['min']) and $stat['min'] == 0) {
				// don't include stats for a player that didn't play
				continue;
			}

			else if (isset($stat['dnp']) and $stat['dnp'] == true) {
				// don't include stats for a player that didn't play
				continue;
			}

			unset($stat['dnp']);

			$validated[] = $this->validate($stat);
		}

		return $validated;
	}




}