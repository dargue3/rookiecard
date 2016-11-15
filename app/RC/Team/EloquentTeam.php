<?php
namespace App\RC\Team;

use App;
use App\Team;
use App\Stat;
use App\Event;
use App\NewsFeed;
use App\TeamRole;
use App\TeamMember;
use App\Notification;
use App\RC\Sports\Sport;
use App\RC\Stat\StatRepository;
use App\RC\Event\EventRepository;
use Illuminate\Support\Facades\Auth;
use App\RC\Team\TeamMemberRepository;
use App\RC\NewsFeed\NewsFeedRepository;
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
     * An instance of a data transformer for teams
     * 
     * @var TransformsTeamData
     */
    protected $transformer;


    public function __construct()
    {
        $this->transformer = new TransformsTeamData;
    }


    /**
     * Find a team by a given teamname
     * 
     * @param  string $teamname 
     * @return Team        
     */
    public function name($teamname)
    {
       return Team::name($teamname)->first(); 
    }



	/**
	 * Fetch the stats for a given team
	 * 
	 * @return array
	 */
	public function stats($team_id)
	{
        $repo = App::make(StatRepository::class);

		return $repo->findByTeam($team_id);
	}


	/**
	 * Fetch the events for a given team
	 * 
	 * @return array
	 */
	public function events($team_id)
    {
        $repo = App::make(EventRepository::class);

        $events = $repo->getTeamEvents($team_id);

        return $this->transformer->events($events);
    }


    /**
	 * Fetch the members of a given team
	 * 
	 * @return array
	 */
	public function members($team_id)
	{
        $repo = App::make(TeamMemberRepository::class);

		$members = $repo->members($team_id);

        return $this->transformer->members($members, $team_id);
	}


    /**
     * Return the ids of all users associated with this team
     * 
     * @param  int $team_id 
     * @return array 
     */
    public function users($team_id)
    {
        $repo = App::make(TeamMemberRepository::class);

        $users = $repo->users($team_id);

        return $this->transformer->users($users);
    }


	/**
	 * Fetch the news feed for a given team
	 * 
	 * @return array
	 */
	public function feed($team_id)
    {
        $repo = App::make(NewsFeedRepository::class);

        $feed = $repo->getTeamFeed($team_id);

        return  $this->transformer->feed($feed);
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
     * Return the team's timezone
     * 
     * @param  int $team_id 
     * @return string          
     */
    public function timezone($team_id)
    {
        $meta = json_decode(Team::findOrFail($team_id)->meta);
        
        if (isset($meta->tz)) {
            return $meta->tz;
        }
        
        return 'UTC';
    }


    /**
     * Fetch all of the data necessary to build a team view
     * 
     * @return array
     */
    public function getAllData($team_id) {

    	$data = [
            'team'      => $this->transformer->team(Team::findOrFail($team_id)),
            'members'   => $this->members($team_id),
            'feed'      => $this->feed($team_id),
            'events'    => $this->events($team_id),
            'stats'     => $this->stats($team_id),
            'positions' => $this->positions($team_id),
        ];

        return $data;
    }


    /**
     * Persist a new team with the given inputs into the database
     * 
     * @param  array  $data 
     * @return Team     
     */
    public function store(array $data)
    {
        return (new HandlesTeamCreationLogic($data))->create();
    }


    /**
     * Update a given team with the form data from a team's settings page
     * 
     * @param  array $data 
     * @param  int $team_id 
     * @return Team     
     */
    public function update(array $data, $team_id)
    {
        $data['sport'] = $this->sport($team_id)->name();
        
        return (new HandlesTeamCreationLogic($data, $team_id))->update();
    }


    /**
     * The logged-in user is taking some sort of action related to joining the given team
     * Simply passes off the data to a service class
     * 
     * @param  string $action  either: accept, decline, request, cancel
     * @param  int $team_id 
     * @return void
     */
    public function join($action, $team_id)
    {
        (new JoinTeam($action, $team_id))->handle();
    }



    /**
     * Seed a given team with events and stats for each player
     *    
     * @param int $team_id
     * @param int $count        The number of events to create 
     * @param boolean $erase    Whether or not to start completely fresh 
     * @return void
     */
    public function seed($team_id, $count = 10, $erase = false)
    {
        $members = $this->members($team_id);
        $sport = $this->sport($team_id);
        $types = ['home_game', 'away_game'];
        $oppScore = 26.8 * count($members); 

        if ($erase) {
            // want to start fresh
            Event::where('owner_id', $team_id)->delete();
            Stat::where('team_id', $team_id)->delete();
        }

        for ($x = 0; $x < $count; $x++) {
            $event = factory(Event::class)->create(['owner_id' => $team_id, 'type' => $types[array_rand($types, 1)]]);

            foreach ($members as $member) {
                factory(Stat::class)->create([
                    'sport'     => $sport->name(),
                    'owner_id'  => $member['id'],
                    'member_id' => $member['member_id'], 
                    'team_id'   => $team_id,
                    'meta'      => json_encode(['opp' => 'Test', 'oppScore' => rand($oppScore - 10, $oppScore + 10), 'event' => $event]),
                    'stats'     => json_encode($sport->generate()),
                    'event_id'  => $event->id,
                ]);
            }
        }
    }


}