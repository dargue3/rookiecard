<?php
namespace App\RC\Team;

use App;
use Auth;
use App\RC\Sports\Sport;
use App\RC\Team\Roles\Player;
use App\RC\Team\Roles\Coach;
use App\RC\Team\Roles\Fan;

class HandlesTeamCreationLogic
{
	/**
	 * An instance of a team repository
	 * 
	 * @var TeamRepository
	 */
	protected $teamRepo;

    /**
     * An instance of a team member repository
     * 
     * @var TeamMemberRepository
     */
    protected $memberRepo;

    /**
     * The following are attributes to be used during creation
     */
    public $name;
    public $teamname;
    public $sport;
    public $meta;
    public $gender;
    public $long;
    public $lat;
    public $pic;
    public $backdrop;
    public $players;
    public $coaches;
    public $userIsA;

    /**
     * The recently created team
     * 
     * @var Team
     */
    public $team = null;


	public function __construct(array $data, $team_id = null)
	{
        $this->teamRepo = App::make(TeamRepository::class);
		$this->memberRepo = App::make(TeamMemberRepository::class);

        $this->name = $data['name'];
        $this->teamname = $data['teamURL'];

        $this->sport = Sport::find($data['sport']);

        $this->meta = [
            'stats'     => $this->sport->sortKeys(array_merge($data['userStats'], $data['rcStats'])),
            'homefield' => $data['homefield'],
            'city'      => $data['city'],
            'slogan'    => $data['slogan'],
            'tz'        => $data['timezone'],
        ];

        $this->long = $data['long'];
        $this->lat = $data['lat'];
        $this->timezone = $data['timezone'];

        if (isset($team_id)) {
            // just updating this team's data, don't do the rest of the constructor
            $this->team = $this->teamRepo->find($team_id);
            $this->pic = $data['pic'];
            $this->backdrop = $data['backdrop'];
            return;
        }

        $this->gender = $data['gender'];
        $this->players = isset($data['players']) ? $data['players'] : [];
        $this->coaches = isset($data['coaches']) ? $data['coaches'] : [];

        switch($data['userIsA']) {
            case 'player':
                $this->userIsA = new Player;
                break;
            case 'coach':
                $this->userIsA = new Coach;
                break;
            case 'fan':
                $this->userIsA = new Fan;
                break;
            default:
                $role = $data['userIsA'];
                throw new Exception("Unsupported user role '$role'");
                break;
        }
	}


	/**
	 * Store this new team in the database
	 * 
	 * @return Team  The newly created team
	 */
	public function create()
	{
        $this->team = $this->teamRepo->create([
            'name'          => $this->name,
            'teamname'      => $this->teamname,
            'season'        => 1,
            'sport'         => $this->sport->name(),
            'gender'        => $this->gender,
            'long'          => $this->long,
            'lat'           => $this->lat,
            'meta'          => json_encode($this->meta),
            'pic'           => '/images/proPic_default.jpeg',
            'backdrop'      => '/images/proPic_default.jpeg',
            'creator_id'    => Auth::id(),
        ]);

        $this->addMembers();

        return $this->team;
	}


    /**
     * Add members to the new team
     * 
     * @return void
     */
    public function addMembers()
    {
        foreach ($this->players as $player) {
            $this->memberRepo->newPlayer($this->team->id, $player['firstname'], $player['lastname'])
                            ->invite($player['email']);
        }

        foreach ($this->coaches as $coach) {
            $this->memberRepo->newCoach($this->team->id, $coach['firstname'], $coach['lastname'])
                            ->invite($coach['email']);
        }

        $this->memberRepo->addTeamCreator($this->team->id, $this->userIsA);
    }


    /**
     * Update the given team with the details given in the constructor
     * 
     * @return Team
     */
    public function update()
    {
        $this->team->name       = $this->name;
        $this->team->teamname   = $this->teamname;
        $this->team->lat        = $this->lat;
        $this->team->long       = $this->long;
        $this->team->pic        = $this->pic;
        $this->team->backdrop   = $this->backdrop;
        $this->team->meta       = json_encode($this->meta);

        $this->team->save();

        return $this->team;
    }
}