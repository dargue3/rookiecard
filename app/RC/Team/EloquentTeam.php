<?php
namespace App\RC\Team;

use App\Stat;
use App\Event;
use App\Team;
use App\NewsFeed;
use App\TeamRole;
use App\TeamMember;
use App\Notification;
use App\RC\Sports\Sport;
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
     * Instance of an event repository
     * 
     * @var EventRepository
     */
    protected $event;


    public function __construct(EventRepository $event)
    {
        $this->event = $event;
    }



	/**
	 * Fetch the stats for a given team
	 * 
	 * @return array
	 */
	public function stats($team_id)
	{
		return Stat::where('team_id', $team_id)->get();
	}


	/**
	 * Fetch the events for a given team
	 * 
	 * @return array
	 */
	public function events($team_id)
    {
        return $this->event->allEventsForTeam($team_id);
    }


    /**
	 * Fetch the members of a given team
	 * 
	 * @return array
	 */
	public function members($team_id)
	{
		$members = TeamMember::where('team_id', $team_id)->get();

        return (new TransformsData)->transformMembers($members, $team_id);
	}


	/**
	 * Fetch the news feed for a given team
	 * 
	 * @return array
	 */
	public function feed($team_id)
    {
        return NewsFeed::where('owner_id', $team_id)->where('type', '<', 10)->orderBy('created_at', 'desc')->get();
    }


    /**
	 * Fetch the positions associated with the sport this team plays
	 * 
	 * @return array
	 */
    public function positions($team_id)
    {
        return $this->sport($team_id)->positions();
    }


    /**
     * Fetch the sport played by a given team
     * 
     * @param  int $team_id
     * @return SportInterface
     */
    public function sport($team_id)
    {
        return Sport::find(Team::findOrFail($team_id)->sport);
    }


    /**
     * Fetch all of the data necessary to build a team view
     * 
     * @return array
     */
    public function getAllData($team_id) {

    	$data = [
            'auth'      => Auth::user(),
            'team'      => $this->findOrFail($team_id),
            'members'   => $this->members($team_id),
            'feed'      => $this->feed($team_id),
            'events'    => $this->events($team_id),
            'stats'     => $this->stats($team_id),
            'positions' => $this->positions($team_id),
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