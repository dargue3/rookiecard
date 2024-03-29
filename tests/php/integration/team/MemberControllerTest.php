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
            'firstname' => $this->faker->firstName,
    		'lastname' => $this->faker->lastName,
            'meta' => ['num' => '24', 'positions' => ['pg', '']],
    		'role' => 'player',
    	];
    	
        $this->memberRepo->shouldReceive('teamMember')->once()->andReturn(TeamMember::first());
    	$this->memberRepo->shouldReceive('newPlayer')->once()->with($this->team->id, $data['firstname'], $data['lastname']);
        $this->memberRepo->shouldReceive('invite')->once()->with($data['email']);
   		$this->memberRepo->shouldReceive('attachMetaData')->once()->with(['num' => '24', 'positions' => ['pg', '']], false);

    	// annoying amount of mocks here, this is for fetching team's members
    	$this->teamRepo->shouldReceive('members')->once();
    	$this->memberRepo->shouldReceive('using')->once()->andReturn($this->memberRepo);
    	$this->memberRepo->shouldReceive('isAdmin')->once()->andReturn(true);

        //dd($this->call('POST', $this->url, $data));
    	$this->call('POST', $this->url, $data);

    	$this->assertResponseOk();
    }

    /** @test */
    public function it_has_an_update_method_for_saving_changes_to_member()
    {
    	$member = factory(TeamMember::class)->create(['team_id' => $this->team->id]);

    	$data = [
            'isGhost' => true,
    		'meta' => [
                'firstname'     => $this->faker->firstNameMale,
				'lastname'      => $this->faker->lastName,
				'email'         => $this->faker->email,
				'num'           => '24',
				'positions'     => ['pg', 'sg'],
    		],
    		'role' 	=> 'coach',
    		'admin'	=> false,
            'requestedToJoin' => true,
    	];

        $this->memberRepo->shouldReceive('teamMember')->once()->andReturn(TeamMember::first());
        $this->memberRepo->shouldReceive('findOrFail')->once()->andReturn($member); // policy check
        $this->memberRepo->shouldReceive('allowMemberToJoin')->once(); // making a 'requested to join' user a real user
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


    /** @test */
    public function it_has_a_randomize_method_for_generating_random_ghost_names_and_jersey_numbers()
    {
        $member = factory(TeamMember::class)->create(['team_id' => $this->team->id]);

        $this->memberRepo->shouldReceive('teamMember')->once()->andReturn(TeamMember::first());
        $this->memberRepo->shouldReceive('using')->once()->andReturn($this->memberRepo);
        $this->memberRepo->shouldReceive('isAdmin')->once()->andReturn(true);

        $response = $this->call('GET', $this->url . 'randomize')->getOriginalContent();

        $this->assertResponseOk();
        $this->assertTrue(isset($response['firstname']));
        $this->assertTrue(isset($response['lastname']));
    }
}