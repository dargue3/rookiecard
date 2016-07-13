<?php
namespace App\RC\Stat;

use App;
use App\Team;
use Exception;
use App\RC\Sports\Sport;
use App\Events\TeamPostedStats;
use App\RC\Stat\StatRepository;
use App\RC\Event\EventRepository;
use App\RC\Team\TeamMemberRepository;

class HandlesStatLogic
{
	/**
	 * An instance of a stat repository
	 * 
	 * @var StatRepository
	 */
	protected $repo;


	/**
	 * Any extra data for these stats
	 * 
	 * @var array
	 */
	public $meta;


	/**
	 * The team that created these stats
	 * 
	 * @var Team
	 */
	public $team;


	/**
	 * The event that these stats are attached to
	 * 
	 * @var Event
	 */
	public $event;


	/**
	 * The compiled version of all the player stats
	 * 
	 * @var array
	 */
	public $teamStats;


	/**
	 * An array of arrays of each players' stats
	 * 
	 * @var array
	 */
	public $playerStats;


	/**
	 * An instance of the sport that this team plays
	 * 
	 * @var Sport
	 */
	public $sport;


	public function __construct(array $data, Team $team)
	{
        $this->team = $team;

		$this->sport = Sport::find($this->team->sport);
		$this->repo = App::make(StatRepository::class);

        $this->teamStats = $data['teamStats'];
		$this->playerStats = $data['playerStats'];

		$this->event = [
			'id'		=> $data['event']->id,
			'type'		=> $data['event']->type,
			'start'		=> $data['event']->start,
			'end'		=> $data['event']->end,
			'owner_id'	=> $data['event']->owner_id,
		];

        $this->meta = array_merge($data['meta'], ['event' => $this->event]);

		$this->authorize();
	}


	/**
	 * Throw an exception if there is anything fishy about the request data
	 * 
	 * @return void 
	 */
	public function authorize()
	{
		$memberRepo = App::make(TeamMemberRepository::class);

        foreach ($this->playerStats as $stats)    {
            $member = $memberRepo->findOrFail($stats['member_id']);

            if ($member->team_id != $this->team->id) {
                // this member doesn't belong to this team
                $team_id = $this->team->id;
                throw new Exception("A member ($member->id) doesn't belong to the given team ($team_id)");
            }

            if ($stats['id'] != $member->user_id) {
                // the stat's user_id doesn't match TeamMember's user_id, tampered with
                $id = $stats['id'];
                throw new Exception("The stats' user_id ($id) and member_id ($member->user_id) don't match");
            }
        }

        if ($this->event['owner_id'] != $this->team->id) {
            // event doesn't belong to this team
            $event_id = $this->event['id'];
            $team_id = $this->team->id;
            throw new Exception("The team ($team_id) isn't the owner of the event ($event_id)");
        }
	}

	/**
	 * Start the process of storing these new stats in the database 
	 * 
	 * @return HandlesStatLogic
	 */
	public function create()
	{
		$this->teamStats = $this->sport->validateTeamStats($this->teamStats);
		$this->playerStats = $this->sport->validatePlayerStats($this->playerStats);

		if (count($this->playerStats) > 0) {
			$this->createPlayerStats();
			$this->createTeamStats();	

			event(new TeamPostedStats($this->team->id, $this->meta));
		}

		return $this;
	}


	/**
	 * Update the stats for a given event by deleting them and adding new ones
	 * 
	 * @return HandlesStatLogic
	 */
	public function update()
	{
		$stats = $this->repo->deleteByEvent($this->team->id, $this->event['id']);

		return $this->create();
	}


	/**
	 * Iterate through all the player stats saving them into the database
	 * 
	 * @return void 
	 */
	private function createPlayerStats()
	{
		foreach ($this->playerStats as $stats) {
			// save and remove extra data about the stats
			$user_id = $stats['id'];
			$member_id = $stats['member_id'];
			unset($stats['id']);
			unset($stats['member_id']);

			$this->repo->create([
				'owner_id'		=> $user_id,
				'member_id'		=> $member_id,
				'team_id'		=> $this->team->id,
				'sport'			=> $this->team->sport,
				'type'			=> 'player',
				'season'		=> $this->team->season,
				'event_id'		=> $this->event['id'],
				'meta'			=> json_encode($this->meta),
				'stats'			=> json_encode($stats),
			]);
		}
	}


	/**
	 * Save the team stats into the database
	 * 
	 * @return void
	 */
	private function createTeamStats()
	{
		$this->repo->create([
			'owner_id'		=> $this->team->id,
			'member_id'		=> null,
			'team_id'		=> $this->team->id,
			'sport'			=> $this->team->sport,
			'type'			=> 'team',
			'season'		=> $this->team->season,
			'event_id'		=> $this->event['id'],
			'meta'			=> json_encode(array_merge($this->meta, ['event' => $this->event])),
			'stats'			=> json_encode($this->teamStats),
		]);
	}
}