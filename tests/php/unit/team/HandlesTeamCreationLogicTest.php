<?php

use App\Team;
use App\RC\Team\Roles\Fan;
use App\RC\Team\Roles\Coach;
use App\RC\Team\Roles\Player;
use App\RC\Team\TeamRepository;
use App\RC\Helpers\UploadsPhotos;
use App\RC\Sports\SportInterface;
use App\RC\Team\TeamMemberRepository;
use App\RC\Team\HandlesTeamCreationLogic;

class HandlesTeamCreationLogicTest extends TestCase
{
	/**
	 * The dummy request data
	 * 
	 * @var array
	 */
	protected $data;


	public function setUp()
	{
		parent::setUp();

		$this->signIn();

		$this->seedRolesTable();

		$this->data = [
			'name'			=> 'Team Test',
			'teamURL'		=> 'teamname',
			'gender'		=> 'male',
			'sport'			=> 'basketball',
			'slogan'		=> 'Here goes nothin!',
			'homefield'		=> 'My backyard',
			'city'			=> 'Providence, RI',
			'lat'			=> 69.24828429,
            'long'          => -72.4824724,
			'timezone'	    => 'America/New_York',
			'userIsA'		=> 'fan',
			'userStats'		=> ['pts', 'fgm', 'fga'],
			'rcStats'		=> ['fg_'],
			'players'		=> [
				['firstname' => 'Testy', 'lastname' => 'McGee', 'email' => 'player@rookiecard.com'],
				['firstname' => 'Tester', 'lastname' => 'McTestFace', 'email' => ''],
			],
			'coaches'		=> [
				['firstname' => 'Coach', 'lastname' => 'Test', 'email' => 'coach@rookiecard.com'],
			],
		];	
	}


    /** @test */
    public function the_constructor_sets_the_trivial_data_to_attributes_for_later_access()
    {
    	$handler = new HandlesTeamCreationLogic($this->data);

    	$this->assertEquals('Team Test', $handler->name);
    	$this->assertEquals('teamname', $handler->teamname);
    	$this->assertEquals('male', $handler->gender);
    	$this->assertEquals('Here goes nothin!', $handler->meta['slogan']);
    	$this->assertEquals('My backyard', $handler->meta['homefield']);
    	$this->assertEquals('Providence, RI', $handler->meta['city']);
    	$this->assertEquals('America/New_York', $handler->meta['tz']);
        $this->assertEquals(69.24828429, $handler->lat);
        $this->assertEquals(-72.4824724, $handler->long);
    	$this->assertEquals(['firstname' => 'Testy', 'lastname' => 'McGee', 'email' => 'player@rookiecard.com'], $handler->players[0]);
    	$this->assertEquals(['firstname' => 'Tester', 'lastname' => 'McTestFace', 'email' => ''], $handler->players[1]);
    	$this->assertEquals(['firstname' => 'Coach', 'lastname' => 'Test', 'email' => 'coach@rookiecard.com'], $handler->coaches[0]);
    }

    /** @test */
    public function the_constructor_validates_the_stat_keys_and_saves_them_in_meta_data()
    {
    	$handler = new HandlesTeamCreationLogic($this->data);

    	$formattedStats = ['date', 'name', 'win', 'opp', 'pts', 'fgm', 'fga', 'fg_'];	

    	$this->assertEquals($formattedStats, $handler->meta['stats']);
    }


    /** @test */
    public function the_constructor_converts_the_selected_sport_into_a_class()
    {
    	$handler = new HandlesTeamCreationLogic($this->data);

    	$this->assertTrue(is_a($handler->sport, SportInterface::class));
    }


