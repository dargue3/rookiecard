<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class TeamRole extends Model
{
    protected $table = 'rc_team_roles';

    public $timestamps = false;

    // fetches the id of a role or fails
    public function ScopeId($query, $role)
    {
    	return $query->where('name', $role)->firstOrFail()->id;
    }

}