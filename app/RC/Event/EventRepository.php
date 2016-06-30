<?php 
namespace App\RC\Event;

use App\Repositories\RepositoryInterface;

interface EventRepository extends RepositoryInterface
{
	public function store(array $data, $team_id);
	public function update(array $data, $team_id, $id);
	public function delete($team_id, $id);
	public function teamHasCreatedTooManyEvents($team_id);
	public function getTeamEvents($team_id);
}