<?php

namespace App;

use Illuminate\Http\Request;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Auth;
use Illuminate\Database\Eloquent\SoftDeletes;

use App\TeamMember;
use App\TeamRole;
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


    //allows you to query team by Team::name($teamname)
    public function scopeName($query, $teamname) {

        return $query->where('teamname', $teamname);

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



    //returns all the data associated with this team to Vue
    public function getAllTeamData() {

        $members    = $this->members();
        $feed       = $this->feed();
        $events     = $this->events();
        $stats      = $this->stats();
        $positions  = $this->positions();
        $auth       = Auth::user();

        $data = [
            'team'      => $this,
            'members'   => $members,
            'feed'      => $feed,
            'events'    => $events,
            'stats'     => $stats,
            'positions' => $positions,
            'auth'      => $auth,
        ];

        return ['ok' => true, 'data' => $data];
    }


    //format and return all the data about each of this team's members
    public function members() {

        $members =  TeamMember::where('team_id', $this->id)->get();   
        $users = [];

        foreach($members as $member) {
            $users[] = $this->formatMemberData($member);
        }

        return $users;
    }


    //format a given member's data for front-end consumption
    public function formatMemberData($member) {

        //will hide some data if they're not an admin
        $admin = Auth::user()->isTeamAdmin($this->teamname);
       
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

        return $user;
    }




    //returns IDs of all users associated with this team. useful for creating notifications
    //includeThisUser is whether or not logged in user is included in results
    public function allAssociatedUsers($includeThisUser = false) {

        //grab all of the players, coaches, and fans
        $members = TeamMember::where('team_id', $this->id)->get();
        
        foreach($members as $member) {
            //don't care about ghosts
            if($member->user_id == 0)
                continue;

            //whether or not to include logged in user
            if(!$includeThisUser && $member->user_id == Auth::user()->id)
                continue;

            $users[] = $member->user_id;
        }    
 
        return $users;
    }


    //create a team with request data from TeamController
    public function createTeam($request)
    {
        //request is already validated

        //do some quick housekeeping of the inputs
        $gender = intval($request->gender);
        if ($gender < 0 || $gender > 2)
            $gender = 0;

        $sport = intval($request->sport);
        //look up supported sports in Sports::class


        //put together an array of meta data
        $stats = new Stat;
        $statKeys = $stats->getStatKeys($sport, $request->userStats, $request->rcStats);

        $meta = [
            'stats'     => $statKeys,
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

        $role = $request->userIsA;
        if ($role == 'fan')
        {
            $role = TeamRole::FAN;
        }
        else if ($role == 'player')
        {
            $role = TeamRole::PLAYER;
        }
        else if ($role == 'coach')
        {
            $role = TeamRole::COACH;
        }

        //add the user who created the team as their perspective role (and admin)
        TeamMember::create([
            'user_id'   => Auth::user()->id,
            'team_id'   => $team->id,
            'admin'     => 1,
            'role'      => $role,
            'meta'      => json_encode(TeamMember::getDefaultMetaData()),
        ]);

        $players = $request->players;
        $coaches = $request->coaches;
        //remove auth user from array of players or coaches if necessary
        if ($role == TeamRole::PLAYER)
        {
            array_shift($players);
        }
        else if ($role == TeamRole::COACH)
        {
            array_shift($coaches);
        }


        //loop through the players and coaches to create TeamMember entries 
        foreach ($players as $player)
        {
            TeamMember::addMember($team->id, TeamRole::GHOST_PLAYER, $player);
        }

        foreach ($coaches as $coach)
        {
            TeamMember::addMember($team->id, TeamRole::GHOST_COACH, $coach);
        }

        return ['ok' => true, 'team' => $team];
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

        $feed = $event->createTeamEvents($request, $this);

        $events = $event->getTeamEvents($this);

        return ['ok' => true, 'feed' => $feed, 'events' => $events];
    }



    //admin has deleted an event
    public function deleteEvent(Request $request) {

        $event = Event::findOrFail($request->id);
   
        $feed = $event->deleteTeamEvent($this);

        return ['ok' => true, 'feed' => $feed];
    }



    //admin has updated an event
    public function updateEvent(Request $request) {

        $event = Event::findOrFail($request->id);
   
        $feed = $event->updateTeamEvent($request, $this);

        return ['ok' => true, 'feed' => $feed];
    }



    //toggle the fan status of logged in user 
    public function toggleFan() {

        $attributes = ['user_id' => Auth::user()->id, 'team_id' => $this->id];
        
        //check the trashed members for this user and team, otherwise grab a new one
        $member = TeamMember::firstOrNew($attributes);

        return $member->toggleFan();
    }



    //admin has edited the meta data associated with a team member
    public function editMember(Request $request) {

        //save the data 
        $user = $request->user;

        $member = TeamMember::findOrFail($user['member_id']);

        $member->editMember($user);

        return ['ok' => true, 'user' => $this->formatMemberData($member)];
    }



    //admin has created a new team member
    public function newMember(Request $request) {

        //gather data and create ghost, invite email to team
        $user = [];
        $user['email'] = $request->user['meta']['ghost']['email'];
        $user['name'] = $request->user['meta']['ghost']['name'];
        $user['role'] = $request->user['role'];

        $ghost = new TeamMember(['team_id' => $this->id, 'user_id' => 0]);
        $ghost->createGhostAndInviteUser($user);

        //add any meta data that was included with the request
        $ghost->attachMetaData($request->user['meta']);

        return ['ok' => true, 'user' => $this->formatMemberData($ghost)];
    }



    //admin has deleted a team member
    //depending on whether they are a ghost or a real user, take different actions
    public function deleteMember(Request $request) {

        $user = $request->user;
        $member = TeamMember::findOrFail($user['member_id']);

        $member->deleteMember($user['meta']);

        if($member->exists) {
            //is now just a ghost
            return ['ok' => true, 'user' => $this->formatMemberData($member)];
        }

        //otherwise it was deleted completely
        return ['ok' => true, 'user' => null];   
    }


    //logged in use is responding to their invitation to join this team
    public function userHasRespondedToInvitation(Request $request) {

        $attributes = ['user_id' => Auth::user()->id, 'team_id' => $this->id];
        
        //check the trashed members for this user and team, otherwise grab a new one
        $member = TeamMember::firstOrNew($attributes);

        //the user is accepting an invitation
        if($request->accept == true) 
            $outcome = $member->acceptInvitation();

        //user is declining an invitation
        else if($request->accept == false)
            $outcome = $member->thanksButNoThanks();


        if(!$outcome['ok']) {
            //something bad happened, give error to user
            return $outcome;
        }
   
        //return updated list of users on this team
        return ['ok' => true, 'users' => $this->members()];
    }



    //logged in user has requested to join this team
    public function userHasAskedToJoin() {
        
        $attributes = ['user_id' => Auth::user()->id, 'team_id' => $this->id];
        
        $member = TeamMember::firstOrNew($attributes);

        return $member->requestToJoin();
    }



    //admin wants to upload a new profile picture
    public function uploadPic(Request $request) {

        //make sure there's a picture
        if($request->hasFile('pic')) {

            $pic = $request->file('pic');

            //check that it's a valid image
            if(!$pic->isValid())
                return ['ok' => false, 'error' => 'Invalid picture'];

            //deny if over 10MB
            if($pic->getSize() > 10485760)
                return ['ok' => false, 'error' => 'Maximum image size is 10MB'];
        }
        else
            return ['ok' => false];


        //build up a filename such as 2842.jpeg
        $filename = $this->id . '.' . $pic->getClientOriginalExtension();

        //save images in the path specified in .env file
        $filepath = base_path() . env('TEAM_PROFILE_PICS');

        //move the file to that path, save as filename
        $pic->move($filepath, $filename);

        //save the picture's location in database
        $this->pic = env('TEAM_PROFILE_PICS') . $filename;
        $this->save();

        return ['ok' => true];
    }







}
