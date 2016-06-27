<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use App\Team;
use Validator;
use App\Http\Requests;
use App\RC\Team\TeamRepository;
use App\Exceptions\ApiException;
use App\RC\Events\EventRepository;
use Illuminate\Support\Facades\Auth;
use App\Http\Controllers\Controller;
use App\Http\Requests\NewEventRequest;

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
        $this->middleware('auth');
        $this->middleware('admin');

        $this->event = $event;
        $this->team = $team;
    }


    /**
     * Store an event with the given request data
     *
     * @param  App\Http\Requests\NewEventRequest  $request
     * @param  Team  $team
     * @return \Illuminate\Http\Response
     */
    public function store(NewEventRequest $request, Team $team)
    {
        // fetch the request data to send to the repo
        $data = $request->all();
        $data['tz'] = $request->session()->get('timezone');

        $feed = $this->event->store($data, $team);

        return ['ok' => true, 'events' => $this->team->events($team)];
    }


    /**
     * Updated the given event with info from request data
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  Team  $team
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, Team $team, $id)
    {
        if (Auth::user()->cannot('edit-events', [$team, $id])) {
            throw new ApiException("Unauthorized Request");
        }

        $rules = [
            'title'             => 'required|max:50',
            'type'              => 'required|size:1',
            'start'             => 'required|integer',
            'end'               => 'required|integer',
            'details'           => 'max:5000',
        ];

        $validator = Validator::make($request->all(), $rules);

        if ($validator->fails()) {
            return ['ok' => false, 'errors' => $validator->errors()];
        }

        // fetch the request data to send to the repo
        $data = $request->all();
        $data['tz'] = $request->session()->get('timezone');

        $feed = $this->event->update($data, $team, $id);

        return ['ok' => true, 'feed' => $feed, 'events' => $this->team->events($team)];
    }



    /**
     * Delete the given event
     *
     * @param  Team  $team
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy(Team $team, $id)
    {
        if (Auth::user()->cannot('edit-events', [$team, $id])) {
            throw new ApiException("Unauthorized Request");
        }

        $feed = $this->event->delete($team, $id);

        return ['ok' => true, 'feed' => $feed, 'events' => $this->team->events($team)];
    }
}
