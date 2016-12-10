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
        if (! TeamRole::find(1)) {
            TeamRole::create(['name' => 'admin']);
        }
        if (! TeamRole::find(2)) {
            TeamRole::create(['name' => 'player']);
        }
        if (! TeamRole::find(3)) {
            TeamRole::create(['name' => 'ghost_player']);
        }
        if (! TeamRole::find(4)) {
            TeamRole::create(['name' => 'coach']);
        }
        if (! TeamRole::find(5)) {
            TeamRole::create(['name' => 'ghost_coach']);
        }
        if (! TeamRole::find(6)) {
            TeamRole::create(['name' => 'fan']);
        }
        if (! TeamRole::find(7)) {
            TeamRole::create(['name' => 'invited_player']);
        }
        if (! TeamRole::find(8)) {
            TeamRole::create(['name' => 'invited_coach']);
        }
        if (! TeamRole::find(9)) {
            TeamRole::create(['name' => 'requested_to_join']);
        }
    }
}
