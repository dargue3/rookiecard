<?php
namespace App\RC\Stat;

interface StatRepository
{
	public function getTeamStats($team_id);
}