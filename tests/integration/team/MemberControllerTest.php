<?php

use App\Team;
use App\TeamMember;
use Faker\Factory;
use App\RC\Team\TeamRepository;
use App\RC\Team\TeamMemberRepository;

class MemberControllerTest extends TestCase
{
	/**
	 * The URL extension of all requests in this class
	 * 
	 * @var string
	 */
	protected $url = "team/teamname/member/";


	/**
	 * The Team instance being used during these tests
	 * 
	 * @var Team
	 */
	protected $team;


	/**
	 * A mocked instance of a team repository
	 * 
	 * @var Mockery
	 */
	protected $teamRepo;


	/**
	 * A mocked instance of a team member repository
	 * 
	 * @var Mockery
	 */
	protected $memberRepo;

	/**
	 * An instance of Faker\Factory
	 * 
	 * @var Factory
	 */
	protected $faker;



	public function setUp()
	{
		parent::setUp();

		$this->memberRepo = $this->mock(TeamMemberRepository::class);

		$this->teamRepo = $this->mock(TeamRepository::class);

		$this->faker = (new Factory)->create();

		$this->team = factory(Team::class)->create(['teamname' => 'teamname']);

    	$this->signIn()->makeAdminOfTeam($this->team);
	}


    /** @test */
    public function it_has_a_store_method_for_creating_new_members()
    {
    	$data = [
    		'email' => $this->faker->email,
    		'name' => $this->faker->name,
    		'role' => 'ghost_player',
    	];
    	
        $this->memberRepo->shouldReceive('teamMember')->once()->andReturn(TeamMember::first());
    	$this->memberRepo->shouldReceive('newPlayer')->once();
   		$this->memberRepo->shouldReceive('invite')->once();

    	// annoying amount of mocks here, this is for fetching team's members
    	$this->teamRepo->shouldReceive('members')->once();
    	$this->memberRepo->shouldReceive('using')->once()->andReturn($this->memberRepo);
    	$this->memberRepo->shouldReceive('isAdmin')->once()->andReturn(true);

    	$this->call('POST', $this->url, $data);

    	$this->assertResponseOk();
    }

    /** @test */
    public function it_has_an_update_method_for_saving_changes_to_member()
    {
    	$member = factory(TeamMember::class)->create(['team_id' => $this->team->id]);

    	$data = [
    		'meta' => [
				'name' 		=> $this->faker->name,
				'email'		=> $this->faker->email,
				'num'		=> '24',
				'positions'	=> ['pg', 'sg'],
    		],
    		'role' 	=> true,
    		'admin'	=> false,
    	];

        $this->memberRepo->shouldReceive('teamMember')->once()->andReturn(TeamMember::first());
        $this->memberRepo->shouldReceive('findOrFail')->once()->andReturn($member); // policy check
    	$this->memberRepo->shouldReceive('editMember')->once();

    	// annoying amount of mocks here, this is for fetching team's members
    	$this->teamRepo->shouldReceive('members')->once();
    	$this->memberRepo->shouldReceive('using')->once()->andReturn($this->memberRepo);
    	$this->memberRepo->shouldReceive('isAdmin')->once()->andReturn(true);

    	$this->call('PUT', $this->url . $member->id, $data);

    	$this->assertResponseOk();
    }


    /** @test */
    public function it_has_a_delete_method_for_delete_requests()
    {
    	$member = factory(TeamMember::class)->create(['team_id' => $this->team->id]);

        $this->memberRepo->shouldReceive('teamMember')->once()->andReturn(TeamMember::first());
        $this->memberRepo->shouldReceive('findOrFail')->once()->andReturn($member); // policy check
    	$this->memberRepo->shouldReceive('deleteMember')->once();

    	// annoying amount of mocks here, this is for fetching team's members
    	$this->teamRepo->shouldReceive('members')->once();
    	$this->memberRepo->shouldReceive('using')->once()->andReturn($this->memberRepo);
    	$this->memberRepo->shouldReceive('isAdmin')->once()->andReturn(true);


    	$this->call('DELETE', $this->url . $member->id);

    	$this->assertResponseOk();
    }
}