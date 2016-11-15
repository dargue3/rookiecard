<?php
namespace App\Http\Controllers;

use App\Team;
use Validator;
use Exception;
use App\Http\Requests;
use Illuminate\Http\Request;
use App\RC\Team\TeamRepository;
use App\RC\Event\EventRepository;
use App\Http\Requests\EventRequest;
use Illuminate\Support\Facades\Auth;
use App\Http\Controllers\Controller;

class EventController extends Controller
{
    /**
     * An instance of event repository
     * 
     * @var EventRepository
     */
    protected $event;


    /**
     * An instance of team repository
     * 
     * @var TeamRepository
     */
    protected $team;


    public function __construct(EventRepository $event, TeamRepository $team)
    {
        $this->event = $event;
        $this->team = $team;
    }


    /**
     * Store an event with the given request data
     *
     * @param  EventRequest  $request
     * @param  Team  $team
     * @return Illuminate\Http\Response
     */
    public function store(EventRequest $request, Team $team)
    {
        $this->event->store($request->all(), $team->id);

        return ['ok' => true, 'events' => $this->event->getTeamEvents($team->id)];
    }


    /**
     * Updated the given event with info from request data
     *
     * @param  EventRequest  $request
     * @param  Team  $team
     * @param  int  $id
     * @return Illuminate\Http\Response
     */
    public function update(EventRequest $request, Team $team, $id)
    {
        if (Auth::user()->cannot('edit-events', [$team, $id])) {
            throw new Exception("Unauthorized Request");
        }

        $this->event->update($request->all(), $team->id, $id);

        return ['ok' => true, 'events' => $this->event->getTeamEvents($team->id)];
    }



    /**
     * Delete the given event
     *
     * @param  Team  $team
     * @param  int  $id
     * @return Illuminate\Http\Response
     */
    public function destroy(Team $team, $id)
    {
        if (Auth::user()->cannot('edit-events', [$team, $id])) {
            throw new Exception("Unauthorized Request");
        }

        $this->event->delete($team->id, $id);

        return ['ok' => true, 'events' => $this->event->getTeamEvents($team->id)];
    }
}
