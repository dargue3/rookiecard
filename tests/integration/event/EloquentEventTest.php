<?php

use App\Team;
use App\Event;
use App\NewsFeed;
use Carbon\Carbon;
use App\RC\Events\EloquentEvent;
use App\RC\Events\HandlesEventLogic;

class EloquentEventTest extends TestCase
{
	/**
	 * The date string used for generating the beginning date strings
	 * 
	 * @var string
	 */
	protected $date = 'June 20, 2016 18:00:00';


	/**
	 * The instance of the event repository under test
	 * 
	 * @var EloquentEvent
	 */
	protected $event;


	public function setUp()
	{
		parent::setUp();
		
		$this->signIn();

		$this->event = new EloquentEvent;
	}


    /**
     * Generate a random team
     * 
     * @return Team
     */
    public function getTeam()
    {
        return factory(Team::class)->create();
    }


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
    public function it_has_a_store_method_that_creates_events()
    {
    	$team = factory(Team::class)->create();
    	$data = $this->getRawEventData();
    	
    	(new HandlesEventLogic($data, $team->id, $this->event))->create();

    	$event  = Event::first();
    	$start 	= Carbon::parse($this->date, 'America/New_York')->timezone('UTC');
    	$end 	= Carbon::instance($start)->addHours(2);

    	$this->assertEquals($start->timestamp, $event->start);
    	$this->assertEquals($end->timestamp, $event->end);
    	$this->assertTrue(! empty($event->title));
    	$this->assertTrue(! empty($event->details));
    	$this->assertEquals($this->user->id, $event->creator_id);
    	$this->assertEquals($team->id, $event->owner_id);
    }

    /** @test */
    public function it_generates_multiple_events()
    {
    	$data = $this->getRawEventData(true);
    	$team = $this->getTeam();

        $this->event->store($data, $team->id);

    	//(new HandlesEventLogic($data, $team, $this->event))->create();

    	// how the seeded data is set up, first day is a Monday
    	// event repeats every Mon, Wed, Fri for two weeks and stops repeating on that Monday
    	// Week 1: M W F
    	// Week 2: M W F
    	// Week 3: M
    	// Total = 7 events
    	$this->assertCount(7, Event::all());

    	// the first event is on $this->date
    	$event  = Event::find(1);
    	$start 	= Carbon::parse($this->date, 'America/New_York')->timezone('UTC');
    	$end 	= Carbon::instance($start)->addHours(2);

    	$this->assertEquals($start->timestamp, $event->start);
    	$this->assertEquals($end->timestamp, $event->end);

    	// the second event is on $this->date plus 2 days later
    	$event  = Event::find(2);
    	$start 	= Carbon::parse($this->date, 'America/New_York')->timezone('UTC')->addDays(2);
    	$end 	= Carbon::instance($start)->addHours(2);

    	$this->assertEquals($start->timestamp, $event->start);
    	$this->assertEquals($end->timestamp, $event->end);

    	// the fourth event is the following Monday
    	$event  = Event::find(4);
    	$start 	= Carbon::parse($this->date, 'America/New_York')->timezone('UTC')->addWeeks(1);
    	$end 	= Carbon::instance($start)->addHours(2);

    	$this->assertEquals($start->timestamp, $event->start);
    	$this->assertEquals($end->timestamp, $event->end);

    	// and so on and so forth
    }


    // /** @test */
    // public function it_generates_a_news_feed_entry_for_the_team()
    // {
    // 	$data = $this->getRawEventData();
    // 	$team = $this->getTeam();

    // 	(new HandlesEventLogic($data, $team, $this->event))->create();

    // 	$event = Event::first();
    // 	$feed = NewsFeed::first();
    // 	$meta = json_decode($feed->meta);

    // 	$this->assertEquals($this->user->id, $feed->creator_id);
    // 	$this->assertEquals($team->id, $feed->owner_id);
    // 	$this->assertEquals(0, $feed->type);
    // 	$this->assertEquals($event->id, $meta->event->id);
    // }


    /** @test */
    // public function the_generated_news_feed_has_special_repeating_meta_data_if_event_was_repeating()
    // {
    // 	$data = $this->getRawEventData(true);
    // 	$team = $this->getTeam();

    // 	(new HandlesEventLogic($data, $team, $this->event))->create();

    // 	$firstEvent = Event::find(1);
    // 	$lastEvent  = Event::find(7);
    // 	$feed = NewsFeed::first();
    // 	$meta = json_decode($feed->meta);
    // 	$string = "$firstEvent->start:$lastEvent->start:M,W,F";

    // 	$this->assertEquals($string, $meta->repeats);
    // }





}