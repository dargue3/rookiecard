<?php
namespace App\RC\NewsFeed;

use App\Team;

interface NewsFeedRepository
{
	public function newTeamEvents(Team $team, array $meta);
}