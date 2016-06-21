<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use App\Team;
use App\Http\Requests;
use App\Http\Controllers\Controller;
use App\Repositories\EventRepository;
use App\Repositories\TeamRepository;
use App\Http\Requests\NewEventRequest;

class EventController extends Controller
{
    /**
     * An instance of a event repository
     * @var EventRepository
     */
    private $event;

    /**
     * An instance of a team repository
     * @var TeamRepository
     */
    private $team;


    public function __construct(EventRepository $event, TeamRepository $team)
    {
        $this->middleware('auth');
        $this->middleware('admin');

        $this->event = $event;
        $this->team = $team;
    }


    /**
     * Store a newly created resource in storage.
     *
     * @param  App\Http\Requests\NewEventRequest  $request
     * @param  Team  $team
     * @return \Illuminate\Http\Response
     */
    public function store(NewEventRequest $request, Team $team)
    {
        $feed = $this->event->create($request, $team);

        $events = $this->team->events($team);

        return ['ok' => true, 'feed' => $feed, 'events' => $events];
    }


    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  Team  $team
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function update(NewEventRequest $request, Team $team, $id)
    {
        if (Auth::user()->cannot('edit-events', [$team, $id])) {
            throw new \Exception;
        }

        $feed = $this->event->update($team, $request, $id);

        return ['ok' => true, 'feed' => $feed];
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  Team  $team
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy(Team $team, $id)
    {
        if (Auth::user()->cannot('edit-events', [$team, $id])) {
            throw new \Exception;
        }

        $feed = $this->event->delete($id);

        return ['ok' => true, 'feed' => $feed];
    }
}
