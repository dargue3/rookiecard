<?php

namespace App;

use Illuminate\Auth\Authenticatable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Auth;
use Illuminate\Auth\Passwords\CanResetPassword;
use Illuminate\Contracts\Auth\Authenticatable as AuthenticatableContract;
use Illuminate\Contracts\Auth\CanResetPassword as CanResetPasswordContract;
use Illuminate\Foundation\Auth\Access\Authorizable;
use Illuminate\Contracts\Auth\Access\Authorizable as AuthorizableContract;
use Illuminate\Database\Eloquent\SoftDeletes;

use App\Team;
use App\TeamMember;

class User extends Model implements AuthenticatableContract, CanResetPasswordContract, AuthorizableContract
{
    use SoftDeletes;
    use Authenticatable, Authorizable, CanResetPassword;

    protected $table = 'rc_users';
    protected $dates = ['deleted_at'];
    protected $fillable = ['firstname', 'lastname', 'username',  'email', 'password'];
    protected $hidden = ['password', 'remember_token', 'email', 'birthday', 'created_at', 'updated_at', 'deleted_at'];


    //for searching User class first names
    public function scopeSearchByFirstName($query, $search)
    {
        return $query->where('firstname', 'LIKE', "%$search%");
    }


    //for searching User class last names
    public function scopeSearchByLastName($query, $search)
    {
        return $query->where('lastname', 'LIKE', "%$search%");
    }



    //for searching User class usernames
    public function scopeSearchByUsername($query, $search)
    {
        return $query->where('username', 'LIKE', "%$search%");
    }


    public function fullName()
    {
        return "$this->firstname $this->lastname"; 
    }

    //returns all the teams this user is associated with
    public function teams()
    {
        $teams = TeamMember::where('user_id', $this->id)->get();

        foreach ($teams as $team) {
            $role = 99;
            $team = Team::find($team->team_id);
            if (! $team) {
                continue;
            }
            $team = $team->brief();
            $team['notifications'] = Notification::teamUser($this->id, $team['id'])->count();
            $team['role'] = $role;

            $teams[] = $team;
        }
        return $teams;
    }



    /**
     * Check whether or not this user is an admin of a given team
     * 
     * @param  string  $teamname
     * @return boolean          
     */
    public function isTeamAdmin($teamname)
    {
        $team = Team::name($teamname)->firstOrFail();

        $member = TeamMember::member($this->id, $team->id)->first();

        if (! $member or ! $member->isAdmin()) {
            return false;
        }

        return true;
    }



    //checks if this user is a member/creator of this team
    public function isTeamMember(Team $team)
    {
        // $member = TeamMember::member($this->id, $team->id)->first();

        // if(!$member)
        //     return false;
        // else if($member->isMember())
        //     return true;

        return false;
    }


    //return a minimal amount of info about the user
    public function brief()
    {
        return [
            'id'            => $this->id,
            'firstname'     => $this->firstname,
            'lastname'      => $this->lastname,
            'username'      => $this->username,
        ];
    }



}
