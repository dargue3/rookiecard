<?php

use App\Team;
use App\Event;
use Carbon\Carbon;
use App\TeamMember;
use App\RC\Event\EventRepository;
use App\Http\Requests\NewEventRequest;

class EventControllerTest extends TestCase
{
	/**
	 * The URL extension of all requests in this class
	 * 
	 * @var string
	 */
	protected $url = "team/teamname/event/";

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

		// sign in a user and make them an admin of this team (to pass policy checks)
    	$this->signIn()->makeAdminOfTeam($this->team);

    	$this->repo = $this->mock(EventRepository::class);

    	// sessions normally contain the user's timezone
    	$this->withSession(['timezone' => 'America/New_York']);
	}
	

	/**
	 * Returns mocked data as if from the front-end
	 * 
	 * @return array
	 */
	public function getRawEventData()
	{
		return [
    		'title' 	=> 'Test event',
    		'type'		=> 'practice',
    		'start' 	=> Carbon::now()->timestamp,
    		'end' 		=> Carbon::now()->addHours(2)->timestamp,
    		'details' 	=> 'Yo these tests are sweet!',
    		'_token'	=> csrf_token()
    	];	
	}


    /** @test */
    public function it_has_a_store_method_for_post_requests()
    {
    	$requestData = $this->getRawEventData();
    	
        $this->repo->shouldReceive('store')->once();
    	$this->repo->shouldReceive('getTeamEvents')->once();

    	$this->call('POST', $this->url, $requestData);

    	$this->assertResponseOk();
    }


    /** @test */
    public function it_has_an_update_method_for_put_requests()
    {
    	$requestData = $this->getRawEventData();

    	$event = factory(Event::class)->create(['owner_id' => $this->team->id]);

        $this->repo->shouldReceive('update')->once();
    	$this->repo->shouldReceive('getTeamEvents')->once();

    	$this->call('PUT', $this->url . $event->id, $requestData);

    	$this->assertResponseOk();
    }


    /** @test */
    public function it_has_a_delete_method_for_delete_requests()
    {
    	$requestData = ['_token' => csrf_token()];
    	
    	$event = factory(Event::class)->create(['owner_id' => $this->team->id]);

        $this->repo->shouldReceive('delete')->once();
    	$this->repo->shouldReceive('getTeamEvents')->once();

    	$this->call('DELETE', $this->url . $event->id, $requestData);
    	
    	$this->assertResponseOk();
    }
}