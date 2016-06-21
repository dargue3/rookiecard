<?php

namespace App;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

use App\Stat;
use App\Event;
use App\NewsFeed;
use App\TeamRole;
use App\TeamMember;
use App\Notification;
use App\Repositories\TeamRepository;

class Team extends Model
{
    use SoftDeletes;

    protected $table = 'rc_teams';
    protected $dates = ['deleted_at'];
    protected $guarded = [];
    private $repo;


    public function __construct($attributes = array())
    {
        parent::__construct($attributes);

        $this->repo = new TeamRepository($this);
    }


    public function scopeName($query, $teamname)
    {
        return $query->where('teamname', $teamname);
    }


    /**
     * The key to use for route model binding
     * 
     * @return string
     */
    public function getRouteKeyName()
    {
        return 'teamname';
    }


    /**
     * Has this team hit their maximum number of events allowed?
     * 
     * @return boolean [description]
     */
    public function hasCreatedTooManyEvents()
    {
        return Event::teamId($this->id)->count() > 5000;
    }



    /**
     * Fetch the bare minimum data about this team
     * 
     * @return array
     */
    public function brief()
    {
        return [
            'id'        => $this->id,
            'teamname'  => $this->teamname,
            'name'      => $this->name,
            'sport'     => $this->sport
        ];
    }



    /**
     * Fetch the IDs of all users associated with this team
     * 
     * @param  boolean $includeThisUser Whether to include logged-in user in the results
     * @return array
     */
    public function allAssociatedUsers(Team $team, $includeThisUser)
    {
        //grab all of the players, coaches, and fans
        $members = TeamMember::where('team_id', $this->team->id)->get();
        
        foreach ($members as $member) {
            if ($member->user_id == 0) {
                // don't include ghosts
                continue;
            }

            if (! $includeThisUser and $member->user_id == Auth::user()->id) {
                // don't include logged-in user
                continue;
            }

            $users[] = $member->user_id;
        }    
 
        return $users;
    }



    //admin created some events, create them and return some data
    public function createEvents(Request $request) {

        
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
    public function toggleFan()
    {
        $attributes = ['user_id' => Auth::user()->id, 'team_id' => $this->id];
        $member = TeamMember::firstOrNew($attributes);

        return $member->toggleFan();
    }



    //admin has edited the meta data associated with a team member
    public function editMember(Request $request)
    {
        $user = $request->user;
        $member = TeamMember::findOrFail($user['member_id']);
        $member->editMember($user);

        return ['ok' => true, 'user' => $this->formatMemberData($member)];
    }



    //admin has created a new team member
    public function newMember(Request $request)
    {
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
    public function deleteMember(Request $request)
    {
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
