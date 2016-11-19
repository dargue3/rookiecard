<?php

use App\Team;
use App\TeamMember;
use App\RC\Team\JoinTeam;
use App\RC\Team\TeamMemberRepository;

class TeamControllerTest extends TestCase
{
	/**
	 * The URL extension of all requests in this class
	 * 
	 * @var string
	 */
	protected $url = "team/teamname/";

	/**
	 * The Team instance being used during these tests
	 * @var Team
	 */
	protected $team;

	/**
	 * The mock of EventRepository
	 * @var Mockery
	 */
	protected $repo;


	public function setUp()
	{
		parent::setUp();

		$this->team = factory(Team::class)->create(['teamname' => 'teamname']);

		$this->memberRepo = App::make(TeamMemberRepository::class);

    	$this->signIn();

    	$this->seedRolesTable();
	}


    /** @test */
    public function it_has_a_method_for_the_logged_in_user_accepting_an_invitation_to_join_a_team()
    {
    	$this->memberRepo->newPlayer($this->team->id)->invite($this->user->email); // precondition

    	$mock = $this->mock(JoinTeam::class);
    	$mock->shouldReceive('handle');
    	$mock->shouldReceive('userHasAcceptedInvitation');

    	$this->call('POST', $this->url . 'join/', ['action' => 'accept']);

    	$this->assertResponseOk();
    }


    /** @test */
    public function it_has_a_method_for_the_logged_in_user_canceling_an_invitation_to_join_a_team()
    {
    	$this->memberRepo->newPlayer($this->team->id)->invite($this->user->email); // precondition

    	$mock = $this->mock(JoinTeam::class);
    	$mock->shouldReceive('handle');
    	$mock->shouldReceive('userHasDeclinedInvitation');

    	$this->call('POST', $this->url . 'join/', ['action' => 'decline']);

    	$this->assertResponseOk();
    }


    /** @test */
    public function it_has_a_method_for_the_logged_in_user_requesting_to_join_a_team()
    {
    	$this->call('POST', $this->url . 'join/', ['action' => 'request']);

    	$mock = $this->mock(JoinTeam::class);
    	$mock->shouldReceive('handle');
    	$mock->shouldReceive('userHasRequestedToJoin');

    	$this->assertResponseOk();
    }


    /** @test */
    public function it_has_a_method_for_the_logged_in_user_canceling_their_previous_request_to_join()
    {
    	$this->memberRepo->requestToJoin($this->team->id); // precondition

    	$mock = $this->mock(JoinTeam::class);
    	$mock->shouldReceive('handle');
    	$mock->shouldReceive('userHasCanceledRequestToJoin');

    	$this->call('POST', $this->url . 'join/', ['action' => 'cancel']);

    	$this->assertResponseOk();
    }


    /** @test */
    public function it_has_a_method_for_toggling_the_logged_in_users_fan_status_of_a_team()
    {
    	$mock = $this->mock(TeamMemberRepository::class);
    	$mock->shouldReceive('toggleFan')->once();
    	$mock->shouldReceive('members')->once()->andReturn([]);
    	$mock->shouldReceive('teamMember')->once();

    	$this->call('POST', $this->url . 'fan/');

    	$this->assertResponseOk();
    }


    /** @test */
    public function it_has_a_method_for_checking_the_availability_of_a_teamname_during_the_team_creation_process()
    {
    	$response = $this->call('GET', 'team/create/cats');
        $available = json_decode($response->getContent())->available;
    	$teamname = json_decode($response->getContent())->teamname;

    	$this->assertResponseOk();
    	$this->assertTrue($available);
        $this->assertEquals('cats', $teamname);

    	// try when the name is taken (we used this one in setUp() )
    	$response = $this->call('GET', 'team/create/teamname');
    	$available = json_decode($response->getContent())->available;
        $teamname = json_decode($response->getContent())->teamname;

    	$this->assertResponseOk();
    	$this->assertFalse($available);
        $this->assertEquals('teamname', $teamname);
    }


    /** @test */
    public function it_has_a_method_for_creating_a_new_team()
    {
        $data = [
            'name'          => 'Team Test',
            'teamURL'       => 'testname',
            'gender'        => 'male',
            'sport'         => 'basketball',
            'slogan'        => 'Here goes nothin!',
            'homefield'     => 'My backyard',
            'city'          => 'Providence, RI',
            'lat'           => 69.24828429,
            'long'          => -72.4824724,
            'timezone'      => 'America/New_York',
            'userIsA'       => 'fan',
            'userStats'     => ['pts', 'fgm', 'fga'],
            'rcStats'       => ['fg_'],
            'players'       => [
                ['firstname' => 'Testy', 'lastname' => 'McGee', 'email' => 'player@rookiecard.com'],
                ['firstname' => 'Tester', 'lastname' => 'McTestFace', 'email' => ''],
            ],
            'coaches'       => [
                ['firstname' => 'Coach', 'lastname' => 'Test', 'email' => 'coach@rookiecard.com'],
            ],
        ];

        $this->call('POST', 'team/create', $data);

        $this->assertResponseOk();
    }


    /** @test */
    public function it_has_a_method_for_creating_an_array_of_dummy_names_and_emails_while_creating_a_team()
    {
        $dummy = json_decode($this->call('GET', 'team/create/dummy/male')->getContent())->dummy;

        $this->assertResponseOk();

        $this->assertCount(50, $dummy);
        $this->assertTrue(! empty($dummy[0]->firstname));
        $this->assertTrue(! empty($dummy[0]->lastname));
        $this->assertTrue(! empty($dummy[0]->email));
    }

}