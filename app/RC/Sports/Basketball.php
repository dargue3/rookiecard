<?php
namespace App\RC\Sports;

use App\RC\Sports\Sport;

class Basketball implements Sport
{

	public function positions()
	{
		return ['pg', 'sg', 'sf', 'pf', 'c'];
	}

	public function playerStatKeys()
	{
		return ['name', 'gs', 'gp', 'min', 'pts', 'fgm', 'fga', 'fg_', 'threepm', 'threepa', 'threep_', 
            'ftm', 'fta', 'ft_', 'ast', 'reb', 'oreb', 'stl', 'blk', 'to', 'pf', 'efg_', 'ts_', 'astto', 'eff', 'dd2', 'td3'];
	}


	public function teamStatKeys()
	{
		return ['date', 'win', 'opp', 'pts', 'fgm', 'fga', 'fg_', 'threepm', 'threepa', 'threep_', 
            'ftm', 'fta', 'ft_', 'ast', 'reb', 'oreb', 'stl', 'blk', 'to', 'pf'];
	}
}