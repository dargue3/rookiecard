<?php
namespace App\Http\Controllers;

use Auth;
use App\Team;
use Exception;
use Illuminate\Http\Request;
use App\RC\Stat\StatRepository;
use App\RC\Event\EventRepository;
use App\Http\Controllers\Controller;

class StatController extends Controller
{
    /**
     * An instance of a stat repository
     * 
     * @var StatRepository
     */
    protected $stat;


    /**
     * An instance of an event repository
     * 
     * @var EventRepository
     */
    protected $event;


    public function __construct(StatRepository $stat, EventRepository $event)
    {
        $this->middleware('auth');
        $this->middleware('admin');

        $this->stat = $stat;
        $this->event = $event;
    }



    /**
     * Store the given stats for a given team
     * 
     * @param  Request $request  
     * @param  Team  $team
     * @return array           
     */
    public function store(Request $request, Team $team)
    {
        $data = [
            'event'         => $this->event->findOrFail($request->event_id),
            'meta'          => $request->meta,
            'teamStats'     => $request->teamStats,
            'playerStats'   => $request->playerStats,
        ];

        $this->stat->store($data, $team);

        return ['ok' => true, 'stats' => $this->stat->findByTeam($team->id)];
    }


    /**
     * Update the stats for a given team and event
     * 
     * @param  Request $request  
     * @param  Team  $team 
     * @return array            
     */
    public function update(Request $request, Team $team)
    {
        $data = [
            'event'         => $this->event->findOrFail($request->event_id),
            'meta'          => $request->meta,
            'teamStats'     => $request->teamStats,
            'playerStats'   => $request->playerStats,
        ];

        $this->stat->update($data, $team);

        return ['ok' => true, 'stats' => $this->stat->findByTeam($team->id)];
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param Team $team
     * @param  int  $id  The id of the event that these stats are associated with
     * @return \Illuminate\Http\Response
     */
    public function destroy(Team $team, $id)
    {
        // check that this team owns this event
        if (Auth::user()->cannot('edit-events', [$team, $id])) {
            throw new Exception("Unauthorized Request");
        }

        $this->stat->deleteByEvent($team->id, $id);

        return ['ok' => true, 'stats' => $this->stat->findByTeam($team->id)];
    }
}
