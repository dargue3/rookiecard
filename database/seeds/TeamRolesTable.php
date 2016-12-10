<?php

use App\TeamRole;
use Illuminate\Database\Seeder;

class TeamRolesTable extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        TeamRole::create(['name' => 'admin']);
        TeamRole::create(['name' => 'player']);
        TeamRole::create(['name' => 'ghost_player']);
        TeamRole::create(['name' => 'coach']);
        TeamRole::create(['name' => 'ghost_coach']);
        TeamRole::create(['name' => 'fan']);
        TeamRole::create(['name' => 'invited_player']);
        TeamRole::create(['name' => 'invited_coach']);
        TeamRole::create(['name' => 'requested_to_join']);
    }
}
