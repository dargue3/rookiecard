<?php
namespace App\RC\Stat;

interface StatRepository
{
	public function findByTeam($team_id);
}