    /** @test */
    public function the_constructor_converts_the_users_role_into_a_class()
    {
    	$handler = new HandlesTeamCreationLogic($this->data);

    	$this->assertTrue(is_a($handler->userIsA, Fan::class));

    	$this->data['userIsA'] = 'player';
    	$handler = new HandlesTeamCreationLogic($this->data);

    	$this->assertTrue(is_a($handler->userIsA, Player::class));

    	$this->data['userIsA'] = 'coach';
    	$handler = new HandlesTeamCreationLogic($this->data);

    	$this->assertTrue(is_a($handler->userIsA, Coach::class));
    }


    /** @test */
    public function it_creates_a_team()
    {
    	$repo = App::make(TeamRepository::class);

    	$team = (new HandlesTeamCreationLogic($this->data))->create();

    	$this->assertCount(1, $repo->all());
    	$this->assertEquals(1, $team->id);
    }


    /** @test */
    public function it_adds_the_logged_in_user_to_the_team_according_to_their_chosen_role()
    {
    	$mock = $this->mock(TeamMemberRepository::class);
    	$mock->shouldReceive('addTeamCreator')->once();

    	$this->data['coaches'] = [];
    	$this->data['players'] = [];
    	(new HandlesTeamCreationLogic($this->data))->create();
    }


    /** @test */
    public function it_adds_players_to_the_team()
    {
    	$mock = $this->mock(TeamMemberRepository::class);
    	$mock->shouldReceive('newPlayer')->twice()->andReturn($mock);
    	$mock->shouldReceive('invite')->twice();
    	$mock->shouldReceive('addTeamCreator')->once();

    	$this->data['coaches'] = [];
    	(new HandlesTeamCreationLogic($this->data))->create();
    }


    /** @test */
    public function it_adds_coaches_to_the_team()
    {
    	$mock = $this->mock(TeamMemberRepository::class);
    	$mock->shouldReceive('newCoach')->once()->andReturn($mock);
    	$mock->shouldReceive('invite')->once();
    	$mock->shouldReceive('addTeamCreator')->once();

    	$this->data['players'] = [];
    	(new HandlesTeamCreationLogic($this->data))->create();
    }


    /** @test */
    public function if_the_players_or_coaches_array_is_not_present_in_the_request__gets_set_to_an_empty_array()
    {
        unset($this->data['players']);
        unset($this->data['coaches']);

        $handler = new HandlesTeamCreationLogic($this->data);

        $this->assertEquals([], $handler->players);
        $this->assertEquals([], $handler->coaches);
    }


    /** @test */
    public function it_updates_a_team_with_the_given_data()
    {
        $team = factory(Team::class)->create();

        $this->assertFalse($team->name === 'Team Test');
        $this->assertFalse($team->teamname === 'teamname');

        $team = (new HandlesTeamCreationLogic($this->data, $team->id))->update();

        $this->assertEquals('Team Test', $team->name);
        $this->assertEquals('teamname', $team->teamname);
        $this->assertEquals(69.24828429, $team->lat);
        $this->assertEquals(-72.4824724, $team->long);

        $meta = json_decode($team->meta);
        $this->assertEquals('Here goes nothin!', $meta->slogan);
        $this->assertEquals('My backyard', $meta->homefield);
        $this->assertEquals('Providence, RI', $meta->city);
        $this->assertEquals('America/New_York', $meta->tz);
    }


    /** @test */
    public function if_present_in_request__prepares_new_images_and_saves_to_s3__deletes_originals()
    {
        $team = factory(Team::class)->create();

        $this->data['pic'] = ['url' => '/storage/tmp/test.jpeg', 'crops' => [0, 0, 300, 150]];
        $this->data['backdrop'] = ['url' => '/storage/tmp/test.jpeg', 'crops' => [0, 0, 300, 150]];

        $this->mock(UploadsPhotos::class);
        
        // uploader loads image, deletes image stored at existing team->pic url, crops new picture, stores it in s3
        $this->mock->shouldReceive('loadImage->deleteOriginal->crop->moveFromLocalToS3')->twice()->andReturn('blah');

        $team = (new HandlesTeamCreationLogic($this->data, $team->id))->update();
    }
}