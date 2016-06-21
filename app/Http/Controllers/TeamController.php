<?php

namespace App\Http\Controllers;

use Validator;
use Carbon\Carbon;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;

use App\Team;
use App\Repositories\TeamRepository;
use App\Http\Requests\NewEventRequest;
use App\Http\Requests\CreateTeamRequest;


class TeamController extends Controller
{
    /**
     * Instance of team repository
     * 
     * @var TeamRepository
     */
    private $team;

    /**
     * Assign controller middleware
     */
    public function __construct(TeamRepository $repository)
    {
        $this->middleware('auth');
        $this->middleware('admin', ['only' => 'uploadPic']);

        $this->team = $repository;
    }


    /**
     * Return JSON object of all this team's data
     * 
     * @param  Team   $team [description]
     * @return Illuminate\Http\Response
     */
    public function getTeamData(Team $team)
    {
        $data = $this->team->getAllData($team);

        return ['ok' => true, 'data' => $data];
    }



    /**
     * A user has either accepted or declined an admin's invitation to join this team
     * 
     * @param  Request $request 
     * @param  Team    $team    
     * @return Illuminate\Http\Response
     */
    public function respondToInvitation(Request $request, Team $team)
    {
        if ($request->accept == true) {
            (new JoinTeam)->userHasAcceptedInvitation($team);
        }
        else if ($request->accept == false) {
            (new JoinTeam)->userHasDeclinedInvitation($team);
        }

        return ['ok' => true, 'members' => $this->team->members($team)];
    }


    /**
     * A user has requested to join this team
     * 
     * @param  Request $request 
     * @param  Team    $team    
     * @return Illuminate\Http\Response
     */
    public function requestToJoin(Request $request, Team $team)
    {
        if ($request->action == 'request') {
            return $this->team->userHasAskedToJoin($team);
        }

        else if ($request->action == 'cancel') {
            return $this->team->userHasCanceledRequestToJoin($team);
        }
    }


    /**
     * Toggle logged-in user's fan status of a given team
     * 
     * @param  Team   $team
     * @return Illuminate\Http\Response      
     */
    public function toggleFan(Team $team)
    {
        if (Auth::user()->isTeamMember($team)) {
            return ['ok' => false, 'error' => "You're already a member of this team"];
        }

        $auth = $this->team->toggleFan();

        return ['ok' => true, 'auth' => $auth];
    }


    //check if a teamname is taken yet or not (used in CreateTeam.vue)
    public function checkAvailability($teamname)
    {
        if (Team::name($teamname)->first()) {
            return ['ok' => true, 'available' => false];
        }

        else {
            return ['ok' => true, 'available' => true];
        }
    }



    //admin has uploaded a new team profile picture
    public function uploadPic(Request $request, Team $team)
    {
        return $team->uploadPic($request);
    }



    //creates a new team, request already validated
    public function createTeam(CreateTeamRequest $request)
    {
        return $this->team->create($request);
    }





}
