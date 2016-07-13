<?php

namespace App\Http\Controllers;

use App\Team;
use Validator;
use Carbon\Carbon;
use App\RC\Team\JoinTeam;
use Illuminate\Http\Request;
use App\RC\Team\TeamRepository;
use Illuminate\Support\Facades\Auth;
use App\Http\Controllers\Controller;
use App\RC\Team\TeamMemberRepository;
use App\Http\Requests\NewEventRequest;
use App\Http\Requests\CreateTeamRequest;

class TeamController extends Controller
{
    /**
     * An instance of team repository
     * 
     * @var TeamRepository
     */
    protected $team;

    
    public function __construct(TeamRepository $team, TeamMemberRepository $member)
    {
        $this->middleware('auth');
        $this->middleware('admin', ['only' => 'uploadPic']);

        $this->team = $team;
        $this->member = $member;
    }


    /**
     * Returns JSON object of all this team's data
     * 
     * @param  Team   $team
     * @return Illuminate\Http\Response
     */
    public function getTeamData(Team $team)
    {
        $data = $this->team->getAllData($team->id);

        return ['ok' => true, 'data' => $data];
    }



    /**
     * A user is either:
     * Accepting/declining an admin's invitation to join the team
     * (Un)requesting to join the team
     * 
     * @param  Request $request 
     * @param  Team    $team    
     * @return Illuminate\Http\Response
     */
    public function joinTeam(Request $request, Team $team)
    {
        // pass action to service class, it will handle the logic
        (new JoinTeam($request->action, $team->id))->handle();

        return ['ok' => true, 'members' => $this->team->members($team->id)];
    }



    /**
     * Toggle logged-in user's fan status of a given team
     * 
     * @param  Team   $team
     * @return Illuminate\Http\Response      
     */
    public function toggleFan(Team $team)
    {
        $this->member->toggleFan($team->id);

        return ['ok' => true, 'members' => $this->team->members($team->id)];
    }



    /**
     * While creating a team, check the availability of a teamname
     * 
     * @param  string $teamname 
     * @return Illuminate\Http\Response           
     */
    public function checkAvailability($teamname)
    {
        if (Team::name($teamname)->first()) {
            return ['ok' => true, 'available' => false];
        }

        return ['ok' => true, 'available' => true];
    }



    //admin has uploaded a new team profile picture
    public function uploadPic(Request $request, Team $team)
    {
        return $this->team->uploadPic($request);
    }



    //creates a new team, request already validated
    public function createTeam(CreateTeamRequest $request)
    {
        return $this->team->create($request);
    }





}
