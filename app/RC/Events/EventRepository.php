<?php 
namespace App\RC\Events;

use App\Team;
use App\Repositories\RepositoryInterface;

interface EventRepository extends RepositoryInterface
{
	public function store(array $data, Team $team);
	public function update(array $data, Team $team, $id);
	public function teamHasCreatedTooManyEvents($team_id);
}