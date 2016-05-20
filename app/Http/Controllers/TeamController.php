<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Team;
use App\Event;
use App\TeamMember;
use App\User;
use App\Stat;
use App\NewsFeed;
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
            $outcome = $member->makeFan(Auth::user()->id, $team);
        }

        else if($member->role == 5 || $member->role == 6 || $member->role == 7) {
            //they've either been invited to join or have requested it, they can be fans too
            $outcome = $member->makeFan(Auth::user()->id, $team);
        }

        else if($member->role == 4 || $member->role == 45 || $member->role == 46 || $member->role == 47) {
            //they're some type of fan, remove
            $outcome = $member->removeFan(Auth::user()->id, $team);
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

        //create event(s), returns array of all events and news feed entry
        return $team->createEvent($request);
    }



    //admin has deleted an event, return news feed entry
    public function deleteEvent(Request $request, $teamname) {

        $team  = Team::name($teamname)->firstOrFail();

        if(Auth::user()->cannot('edit-events', [$team, $request->id]))
            return ['ok' => false, 'error' => 'Unauthorized request'];

        return $team->deleteEvent($request);
    }



    //admin has updated an event, return news feed entry
    public function updateEvent(Request $request, $teamname) {

        $team  = Team::name($teamname)->firstOrFail();

        if(Auth::user()->cannot('edit-events', [$team, $request->id]))
            return ['ok' => false, 'error' => 'Unauthorized request'];

        return $team->updateEvent($request);

    }
    

    //for when someone wrote a post to put on the team's news feed
    public function postNewPost(Request $request, $teamname) {

        $team  = Team::name($teamname)->firstOrFail();

        return $team->postToFeed($request->post);
    }



    //a team admin has deleted a post on the team news feed
    public function deletePost(Request $request, $teamname) {

        $team  = Team::name($teamname)->firstOrFail();

        if(Auth::user()->cannot('edit-posts', [$team, $request->id]))
            return ['ok' => false, 'error' => 'Unauthorized request'];

        return $team->deleteFeedEntry($request);
    }



    //a team admin has edited the meta data associated with a user on a team
    //returns new saved member
    public function updateUser(Request $request, $teamname) {

        $team = Team::name($teamname)->firstOrFail();

        $member_id = $request->user['member_id'];

        if(Auth::user()->cannot('edit-user', [$team, $member_id])) {
            //they're not allowed to edit this user (probably malicious)
            return ['ok' => false, 'error' => 'Unauthorized request'];
        }

        return $team->editMember($request);
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

        return $team->newMember($request);
    }


    //kick a user from the team
    public function deleteUser(Request $request, $teamname) {

        $team = Team::name($teamname)->firstOrFail(); 

        $member_id = $request->user['member_id'];

        if(Auth::user()->cannot('edit-user', [$team, $member_id])) {
            //they're not allowed to edit this user (probably malicious)
            return ['ok' => false, 'error' => 'Unauthorized request'];
        }
        
        return $team->deleteMember($request);
    }


    //a user has either accepted an invitation to join, or requested to join
    public function joinTeam(Request $request, $teamname) {

        $team = Team::name($teamname)->firstOrFail();

        if($request->has('accept'))
            return $team->userHasRespondedToInvitation($request);
        else
            return $team->userHasAskedToJoin();
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
