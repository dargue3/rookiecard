<?php

namespace App;

use Illuminate\Http\Request;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Auth;
use Illuminate\Database\Eloquent\SoftDeletes;

use App\TeamMember;
use App\Event;
use App\Stat;
use App\NewsFeed;
use App\Notification;

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
            if(!$includeThisUser && $member->user_id == Auth::user()->id)
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

        $feed = new NewsFeed;

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



    //someone wrote a post onto the team's news feed
    //post is an array ready to be json_encoded
    public function postToFeed($post) {

        $feed = new NewsFeed;

        $entry = $feed->newsFeedPost($this, $post);

        return ['ok' => true, 'post' => $entry];
    }



    //admin deleted an entry on the team feed
    public function deleteFeedEntry(Request $request) {

        NewsFeed::findOrFail($request->id)->delete();

        return ['ok' => true, 'post' => $entry];
    }



    //admin created some events, create them and return some data
    public function createEvents(Request $request) {

        $event = new Event;

        $feed = $event->createTeamEvent($this, $request);

        $events = $event->getTeamEvents($this);

        return ['ok' => true, 'feed' => $feed, 'events' => $events];
    }



    //admin has deleted an event
    public function deleteEvent(Request $request) {

        $event = Event::findOrFail($request->id);
   
        $feed = $event->deleteTeamEvent($team);

        return ['ok' => true, 'feed' => $feed];
    }



    //admin has updated an event
    public function updateEvent(Request $request) {

        $event = Event::findOrFail($request->id);
   
        $feed = $event->updateTeamEvent($team);

        if($feed == false) 
            return ['ok' => false, 'error' => 'Event finishes before it starts'];

        return ['ok' => true, 'feed' => $feed];
    }



    //toggle the fan status of logged in user 
    public function toggleFan() {
        
        $member = TeamMember::member(Auth::user()->id, $this->id)->first();

        if(!$member) {
            //if not a member, make them one
            $member = new TeamMember;
            $outcome = $member->makeFan(Auth::user()->id, $this);
        }

        else if($member->role == 5 || $member->role == 6 || $member->role == 7) {
            //they've either been invited to join or have requested it, they can be fans too
            $outcome = $member->makeFan(Auth::user()->id, $this);
        }

        else if($member->role == 4 || $member->role == 45 || $member->role == 46 || $member->role == 47) {
            //they're some type of fan, remove
            $outcome = $member->removeFan(Auth::user()->id, $this);
        }

        else {
            //they're already a member but not a fan, they shouldn't have arrived here
            return ['ok' => false, 'error' => 'There was a problem, try refreshing the page'];
        }

        //there's some logic behind the response, so its specified within the TeamMember model
        return $outcome;
    }



    //admin has edited the meta data associated with a team member
    public function editMember(Request $request) {
        //save the data 
        $user = $request->user;

        $member = TeamMember::findOrFail($user['member_id']);

        if($user['admin'])
            $member->admin = 1;
        else
            $member->admin = 0;

        $member->meta = json_encode($user['meta']);
        $member->save();

        return ['ok' => true, 'user' => $member];
    }



    //admin has created a new team member
    public function newMember(Request $request) {

        //gather data and create ghost, invite email to team
        $user = [];
        $user['email'] = $request->meta['ghost']['email'];
        $user['name'] = $request->meta['ghost']['name'];

        $member = new TeamMember;
        $ghost = $member->inviteAndCreateGhost($team->id, $user, $request->role);

        //add any included meta data
        $meta = json_decode($ghost->meta);
        $meta->num = $request->meta['num'];
        $meta->positions = $request->meta['positions'];
        $ghost->meta = json_encode($meta);
        $ghost->save();

        return ['ok' => true, 'user' => $ghost];
    }



    //admin has deleted a team member
    //depending on whether they are a ghost or a real user, take different actions
    public function deleteMember(Request $request) {

        $user = $request->user;
        $member = TeamMember::findOrFail($user['member_id']);

        //if they're a ghost, remove from team entirely
        if($member->user_id == 0) {
            $stats = new Stat;
            $stats->deleteByMember($member);
            $member->delete();
            return ['ok' => true];
        }

        //if they're a real user, switch them to being a ghost
        $member->role = $user['role'];
        $member->id = 0;
        $member->admin = 0;
        $member->meta = json_encode($user['meta']);
        $member->save();

        return ['ok' => true];
    }


    //logged in use is responding to their invitation to join this team
    public function userHasRespondedToInvitation(Request $request) {

        $member = new TeamMember;

        //the user is accepting an invitation
        if($request->accept == true)
            $outcome = $member->acceptInvitation($team, Auth::user());

        //user is declining an invitation
        else if($request->accept == false)
            $outcome = $member->thanksButNoThanks($team);

        if(!$outcome['ok']) {
            //something bad happened, give error to user
            return $outcome;
        }
   
        //return updated list of users on this team
        return ['ok' => true, 'users' => $team->membersData()];
    }



    //logged in user has requested to join this team
    public function userHasAskedToJoin() {
        
        $member = new TeamMember;

        return $member->requestToJoin($this);
    }







}
