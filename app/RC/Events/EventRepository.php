<?php 
namespace App\RC\Events;

use App\Team;
use App\Repositories\RepositoryInterface;

interface EventRepository extends RepositoryInterface
{
	public function store(array $data, $team_id);
	public function update(array $data, $id);
	public function teamHasCreatedTooManyEvents($team_id);
	public function allEventsForTeam($team_id);
}