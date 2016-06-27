<?php
namespace App\Events\Contracts;

use App\RC\Team\TeamRepository;

interface NotifiesUsers
{
	public function users(TeamRepository $team);
}