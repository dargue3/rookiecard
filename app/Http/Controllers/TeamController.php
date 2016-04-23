<?php

namespace App\Http\Controllers;

use App\Notification;
use App\TeamCoach;
use Illuminate\Http\Request;

use App\Http\Requests;
use App\Http\Controllers\Controller;
use App\Team;
use App\Event;
use App\TeamMember;
use App\User;
use App\StatusUpdate;
use Carbon\Carbon;
use Illuminate\Support\Facades\Auth;


class TeamController extends Controller
{


    public function __construct() {

        $this->middleware('auth');

        $this->middleware('admin', ['only' => ['newEvent', 'updateEvent', 'deleteEvent']]);

    }





    //returns main team data to Team.vue
    public function getTeamData(Request $request, $teamname) {

        $team = Team::name($teamname)->firstOrFail();

        $members = $team->membersData();

        $feed = $team->feed();

        $events = $team->events();

        $stats = $team->stats();

        $auth = Auth::user();

        $data = [
            'team'      => $team,
            'auth'      => $auth,
            'members'   => $members,
            'feed'      => $feed,
            'stats'     => $stats,
            'events'    => $events,
        ];

        return $data;

    }


    //for toggling whether this user is a fan of this team
    public function toggleFan(Request $request, $teamname) {

        $team = Team::name($teamname)->firstOrFail();
        $isAlreadyFan = TeamMember::where('user_id', Auth::user()->id)->where('team_id', $team->id)->first();

        $isNowFan = $request->get('isNowFan');

        if(!$isAlreadyFan && $isNowFan) {
            //input and db agree, make this user a fan
            $member = new TeamMember;
            $member->makeFan(Auth::user()->id, $team->id);
        }

        else if($isAlreadyFan && !$isNowFan) {
            //input and db agree, remove as fan
            $isAlreadyFan->delete();
        }

        else {
            //something weird happened
            return ['success' => false];
        }


        return ['success' => true];
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

        $data = TeamMember::where('user_id', $user['id'])->where('team_id', $team->id)->first();

        if($user['admin'])
            $data->admin = 1;
        else
            $data->admin = 0;
        $data->meta = json_encode($user['meta']);
        $data->save();

        return;

    }




}
