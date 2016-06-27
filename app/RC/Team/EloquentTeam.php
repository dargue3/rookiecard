<?php
namespace App\RC\Team;

use App\Stat;
use App\Team;
use App\Event;
use App\NewsFeed;
use App\TeamRole;
use App\TeamMember;
use App\Notification;
use App\RC\Sports\Sport;
use App\RC\Team\TransformsData;
use App\RC\Events\EventRepository;
use Illuminate\Support\Facades\Auth;
use App\Repositories\EloquentRepository;

class EloquentTeam extends EloquentRepository implements TeamRepository
{
    /**
     * The path of this model, to be used in EloquentRepository
     * 
     * @var string
     */
    protected $modelPath = 'App\Team';

    /**
     * Instance of EventRepository
     * @var EventRepository
     */
    protected $event;
    

    public function __construct(EventRepository $event)
    {
        $this->event = $event;
    }



	/**
	 * Fetch the stats associated with this team
	 * 
	 * @return array
	 */
	public function stats(Team $team)
	{
		return Stat::where('team_id', $team->id)->get();
	}


	/**
	 * Fetch the events associated with this team
	 * 
	 * @return array
	 */
	public function events(Team $team)
    {
        return Event::where('owner_id', $team->id)->orderBy('start')->get();
    }


    /**
	 * Fetch the members associated with this team
	 * 
	 * @return array
	 */
	public function members(Team $team)
	{
		$members = TeamMember::where('team_id', $team->id)->get();

        return (new TransformsData)->transformMembers($members, $team);
	}


	/**
	 * Fetch the news feed associated with this team
	 * 
	 * @return array
	 */
	public function feed(Team $team)
    {
        return NewsFeed::where('owner_id', $team->id)->where('type', '<', 10)->orderBy('created_at', 'desc')->get();
    }


    /**
	 * Fetch the positions associated with the sport this team plays
	 * 
	 * @return array
	 */
    public function positions(Team $team)
    {
        return Sport::find($team->sport)->positions();
    }


    /**
     * Fetch all of the data necessary to build a team view
     * 
     * @return array
     */
    public function getAllData(Team $team) {

    	$data = [
            'auth'      => Auth::user(),
            'team'      => $team,
            'members'   => $this->members($team),
            'feed'      => $this->feed($team),
            'events'    => $this->events($team),
            'stats'     => $this->stats($team),
            'positions' => $this->positions($team),
        ];

        return $data;
    }




    // create a team with request data from TeamController
    public function create(array $data)
    {
        // do some quick housekeeping of the inputs
        $gender = intval($request->gender);
        if ($gender < 0 || $gender > 2)
            $gender = 0;

        $sport = intval($request->sport);
        // look up supported sports in Sports::class


        // put together an array of meta data
        $stats = new Stat;
        $statKeys = $stats->getStatKeys($sport, $request->userStats, $request->rcStats);

        $meta = [
            'stats'     => $statKeys,
            'homefield' => $request->homefield,
            'city'      => $request->city,
            'slogan'    => $request->slogan,
        ];

        $team = $this->create([
            'name'          => $request->name,
            'teamname'      => $request->teamname,
            'gender'        => $gender,
            'sport'         => $sport,
            'pic'           => '/images/proPic_default.jpeg',
            'long'          => $request->long,
            'lat'           => $request->lat,
            'meta'          => json_encode($meta),
            'season'        => 1,
            'creator_id'    => Auth::user()->id,
        ]);

        $role = $request->userIsA;
        if ($role == 'fan')
        {
            $role = TeamRole::FAN;
        }
        else if ($role == 'player')
        {
            $role = TeamRole::PLAYER;
        }
        else if ($role == 'coach')
        {
            $role = TeamRole::COACH;
        }

        // add the user who created the team as their perspective role (and admin)
        TeamMember::create([
            'user_id'   => Auth::user()->id,
            'team_id'   => $team->id,
            'admin'     => 1,
            'role'      => $role,
            'meta'      => json_encode(TeamMember::getDefaultMetaData()),
        ]);

        $players = $request->players;
        $coaches = $request->coaches;
        // remove auth user from array of players or coaches if necessary
        if ($role == TeamRole::PLAYER)
        {
            array_shift($players);
        }
        else if ($role == TeamRole::COACH)
        {
            array_shift($coaches);
        }


        // loop through the players and coaches to create TeamMember entries 
        foreach ($players as $player)
        {
            TeamMember::addMember($team->id, TeamRole::GHOST_PLAYER, $player);
        }

        foreach ($coaches as $coach)
        {
            TeamMember::addMember($team->id, TeamRole::GHOST_COACH, $coach);
        }

        return ['ok' => true, 'team' => $team];
    }


}