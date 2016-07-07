<?php
namespace App\Http\Controllers;

use App\Team;
use App\NewsFeed;
use App\Http\Requests;
use Illuminate\Http\Request;
use App\RC\Team\TeamRepository;
use App\Http\Controllers\Controller;

class TeamFeedController extends Controller
{
    /**
     * An instance of a team repository
     * 
     * @var TeamRepository
     */
    protected $team;


    public function __construct(TeamRepository $team)
    {
        $this->middleware('auth');

        $this->middleware('admin', ['only' => 'destroy']);

        $this->team = $team;
    }


    /**
     * Store a newly created resource in storage.
     *
     * @param  Illuminate\Http\Request  $request
     * @return Illuminate\Http\Response
     */
    public function store(Request $request, Team $team)
    {
        $this->validate($request, ['post' => 'required|max:10000']);

        event(new UserPostedToTeamFeed($team->id, $request->post));

        return ['ok' => true];
    }


    /**
     * Remove the specified resource from storage.
     *
     * @param  int  $id
     * @return Illuminate\Http\Response
     */
    public function destroy(Team $team, $id)
    {
        if (Auth::user()->cannot('edit-posts', [$team, $id])) {
            return ['ok' => false, 'error' => 'Unauthorized request'];
        }

        NewsFeed::findOrFail($id)->delete();

        return ['ok' => true];
    }
}
