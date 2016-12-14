<?php
namespace App\RC\Team;

use App;
use Auth;
use App\RC\Sports\Sport;
use App\RC\Team\Roles\Player;
use App\RC\Team\Roles\Coach;
use App\RC\Team\Roles\Fan;
use App\RC\Helpers\UploadsPhotos;

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
    public $age;
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
        $this->photoUploader = App::make(UploadsPhotos::class);

        $this->name = $data['name'];
        $this->teamname = $data['teamURL'];

        $this->sport = Sport::find($data['sport']);

        $this->long = $data['long'];
        $this->lat = $data['lat'];
        $this->timezone = $data['timezone'];
        $this->meta = [
            'homefield' => $data['homefield'],
            'city'      => $data['city'],
            'slogan'    => $data['slogan'],
            'tz'        => $data['timezone'],
        ];

        $this->attachSettings($data);

        if (isset($team_id)) {
            // just updating this team's data, don't do the rest of the constructor
            $this->team = $this->teamRepo->find($team_id);
            if (isset($data['pic'])) {
                $this->pic = $data['pic'];
            }
            if (isset($data['backdrop'])) {
                $this->backdrop = $data['backdrop'];
            }
            return;
        }

        $this->gender = $data['gender'];
        $this->age = $data['age'];
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
            'age'           => $this->age,
            'long'          => $this->long,
            'lat'           => $this->lat,
            'meta'          => json_encode($this->meta),
            'pic'           => $this->sport->profilePicPath(),
            'backdrop'      => $this->sport->backdropPath(),
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
        $this->team->meta       = json_encode($this->meta);

        $this->updatePhotos();

        $this->team->save();

        return $this->team;
    }


    /**
     * Crop photos and save them to permanent storage in S3
     * If uploading a new image, deletes the one stored in the data
     * 
     * @return void
     */
    protected function updatePhotos()
    {
        if (isset($this->pic)) {
            $this->team->pic = $this->photoUploader->loadImage($this->pic['url'])
                                                   ->deleteOriginal($this->team->pic)
                                                   ->crop($this->pic['crops'])
                                                   ->moveFromLocalToS3('team_profile');
        }

        if (isset($this->backdrop)) {
            $this->team->backdrop = $this->photoUploader->loadImage($this->backdrop['url'])
                                                        ->deleteOriginal($this->team->backdrop)
                                                        ->crop($this->backdrop['crops'])
                                                        ->moveFromLocalToS3('team_backdrop');
        }
    }


    /**
     * Attach settings to the team's meta data
     * 
     * @param  array $data  The data from the request
     * @return void
     */
    public function attachSettings($data)
    {
        if (! isset($data['statKeys'])) {
            $data['statKeys'] = [];
        }

        $this->meta['settings'] = [
            'onlyMembersCanViewLocation'    => isset($data['onlyMembersCanViewLocation']) ? $data['onlyMembersCanViewLocation'] : false,
            'onlyMembersCanViewRoster'      => isset($data['onlyMembersCanViewRoster']) ? $data['onlyMembersCanViewRoster'] : false,
            'onlyMembersCanViewEvents'      => isset($data['onlyMembersCanViewEvents']) ? $data['onlyMembersCanViewEvents'] : false,
            'membersAreInviteOnly'          => isset($data['membersAreInviteOnly']) ? $data['membersAreInviteOnly'] : false,
            'fansRequireAcceptance'         => isset($data['fansRequireAcceptance']) ? $data['fansRequireAcceptance'] : false,
            'notifyOnNewEvent'              => isset($data['notifyOnNewEvent']) ? $data['notifyOnNewEvent'] : true,
            'notifyOnEditedEvent'           => isset($data['notifyOnEditedEvent']) ? $data['notifyOnEditedEvent'] : true,
            'notifyOnDeletedEvent'          => isset($data['notifyOnDeletedEvent']) ? $data['notifyOnDeletedEvent'] : true,
            'notifyOnNewStats'              => isset($data['notifyOnNewStats']) ? $data['notifyOnNewStats'] : true,
            'notifyOnNewMember'             => isset($data['notifyOnNewMember']) ? $data['notifyOnNewMember'] : false,
            'statKeys'                      => $this->sport->validateKeys($data['statKeys']),
        ];
    }
}




