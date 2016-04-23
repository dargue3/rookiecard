<?php

namespace App;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class TeamMember extends Model
{
     /**
     * The database table used by the model.
     *
     * @var string
     */

    protected $table = 'rc_team_members';

    use SoftDeletes;


    /**
     * possible roles are as follows:
     * 0 = player 
     * 1 = ghost
     * 2 = coach
     * 3 = fan
     */
    protected $fillable = ['user_id', 'team_id', 'role', 'admin', 'meta'];

    protected $dates = ['deleted_at'];


    //makes a user a fan of a team
    public function makeFan($user_id, $team_id) {
        $this->create([
            'user_id'   => $user_id,
            'team_id'   => $team_id,
            'role'      => 3,
            'admin'     => 0,
            'meta'      => null
        ]);

        return;
    }

}
