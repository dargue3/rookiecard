<?php
namespace App\Http\Controllers;

use Auth;
use App\Team;
use Exception;
use App\NewsFeed;
use Illuminate\Http\Request;
use App\Events\UserPostedToTeamFeed;
use App\Http\Controllers\Controller;
use App\RC\NewsFeed\NewsFeedRepository;

class TeamFeedController extends Controller
{
    /**
     * An instance of a news feed repository
     * 
     * @var NewsFeedRepository
     */
    protected $feed;


    public function __construct(NewsFeedRepository $feed)
    {
        $this->middleware('auth');

        $this->middleware('admin', ['only' => 'destroy']);

        $this->feed = $feed;
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
            throw new Exception("Unauthorized request");
        }

        $this->feed->destroy($id);

        return ['ok' => true];
    }
}
