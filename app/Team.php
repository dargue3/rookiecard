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

    protected $table = 'rc_teams';

    protected $dates = ['deleted_at'];

    protected $guarded = [];


    //arrays of possible positions for players to fill on teams
    protected $basketballPositions = ['pg', 'sg', 'sf', 'pf', 'c'];



    //returns IDs of all members of a team, useful for creating notifications
    //includeThisUser is whether or not logged in user is included in results
    public function members($includeThisUser = false) {

        //grab all of the players, coaches, and fans
        $members = TeamMember::where('team_id', $this->id)->get();
        
        foreach($members as $member) {
            if(!$includeThisUser && $member->user_id === Auth::user()->id)
                continue;
            $users[] = $member->user_id;
        }    
 
        return $users;

    }

    //allows you to query team by Team::name($teamname)
    public function scopeName($query, $teamname) {

        return $query->where('teamname', $teamname);

    }


    public function membersData() {

        $members =  TeamMember::where('team_id', $this->id)->get();
        $admin = Auth::user()->isTeamAdmin($this->teamname);
        $users = [];

        foreach($members as $member) {
            $user = User::find($member->user_id);
            $user['role'] = $member->role;
            $user['admin'] = $member->admin;
            $user['member_id'] = $member->id;

            if(!$admin) {
                //if they aren't an admin, hide emails of invited users if applicable
                $meta = json_decode($member->meta);
                if(isset($meta->ghost)) {
                    unset($meta->ghost->email);
                    $member->meta = json_encode($meta);
                }
            }
            //attach TeamMember meta data instead of User meta data
            $user['meta'] = $member->meta;

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


    //returns the positions associated with the spor that this team plays
    public function positions() {
        switch($this->sport) {
            case 0:
                //basketball
                return $this->basketballPositions;
                break;
            default:
                return [];
                break;
        }
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


    //create a team with request data from TeamController
    public function newTeam($request) {

        //do some quick housekeeping of the numbers
        //they should all be validated already
        $gender = intval($request->gender);
        if($gender < 0 || $gender > 2)
            $gender = 0;

        $sport = intval($request->sport);
        if($sport < 0 || $sport > 50)
            $sport = 0;

        $role = intval($request->userIsA);

        //put together an array of meta data
        $stats = new Stat;
        $stats = $stats->getStatKeys($sport, $request->userStats, $request->rcStats);


        $meta = [
            'stats'     => $stats,
            'homefield' => $request->homefield,
            'city'      => $request->city,
            'slogan'    => $request->slogan,
        ];

        $team = $this->create([
            'name'          => $request->name,
            'teamname'      => $request->teamname,
            'gender'        => $gender,
            'sport'         => $sport,
            'pic'           => '/images/proPic_default.jpeg',
            'long'          => $request->long,
            'lat'           => $request->lat,
            'meta'          => json_encode($meta),
            'season'        => 1,
            'creator_id'    => Auth::user()->id,
        ]);


        $member = new TeamMember;
        $players = $request->players;
        $coaches = $request->coaches;
        //add the user who created the team as their perspective role (and admin)
        $member->create([
            'user_id'   => Auth::user()->id,
            'team_id'   => $team->id,
            'admin'     => 1,
            'role'      => $role,
            'meta'      => json_encode(['positions' => []]),
        ]);
        //remove auth user from array of players or coaches if necessary
        if($role === 0) {
            //remove from players
            array_shift($players);
        }
        if($role === 2) {
            //remove from coaches
            array_shift($coaches);
        }


        //loop through the players and coaches to create TeamMember entries 
        foreach($players as $player) {
            if(!$player['name']) {
                //the name wasn't included (though should've been), use default
                $player['name'] = 'Leonardo DaVinci';
            }
            //invite user to join team
            //creates ghost player until they accept the invitation
            //the 5 designates that this user is invited to be a player
            $user = $member->inviteAndCreateGhost($team->id, $player, 5);   
        }

        foreach($coaches as $coach) {
            if(!$coach['name']) {
                //the name wasn't included (though should've been), use default
                $coach['name'] = 'Nikola Tesla';
            }
            //invite user to join team
            //creates ghost player until they accept the invitation
            //the 6 designates that this user is invited to be a coach
            $user = $member->inviteAndCreateGhost($team->id, $coach, 6);
        }

        return $team;
    }




}
