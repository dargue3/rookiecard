<?php

namespace App\Http\Controllers;

use Auth;
use App\Team;
use Validator;
use Exception;
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
        $this->middleware('auth');
        $this->middleware('admin');

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
        // do a little bit of validation first
        $rules = [
            'email'         => 'email',
            'firstname'     => 'required|string|max:100',
            'lastname'      => 'required|string|max:100',
            'role'          => 'required|string|in:ghost_player,ghost_coach'
        ];

        $this->validate($request, $rules);

        if ($request->role == 'ghost_player') {
            $this->member->newPlayer($team->id, $request->firstname, $request->lastname);
        }
        else {
            $this->member->newCoach($team->id, $request->firstname, $request->lastname);
        }

        if ($request->has('email')) {
            $this->member->invite($request->email);
        }

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

        // do a little bit of validation first
        $rules = [
            'isGhost'           => 'required|boolean',
            'meta.firstname'    => 'required_if:isGhost,true|string|max:100',
            'meta.lastname'     => 'required_if:isGhost,true|string|max:100',
            'meta.email'        => 'email',
            'meta.num'          => 'string|max:2',
            'meta.positions'    => 'array|max:2',
            'role'              => 'required|boolean',
            'admin'             => 'required|boolean'
        ];

        $validator = Validator::make($request->all(), $rules);

        if ($validator->fails()) {
            return ['ok' => false, 'errors' => $validator->errors()];
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
}
