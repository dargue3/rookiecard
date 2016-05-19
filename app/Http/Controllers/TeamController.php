<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Team;
use App\Event;
use App\TeamMember;
use App\User;
use App\Stat;
use App\StatusUpdate;
use App\Notification;
use Carbon\Carbon;
use Validator;
use Illuminate\Support\Facades\Auth;


class TeamController extends Controller
{


    public function __construct() {

        $this->middleware('auth');

        //these functions are for team admins only
        $this->middleware('admin', ['only' => 
            [
                'newEvent',
                'updateEvent',
                'deleteEvent',
                'uploadPic',
                'deletePost',
                'updateUser',
                'deleteUser',
            ]
        ]);

    }





    //returns main team data to Team.vue
    public function getTeamData(Request $request, $teamname) {

        $team = Team::name($teamname)->firstOrFail();

        $members = $team->membersData();

        $feed = $team->feed();

        $events = $team->events();

        $stats = $team->stats();

        $positions = $team->positions();

        $auth = Auth::user();

        $data = [
            'team'      => $team,
            'auth'      => $auth,
            'members'   => $members,
            'feed'      => $feed,
            'stats'     => $stats,
            'positions' => $positions,
            'events'    => $events,
        ];

        return $data;
    }


    //for toggling whether this user is a fan of this team
    public function toggleFan($teamname) {

        $team = Team::name($teamname)->firstOrFail();
        $member = TeamMember::member(Auth::user()->id, $team->id)->first();

        if(!$member) {
            //if not a member, make them one
            $member = new TeamMember;
            $outcome = $member->makeFan(Auth::user()->id, $team->id);
        }

        else if($member->role == 5 || $member->role == 6 || $member->role == 7) {
            //they've either been invited to join or have requested it, they can be fans too
            $outcome = $member->makeFan(Auth::user()->id, $team->id);
        }

        else if($member->role == 4 || $member->role == 45 || $member->role == 46 || $member->role == 47) {
            //they're some type of fan, remove
            $outcome = $member->removeFan(Auth::user()->id, $team->id);
        }

        else {
            //they're already a member but not a fan, they shouldn't have arrived here
            return ['ok' => false, 'error' => 'There was a problem, try refreshing the page'];
        }
  
        return $outcome;
    }


    //for handling ajax POSTs from 'add event' modal
    public function newEvent(Request $request, $teamname) {

        $team = Team::name($teamname)->firstOrFail();

        $event = new Event;
        //createEvent returns the StatusUpdate data it created
        $statusUpdate = $event->createEvent($request, $team);

        $teamEvents = $event->getTeamEvents($team);

        return json_encode(['feed' => $statusUpdate, 'events' => $teamEvents]);
    }



    //from ajax request to edit or delete an event
    public function deleteEvent(Request $request, $teamname) {

        $team  = Team::name($teamname)->firstOrFail();
        $event = Event::findOrFail($request->get('id'));

        $notify = true;
        if(Carbon::createFromTimestampUTC($event['end'])->isPast())
            $notify = false;

        $statusUpdate = $event->deleteEvent($team, $notify);

        if($statusUpdate != null)
            return json_encode(['feed' => $statusUpdate]);
        else
            return null;
    }



    //from ajax request to edit or delete an event
    public function updateEvent(Request $request, $teamname) {

        $team  = Team::name($teamname)->firstOrFail();
        $event = Event::findOrFail($request->get('id'));

        $notify = true;
        if(Carbon::createFromTimestampUTC($event['end'])->isPast())
            $notify = false;

        $statusUpdate = $event->updateEvent($request, $team, $notify);

        if($statusUpdate != null)
            return json_encode(['feed' => $statusUpdate]);
        else
            return null;

    }
    

    //for when someone wrote a post to put on the team's news feed
    public function postNewPost(Request $request, $teamname) {

        $team  = Team::name($teamname)->firstOrFail();

        //turn post details into json for inserting as metadata in status update
        $post = json_encode(['details' => $request->get('post')]);

        $status = new StatusUpdate;
        $notification = new Notification;

        $newPost = $status->createStatusUpdate($team->id, null, 'team_post', $post);
        $notification->createNotifications($team->members(), $team->id, 'team_post');

        return $newPost;

    }

    //for deleting a post
    public function deletePost($teamname, $id) {

        $status = new StatusUpdate;

        $status->findOrFail($id)->delete();

    }



