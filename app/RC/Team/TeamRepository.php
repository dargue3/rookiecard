<?php
namespace App\RC\Team;

use App\Team;

interface TeamRepository
{
	public function stats(Team $team);
	public function events(Team $team);
	public function members(Team $team);
	public function feed(Team $team);
	public function positions(Team $team);
	public function getAllData(Team $team);

	public function create(array $data);
}