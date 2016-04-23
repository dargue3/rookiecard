<?php

namespace App;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Auth;
use App\TeamMember;
use App\Event;
use App\Stat;
use Illuminate\Database\Eloquent\SoftDeletes;

class Team extends Model
{
    use SoftDeletes;


    /**
     * The database table used by the model.
     *
     * @var string
     */
    protected $table = 'rc_teams';

    protected $dates = ['deleted_at'];

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = ['id', 'name', 'sport', 'teamname'];



    //returns IDs of all members of a team, useful for creating notifications
    //includeThisUser is whether or not logged in user is included in results
    public function members($includeThisUser = FALSE) {

        //grab all of the players, coaches, and fans
        $members = TeamMember::where('team_id', $this->id)->get();
        
        foreach($members as $member) {
            if(!$includeThisUser && $member->user_id === Auth::user()->id)
                continue;
            $users[] = $member->user_id;
        }    
 
        return $users;

    }

    public function scopeName($query, $teamname) {

        return $query->where('teamname', $teamname);

    }


    public function membersData() {

        $members =  TeamMember::where('team_id', $this->id)->get();

        foreach($members as $member) {
            $user = User::find($member->user_id);
            $user['role'] = $member->role;
            $user['admin'] = $member->admin;

            unset($user['meta']); //don't need the user's personal meta data
            $user['meta'] = $member->meta; //attach member meta data instead

            $users[] = $user;
        }

        return $users;
    }


    //returns all events associated with this team
    public function events() {

        $events = new Event;
        return $events->getTeamEvents($this);

    }


    //returns all stats associated with this team
    public function stats() {

        $stats = new Stat;
        return $stats->getTeamStats($this);

    }


    //returns all news feed entries associated with this team
    public function feed() {

        $feed = new StatusUpdate;
        return $feed->getTeamFeed($this);

    }


    //returns the bare minimum amount of info about this team
    public function brief() {

        return [
            'id'        => $this->id,
            'teamname'  => $this->teamname,
            'name'      => $this->name,
            'sport'     => $this->sport
        ];
    }






}
