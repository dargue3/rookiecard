<?php

namespace App\Http\Controllers;

use App\Team;
use Faker\Factory;
use App\RC\Sports\Sport;
use App\RC\Team\JoinTeam;
use Illuminate\Http\Request;
use App\RC\Team\TeamRepository;
use App\RC\Helpers\UploadsPhotos;
use App\Http\Controllers\Controller;
use App\RC\Team\TeamMemberRepository;
use App\Http\Requests\CreateTeamRequest;
use App\Http\Requests\UpdateTeamRequest;

class TeamController extends Controller
{
    /**
     * An instance of team repository
     * 
     * @var TeamRepository
     */
    protected $team;


    /**
     * An instance of team member repository
     * 
     * @var TeamMemberRepository
     */
    protected $member;

    
    public function __construct(TeamRepository $team, TeamMemberRepository $member)
    {
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
        return ['ok' => true, 'data' => $this->team->getAllData($team->id)];
    }


    /**
     * Create a new team and persist into the database
     * 
     * @param  CreateTeamRequest $request 
     * @return Illuminate\Http\Response                     
     */
    public function create(CreateTeamRequest $request)
    {
        return ['ok' => true, 'team' => $this->team->store($request->all())];
    }


    /**
     * Update the meta data and settings for a given team
     * 
     * @param  UpdateTeamRequest $request 
     * @param  Team              $team    
     * @return Illuminate\Http\Response 
     */
    public function update(UpdateTeamRequest $request, Team $team)
    {
        return ['ok' => true, 'team' => $this->team->update($request->all(), $team->id)];
    }


    /**
     * Logged-in user is either:
     *  - Accepting/declining an admin's invitation to join the team
     *  - (Un)requesting to join the team
     * 
     * @param  Request $request 
     * @param  Team    $team    
     * @return Illuminate\Http\Response
     */
    public function joinTeam(Request $request, Team $team)
    {
        $this->team->join($request->action, $team->id);

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
        if ($this->team->name($teamname)) {
            return ['ok' => true, 'available' => false, 'teamname' => $teamname];
        }

        return ['ok' => true, 'available' => true, 'teamname' => $teamname];
    }


    /**
     * Return an array of dummy names for placeholders
     * 
     * @param string $gender  The gender of the members of this team
     * @return Illuminate\Http\Response
     */
    public function createDummyNames($gender)
    {
        if ($gender == 'coed') $gender = null;

        $faker = (new Factory)->create();
        
        for ($x = 0; $x < 50; $x++) {
            $dummy[] = [
                'firstname' => $faker->firstName($gender),
                'lastname' => $faker->lastName($gender),
                'email' => $faker->email
            ];
        }

        return ['ok' => true, 'dummy' => $dummy];
    }



    /**
     * Team is uploading a new photo
     * Upload to temporary bucket, will move to permanent storage when they hit save
     * 
     * @param  Request $request 
     * @param  Team    $team    
     * @return Illuminate\Http\Response           
     */
    public function uploadTempPic(Request $request, Team $team)
    {
       $this->validate($request, ['pic' => 'required|image|mimes:jpeg,jpg,gif,png,svg|max:5120']);

       $url = (new UploadsPhotos($request->pic))->upload('tmp');

       return ['ok' => true, 'pic' => $url];
    }



    /** 
     * Return all stat keys associated with a given sport 
     * Used when admin is selecting which stat keys will show on team page
     * 
     * @param  string $sport 
     * @return Illuminate\Http\Response        
     */
    public function getStatKeys($sport)
    {
        return ['ok' => true, 'stats' => Sport::find($sport)->statDetails()];
    }





}
