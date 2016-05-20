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

class User extends Model implements AuthenticatableContract, CanResetPasswordContract, AuthorizableContract
{
    use SoftDeletes;
    use Authenticatable, Authorizable, CanResetPassword;

    /**
     * The database table used by the model.
     *
     * @var string
     */
    protected $table = 'rc_users';

    protected $dates = ['deleted_at'];

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = ['firstname', 'lastname', 'username',  'email', 'password'];

    /**
     * The attributes excluded from the model's JSON form.
     *
     * @var array
     */
    protected $hidden = ['password', 'remember_token', 'email', 'birthday', 'created_at', 'updated_at', 'deleted_at'];


    //for searching User class first names
    public function scopeSearchByFirstName($query, $search) {

        return $query->where('firstname', 'LIKE', "%$search%");

    }




    //for searching User class last names
    public function scopeSearchByLastName($query, $search) {

        return $query->where('lastname', 'LIKE', "%$search%");

    }



    //for searching User class usernames
    public function scopeSearchByUsername($query, $search) {

        return $query->where('username', 'LIKE', "%$search%");

    }

    //returns all the teams this user is associated with
    public function teams() {

        $memberOf = TeamMember::where('user_id', $this->id)->get();

        foreach($memberOf as $team) {
            $role = $team->role;
            $team = Team::find($team->team_id);
            if($team) {
                $team = $team->brief();
                $team['notifications'] = Notification::teamUser($this->id, $team['id'])->count();
                $team['role'] = $role;

                $teams[] = $team;
            }
            
        }

        return $teams;

    }

    //checks if this user is an admin of the given team
    public function isTeamAdmin($teamname) {

        $team = Team::name($teamname)->firstOrFail();

        $member = TeamMember::member($this->id, $team->id)->first();

        if($member)
            return $member->admin;
        else
            return false;

    }


    //return a minimal amount of info about the user
    public function brief() {
        return [
            'id'            => $this->id,
            'firstname'     => $this->firstname,
            'lastname'      => $this->lastname,
            'username'      => $this->username,
        ];
    }



}
