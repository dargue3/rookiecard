<?php
namespace App\RC\Team;

interface TeamRepository
{
	public function stats($team_id);
	public function events($team_id);
	public function members($team_id);
	public function feed($team_id);
	public function positions($team_id);
	public function getAllData($team_id);
}