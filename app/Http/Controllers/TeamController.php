<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Carbon\Carbon;
use Validator;
use Illuminate\Support\Facades\Auth;

use App\Http\Requests\CreateTeamRequest;
use App\Team;


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
                'newUser',
                'updateUser',
                'deleteUser',
            ]
        ]);
    }


    //return all data associated with team for view
    public function getTeamData($teamname) {

        $team = Team::name($teamname)->firstOrFail();

        return $team->getAllTeamData();
    }




    //for toggling whether this user is a fan of this team
    public function toggleFan($teamname) {

        $team = Team::name($teamname)->firstOrFail();

        if(Auth::user()->isTeamMember($team))
            return ['ok' => false, 'error' => "You're already a member of this team"];

        return $team->toggleFan();
    }




    //admin has added an event, return array of team events and news feed entry
    public function newEvent(Request $request, $teamname) {

        $team = Team::name($teamname)->firstOrFail();

        return $team->createEvent($request);
    }



    //admin has deleted an event, return news feed entry
    public function deleteEvent(Request $request, $teamname) {

        $team  = Team::name($teamname)->firstOrFail();

        $event_id = $request->id;

        if(Auth::user()->cannot('edit-events', [$team, $event_id]))
            return ['ok' => false, 'error' => 'Unauthorized request'];

        return $team->deleteEvent($request);
    }



    //admin has updated an event, return news feed entry
    public function updateEvent(Request $request, $teamname) {

        $team  = Team::name($teamname)->firstOrFail();

        $event_id = $request->id;

        if(Auth::user()->cannot('edit-events', [$team, $event_id]))
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

        $post_id = $request->id;

        if(Auth::user()->cannot('edit-posts', [$team, $post_id]))
            return ['ok' => false, 'error' => 'Unauthorized request'];

        return $team->deleteFeedEntry($request);
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



    //a team admin has edited the meta data associated with a user on a team
    //returns new saved member
    public function updateUser(Request $request, $teamname) {

        $team = Team::name($teamname)->firstOrFail();

        $member_id = $request->user['member_id'];

        if(Auth::user()->cannot('edit-user', [$team, $member_id]))
            return ['ok' => false, 'error' => 'Unauthorized request'];

        return $team->editMember($request);
    }



    //admin wants to kick a user from the team
    public function deleteUser(Request $request, $teamname) {

        $team = Team::name($teamname)->firstOrFail(); 

        $member_id = $request->user['member_id'];

        if(Auth::user()->cannot('edit-user', [$team, $member_id]))
            return ['ok' => false, 'error' => 'Unauthorized request'];
        
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


    //check if a teamname is taken yet or not (used in CreateTeam.vue)
    public function checkAvailability($teamname) {

        if(Team::name($teamname)->first())
            return ['available' => false];
        else
            return ['available' => true];
    }



    //admin has uploaded a new team profile picture
    public function uploadPic(Request $request, $teamname) {

        $team = Team::name($teamname)->firstOrFail();
        
        return $team->uploadPic($request);
    }



    //creates a new team, request already validated
    public function createTeam(CreateTeamRequest $request) {

        $team = new Team;

        return $team->createTeam($request);
    }




























}
