<?php
namespace App\Http\Controllers;

use App\Team;
use App\NewsFeed;
use App\Http\Requests;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;


class TeamFeedController extends Controller
{
    /**
     * The instance of team repository
     * 
     * @var TeamRepository
     */
    private $team;

    public function __construct(TeamRepository $repo)
    {
        $this->middleware('auth');

        $this->middleware('admin', ['only' => 'store']);

        $this->team = $repo;
    }


    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        //
    }



    /**
     * Show the form for creating a new resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function create()
    {
        //
    }




    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request, Team $team)
    {
        $rules = ['post' => 'required|max:10000'];

        $validator = Validator::make($request->all(), $rules);

        if ($validator->fails()) {
            return ['ok' => false, 'errors' => $validator->errors()];
        }

        $entry = NewsFeed::userPostedToTeamFeed($team, $request->post);

        return ['ok' => true, 'entry' => $entry];
    }



    /**
     * Display the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function show($id)
    {
        //
    }



    /**
     * Show the form for editing the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function edit($id)
    {
        //
    }



    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, $id)
    {
        //
    }



    /**
     * Remove the specified resource from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
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
