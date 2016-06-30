<?php

use App\Team;
use App\Event;
use App\NewsFeed;
use Carbon\Carbon;
use App\RC\Stat\StatRepository;
use App\RC\Event\EloquentEvent;
use App\Events\TeamCreatedAnEvent;
use App\Events\TeamUpdatedAnEvent;
use App\Events\TeamDeletedAnEvent;
use App\RC\Event\HandlesEventLogic;

class EloquentEventTest extends TestCase
{
	/**
	 * The instance of the event repository under test
	 * 
	 * @var EloquentEvent
	 */
	protected $repo;

    /**
     * The example team being used in these tests
     * 
     * @var Team
     */
    protected $team;


	public function setUp()
	{
		parent::setUp();

        $this->team = factory(Team::class)->create();

        $this->signIn()->makeAdminOfTeam($this->team);

		$this->repo = new EloquentEvent($this->app->make(StatRepository::class));
	}


    /**
     * The date string used for generating the beginning date strings
     * 
     * @var string
     */
    protected $date = 'June 20, 2016 18:00:00';


	/**
	 * Seed an array of random event "request" data
	 * Essentially mocks the input from a form
	 * 
	 * @return array
	 */
	public function getRawEventData($repeats = false)
	{
		$start 	= Carbon::parse($this->date, 'America/New_York');
		$end 	= Carbon::instance($start)->addHours(2);
		$until 	= Carbon::instance($end)->addWeeks(2);

		$data = [
			'title' 	=> 'This is a test event!',
			'type' 		=> 'practice',
			'details' 	=> 'Boy, I sure do hope this test will pass!',
			'tz' 		=> 'America/New_York',
			'start' 	=> $start->timestamp,
			'end' 		=> $end->timestamp,
		];

		if ($repeats) {
			$data['repeats'] = true;
			$data['days'] = ['Monday', 'Wednesday', 'Friday'];
			$data['until'] = $until->timestamp;
		}

		return $data;
	}


    /** @test */
    public function it_has_a_correct_model_path_attribute()
    {
        $this->assertEquals('App\Event', $this->repo->modelPath());
    }


    /** @test */
    public function it_has_a_store_method_that_creates_events()
    {
    	$data = $this->getRawEventData();

        $mock = $this->mock(HandlesEventLogic::class);

        $mock->shouldReceive('create')->with($data, $this->team->id);

        $this->repo->store($data, $this->team->id);
    }


    /** @test */
    public function it_fires_an_event_saying_that_a_team_has_created_a_new_event()
    {
    	$data = $this->getRawEventData();

        $this->expectsEvents(TeamCreatedAnEvent::class);

    	$this->repo->store($data, $this->team->id);
    }


    /** @test */
    public function it_has_an_update_method_that_applies_given_data_to_a_given_event()
    {
        $event = factory(Event::class)->create();
        $data = $this->getRawEventData();

        $this->repo->update($data, $this->team->id, $event->id);

        $event = Event::findOrFail($event->id);

        $this->assertEquals('This is a test event!', $event->title);
        $this->assertEquals('practice', $event->type);
        $this->assertEquals('Boy, I sure do hope this test will pass!', $event->details);
        $this->assertEquals($this->user->id, $event->creator_id);
        $this->assertEquals($data['start'], $event->start);
        $this->assertEquals($data['end'], $event->end);
    }


    /** @test */
    public function it_fires_an_event_saying_that_a_team_has_updated_an_event()
    {
        $start = Carbon::now()->addDays(1);
        $end = Carbon::instance($start)->addHours(2);

        $event = factory(Event::class)->create(['start' => $start->timestamp, 'end' => $end->timestamp]);
        $data = $this->getRawEventData();

        $this->expectsEvents(TeamUpdatedAnEvent::class);

        $this->repo->update($data, $this->team->id, $event->id);
    }


    /** @test */
    public function it_has_a_delete_method_that_deletes_a_given_event()
    {
        $event = factory(Event::class)->create();

        $this->repo->delete($this->team->id, $event->id);

        $this->assertCount(0, Event::all());
    }


    /** @test */
    public function it_fires_an_event_saying_that_a_team_has_deleted_an_event()
    {
        $event = factory(Event::class)->create();

        $this->expectsEvents(TeamDeletedAnEvent::class);

        $this->repo->delete($this->team->id, $event->id);
    }




}