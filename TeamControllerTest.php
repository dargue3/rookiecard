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

    	$mock = $this->mock(HandlesStatLogic::class);

    	$this->call('POST', $this->url . 'join/', ['action' => 'accept']);

    	$this->assertResponseOk();
    }


    /** @test */
    public function it_has_a_method_for_the_logged_in_user_canceling_an_invitation_to_join_a_team()
    {
    	$this->memberRepo->newPlayer($this->team->id)->invite($this->user->email); // precondition

    	$this->call('POST', $this->url . 'join/', ['action' => 'decline']);

    	$this->assertResponseOk();
    }


    /** @test */
    public function it_has_a_method_for_the_logged_in_user_requesting_to_join_a_team()
    {
    	$this->call('POST', $this->url . 'join/', ['action' => 'request']);

    	$this->assertResponseOk();
    }


    /** @test */
    public function it_has_a_method_for_the_logged_in_user_canceling_their_previous_request_to_join()
    {
    	$this->memberRepo->requestToJoin($this->team->id); // precondition

    	$this->call('POST', $this->url . 'join/', ['action' => 'cancel']);

    	$this->assertResponseOk();
    }


    /** @test */
    public function it_has_a_method_for_toggling_the_logged_in_users_fan_status_of_a_team()
    {
    	$this->call('POST', $this->url . 'fan/');

    	$this->assertResponseOk();
    }


    /** @test */
    public function it_has_a_method_for_checking_the_availability_of_a_teamname_during_the_team_creation_process()
    {
    	$response = $this->call('POST', 'team/create/cats');
    	$available = json_decode($response->getContent())->available;

    	$this->assertResponseOk();
    	$this->assertTrue($available);

    	// try when the name is taken (we used this one in setUp() )
    	$response = $this->call('POST', 'team/create/teamname');
    	$available = json_decode($response->getContent())->available;

    	$this->assertResponseOk();
    	$this->assertFalse($available);
    }

}