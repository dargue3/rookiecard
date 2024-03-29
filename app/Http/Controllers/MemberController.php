<?php

namespace App\Http\Controllers;

use Auth;
use App\Team;
use Validator;
use Exception;
use Faker\Factory;
use App\Http\Requests;
use Illuminate\Http\Request;
use App\RC\Team\TeamRepository;
use App\Http\Controllers\Controller;
use App\RC\Team\TeamMemberRepository;

class MemberController extends Controller
{
    /**
     * An instance of a team member repository
     * 
     * @var TeamMemberRepository
     */
    protected $member;

    /**
     * An instance of a team repository
     * 
     * @var TeamRepository
     */
    protected $team;

    /**
     * Assign controller middleware
     */
    public function __construct(TeamRepository $team, TeamMemberRepository $member)
    {
        $this->member = $member;
        $this->team = $team;
    }


    /**
     * Admin wants to create a new ghost member
     *
     * @param  Illuminate\Http\Request  $request
     * @param  Team  $team
     * @return Illuminate\Http\Response
     */
    public function store(Request $request, Team $team)
    {
        $rules = [
            'email'             => 'email',
            'firstname'         => 'required|string|max:100',
            'lastname'          => 'required|string|max:100',
            'meta'              => 'array',
            'meta.num'          => 'regex:/^[0-9]{1,2}$/',
            'meta.positions'    => 'array|max:2',
            'role'              => 'required|string|in:player,coach'
        ];

        $this->validate($request, $rules);

        if ($request->role == 'player') {
            $this->member->newPlayer($team->id, $request->firstname, $request->lastname);
        }
        else {
            $this->member->newCoach($team->id, $request->firstname, $request->lastname);
        }

        if ($request->has('email')) {
            $this->member->invite($request->email);
        }
     
        $this->member->attachMetaData($request->meta, false);
        
        return ['ok' => true, 'members' => $this->team->members($team->id)];
    }


    /**
     * Update the specified resource in storage.
     *
     * @param  Illuminate\Http\Request  $request
     * @param  Team  $team
     * @param  int  $id
     * @return Illuminate\Http\Response
     */
    public function update(Request $request, Team $team, $id)
    {
        if (Auth::user()->cannot('edit-member', [$team, $id])) {
            throw new Exception("Unauthorized request");
        }

        $rules = [
            'isGhost'           => 'required|boolean',
            'meta.firstname'    => 'required_if:isGhost,true|string|max:100',
            'meta.lastname'     => 'required_if:isGhost,true|string|max:100',
            'meta.email'        => 'email',
            'meta.num'          => 'regex:/^[0-9]{1,2}$/',
            'meta.positions'    => 'array|max:2',
            'role'              => 'required|string|in:player,coach,fan',
            'admin'             => 'required|boolean',
            'requestedToJoin'   => 'boolean',
        ];

        $this->validate($request, $rules);

        if ($request->requestedToJoin) {
            $this->member->allowMemberToJoin(intval($id), $team->id);
        }

        if ($request->has('replace')) {
            if (is_int($request->replace)) {
                // the admin has opted for this user to replace a ghost
                $this->member->replaceGhostWithUser($request->replace);
            }
        }

        $this->member->editMember(intval($id), $request->meta, $request->role, $request->admin);

        return ['ok' => true, 'members' => $this->team->members($team->id)];
    }


    /**
     * Remove the specified resource from storage.
     *
     * @param  Team $team
     * @param  int  $id
     * @return Illuminate\Http\Response
     */
    public function destroy(Team $team, $id)
    {
        if (Auth::user()->cannot('edit-member', [$team, $id])) {
            throw new Exception("Unauthorized request");
        }
        
        $this->member->deleteMember($id);

        return ['ok' => true, 'members' => $this->team->members($team->id)];
    }


    /**
     * Return randomly generated data when creating a ghost member
     * 
     * @param  Team   $team 
     * @return Illuminate\Http\Response       
     */
    public function randomize(Team $team)
    {
        $faker = Factory::create();

        if ($team->gender == 0) {
            $gender = 'male';
        }
        else if ($team->gender == 1) {
            $gender = 'female';
        }
        else {
            $gender = null;
        }

        return [
            'ok'        => true,
            'firstname' => $faker->firstName($gender),
            'lastname'  => $faker->lastName,
        ];
    }
}