    //for editing the meta data associated with a user on a team
    public function updateUser(Request $request, $teamname) {

        $team = Team::name($teamname)->firstOrFail();

        $user = $request->get('user');

        if($user['ghost']) {
            //if a ghost, its id is the TeamMember id
            $member = TeamMember::findOrFail($user['id']);
        }
        else {
            //otherwise search by user's id
            $member = TeamMember::member($user['id'], $team->id)->firstOrFail();
        }

        if($user['admin'])
            $member->admin = 1;
        else
            $member->admin = 0;

        $member->meta = json_encode($user['meta']);
        $member->save();

        return;

    }


    //creates new ghost user and sends invitation if email is inputted
    public function newUser(Request $request, $teamname) {

        $team = Team::name($teamname)->firstOrFail();

        //do a little bit of validation first
        $rules = [
            'meta.ghost.email'     => 'email',
            'meta.ghost.name'      => 'required|max:100',
            'role'                 => 'required|numeric'
        ];

        $validator = Validator::make($request->all(), $rules);

        if($validator->fails())
            return ['ok' => false, 'errors' => $validator->errors()];

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


    //kick a user from the team
    public function deleteUser(Request $request, $teamname) {

        $team = Team::name($teamname)->firstOrFail();

        $data = (object) $request->editedUser;

        if(Auth::user()->cannot('edit-user', [$team, $request])) {
            //they're not allowed to edit this user (probably malicious)
            return ['ok' => false, 'error' => 'Unauthorized request'];
        }

        $deleting = $request->delete;
        $member = TeamMember::findOrFail($data->member_id);

        if($deleting) {
            //this user was a ghost and is being deleted, easy
            $member->delete();
            Stat::where('member_id', $data->member_id)->delete();
            return ['ok' => true];
        }

        //otherwise switch $member from a real user to a ghost
        $member->role = $data->role;
        $member->id = 0;
        $member->admin = 0;
        $member->meta = json_encode($data->meta);
        $member->save();

        return ['ok' => true];

    }


    //a user has either accepted an invitation to join, or requested to join
    public function joinTeam(Request $request, $teamname) {

        $team = Team::name($teamname)->firstOrFail();

        $member = new TeamMember;

        if($request->has('accept')) {
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
        }
        else {
            //they're requesting to join
            $member->requestToJoin($team);
        }
       
        //return updated list of users on this team for ease
        return ['ok' => true, 'users' => $team->membersData()];
    }


    //check if that teamname is taken yet or not
    public function checkAvailability($teamname) {
        if(Team::name($teamname)->first())
            return ['available' => false];
        else
            return ['available' => true];
    }



    //for when a team uploads a new profile picture
    public function uploadPic(Request $request, $teamname) {

        $team = Team::name($teamname)->firstOrFail();
        $imageName = $team->id . '.' . $request->file('file')->getClientOriginalExtension();
        $imagePath = base_path() . '/public/images/proPic_teams/';
        $request->file('file')->move(
            $imagePath, $imageName
        );

        $team->pic = '/images/proPic_teams/' . $imageName;
        $team->save();

        return ['ok' => true];
    }


    //creates a new team
    public function createTeam(Request $request) {


        //pick easier error message for team username
        $messages = [
            'unique'    => 'Already taken, try another',
        ];

        //validate the inputs
        $rules = [
            'name'              => 'required|max:25',
            'teamname'          => 'required|unique:rc_teams|alpha_num|max:18',
            'name'              => 'required|max:25',
            'gender'            => 'required|size:1',
            'sport'             => 'required|between:1,2',
            'slogan'            => 'max:50',
            'homefield'         => 'max:25',
            'city'              => 'required',
            'lat'               => 'required|numeric',
            'long'              => 'required|numeric',
            'userIsA'           => 'required|size:1',
            'players'           => 'required|array',
            'coaches'           => 'required|array',
            'userStats'         => 'array',
            'rcStats'           => 'array',
        ];

        $validator = Validator::make($request->all(), $rules, $messages);

     
        //if validation fails, return to front-end with array of errors
        if($validator->fails()) {
            return ['ok' => false, 'errors' => $validator->errors()];
        }


        //create a new team with these inputs
        $team = new Team;

        $team = $team->newTeam($request);


        //return this new team data to front-end
        return ['ok' => true, 'team' => $team];
    }




























}
