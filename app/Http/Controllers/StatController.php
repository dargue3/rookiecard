<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use App\Http\Requests;
use App\Http\Controllers\Controller;

use App\Stat;
use App\Team;

class StatController extends Controller
{

    //logged in user, team admin for adding/editing/deleting
    public function __construct() {

        $this->middleware('auth');

        $this->middleware('admin', ['except' => 'index']);

    }


    //return the stats for this team
    public function index($teamname) {

        $team = Team::where('teamname', $teamname)->firstOrFail();

        $stats = Stat::where('team_id', $team->id)->get()->toArray();
        
        return $stats;
        
   

    }


    //stores stats sent from ajax request from team page
    public function store(Request $request)
    {
        $playerStats = $request->playerStats;
        $teamStats = $request->teamStats;
        $updated = $request->updated;
        $event = $request->event;
        $team = $request->team;
        $meta = $request->meta;


        $stats = new Stat;

        $newStats = [];


        $playerStats = $stats->createUserStats($team, $playerStats, $event, $meta);

        if(empty($playerStats))
            //no stats were added to the db, don't add team stats either
            return;

        $teamStats = $stats->createTeamStats($team, $teamStats, $event, $meta);

        $newFeedEntry = $teamStats['feed'];
        $newStats[] = $teamStats['stats'];

        
        //make all results into just one array
        foreach($playerStats as $newStat) 
            $newStats[] = $newStat;
    

        return ['stats' => $newStats, 'feed' => $newFeedEntry];
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


    //stats were updated by admin
    //id is ignored, stats passed in with data
    public function update(Request $request, $teamname, $id)
    {
        $team = Team::name($teamname)->firstOrFail();

        //stat policies
        //$this->authorize($team);

        $playerStats = $request->playerStats;
        $teamStats = $request->teamStats;
        $event = $request->event;
        $meta = $request->meta;
        $team = $request->team;


        $stats = new Stat;

        return $stats->updateStats($team, $teamStats, $playerStats, $event, $meta);

    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy($teamname, $id)
    {
        $team = Team::where('teamname', $teamname)->firstOrFail();

        Stat::where('team_id', $team->id)->where('event_id', $id)->delete();
    }
}
