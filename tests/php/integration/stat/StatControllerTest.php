<?php

use App\Team;
use App\Event;
use App\TeamMember;
use App\RC\Stat\StatRepository;
use App\RC\Stat\HandlesStatLogic;

class StatControllerTest extends TestCase
{
	/**
	 * The URL extension of all requests in this class
	 * 
	 * @var string
	 */
	protected $url = "team/teamname/stats/";

	/**
	 * The Team instance being used during these tests
	 * 
	 * @var Team
	 */
	protected $team;


	/**
	 * The Event instance being used during these tests
	 * 
	 * @var Event
	 */
	protected $event;


	/**
	 * The mock of StatRepository
	 * 
	 * @var Mockery
	 */
	protected $repo;


	/**
	 * The array of request data to be send to the server
	 * 
	 * @var array
	 */
	protected $data;


	public function setUp()
	{
		parent::setUp();

		$this->team = factory(Team::class)->create(['teamname' => 'teamname']);
		factory(TeamMember::class, 2)->create(['team_id' => $this->team->id, 'user_id' => 0]);

		$this->event = factory(Event::class)->create(['owner_id' => $this->team->id]);

		$this->data = [
			'meta'	=> ['test' => 123],
			'stats'	=> [
				['id' => 0, 'member_id' => 1, 'pts' => 12, 'ast' => 6, 'reb' => 8],
				['id' => 0, 'member_id' => 2, 'pts' => 42, 'ast' => 2, 'reb' => 3],
			],
		];

		$this->signIn()->makeAdminOfTeam($this->team);
	}


    /** @test */
    public function it_has_a_store_method_for_persisting_new_stats()
    {
    	$mock = $this->mock(HandlesStatLogic::class);
    	$mock->shouldReceive('create');

    	$this->data['event_id'] = $this->event->id;

    	$this->call('POST', $this->url, $this->data);

    	$this->assertResponseOk();
    }



    /** @test */
    public function it_has_an_update_method_for_updating_stats_for_a_given_event()
    {
    	$mock = $this->mock(HandlesStatLogic::class);
    	$mock->shouldReceive('update');

    	$this->call('PUT', $this->url . $this->event->id, $this->data);

    	$this->assertResponseOk();
    }


    /** @test */
    public function it_has_a_delete_method_for_deleting_stats_for_a_given_event()
    {
    	$mock = $this->mock(StatRepository::class);
    	$mock->shouldReceive('deleteByEvent');
    	$mock->shouldReceive('findByTeam');

    	$this->call('DELETE', $this->url . $this->event->id);

    	$this->assertResponseOk();
    }
}