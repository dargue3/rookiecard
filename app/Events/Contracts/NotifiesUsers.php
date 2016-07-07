<?php
namespace App\Events\Contracts;

use App\RC\Team\TeamRepository;

interface NotifiesUsers
{
	public function owner();
	public function users(TeamRepository $team);
	public function type();
	public function data();
}