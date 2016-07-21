<?php

use App\RC\Team\Roles\Fan;
use App\RC\Team\Roles\Coach;
use App\RC\Team\Roles\Player;
use App\RC\Team\TeamRepository;
use App\RC\Team\CreatesNewTeam;
use App\RC\Sports\SportInterface;
use App\RC\Team\TeamMemberRepository;

class CreatesNewTeamTest extends TestCase
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
			'teamname'		=> 'teamname',
			'gender'		=> 'male',
			'sport'			=> 'basketball',
			'slogan'		=> 'Here goes nothin!',
			'homefield'		=> 'My backyard',
			'city'			=> 'Providence, RI',
			'lat'			=> 69.24828429,
			'long'			=> -72.4824724,
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
    	$handler = new CreatesNewTeam($this->data);

    	$this->assertEquals('Team Test', $handler->name);
    	$this->assertEquals('teamname', $handler->teamname);
    	$this->assertEquals('male', $handler->gender);
    	$this->assertEquals('Here goes nothin!', $handler->meta['slogan']);
    	$this->assertEquals('My backyard', $handler->meta['homefield']);
    	$this->assertEquals('Providence, RI', $handler->meta['city']);
    	$this->assertEquals(69.24828429, $handler->lat);
    	$this->assertEquals(-72.4824724, $handler->long);
    	$this->assertEquals(['firstname' => 'Testy', 'lastname' => 'McGee', 'email' => 'player@rookiecard.com'], $handler->players[0]);
    	$this->assertEquals(['firstname' => 'Tester', 'lastname' => 'McTestFace', 'email' => ''], $handler->players[1]);
    	$this->assertEquals(['firstname' => 'Coach', 'lastname' => 'Test', 'email' => 'coach@rookiecard.com'], $handler->coaches[0]);
    }

    /** @test */
    public function the_constructor_sorts_the_stats_into_keys_for_players_and_keys_for_teams()
    {
    	$handler = new CreatesNewTeam($this->data);

    	$formattedStats = [
    		'teamCols' 		=> ['date', 'win', 'opp', 'pts', 'fgm', 'fga', 'fg_'],
    		'playerCols' 	=> ['name', 'pts', 'fgm', 'fga', 'fg_']
    	];	

    	$this->assertEquals($formattedStats, $handler->meta['stats']);
    }


    /** @test */
    public function the_constructor_converts_the_selected_sport_into_a_class()
    {
    	$handler = new CreatesNewTeam($this->data);

    	$this->assertTrue(is_a($handler->sport, SportInterface::class));
    }


    /** @test */
    public function the_constructor_converts_the_users_role_into_a_class()
    {
    	$handler = new CreatesNewTeam($this->data);

    	$this->assertTrue(is_a($handler->userIsA, Fan::class));

    	$this->data['userIsA'] = 'player';
    	$handler = new CreatesNewTeam($this->data);

    	$this->assertTrue(is_a($handler->userIsA, Player::class));

    	$this->data['userIsA'] = 'coach';
    	$handler = new CreatesNewTeam($this->data);

    	$this->assertTrue(is_a($handler->userIsA, Coach::class));
    }


    /** @test */
    public function it_creates_a_team()
    {
    	$repo = App::make(TeamRepository::class);

    	$team = (new CreatesNewTeam($this->data))->create();

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
    	(new CreatesNewTeam($this->data))->create();
    }


    /** @test */
    public function it_adds_players_to_the_team()
    {
    	$mock = $this->mock(TeamMemberRepository::class);
    	$mock->shouldReceive('newPlayer')->twice()->andReturn($mock);
    	$mock->shouldReceive('invite')->twice();
    	$mock->shouldReceive('addTeamCreator')->once();

    	$this->data['coaches'] = [];
    	(new CreatesNewTeam($this->data))->create();
    }


    /** @test */
    public function it_adds_coaches_to_the_team()
    {
    	$mock = $this->mock(TeamMemberRepository::class);
    	$mock->shouldReceive('newCoach')->once()->andReturn($mock);
    	$mock->shouldReceive('invite')->once();
    	$mock->shouldReceive('addTeamCreator')->once();

    	$this->data['players'] = [];
    	(new CreatesNewTeam($this->data))->create();
    }
}