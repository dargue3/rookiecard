<?php

use App\Team;
use App\Event;
use App\NewsFeed;
use Faker\Factory;
use Carbon\Carbon;
use App\RC\Events\EloquentEvent;
use App\RC\Events\HandlesEventLogic;
use App\RC\NewsFeed\EloquentNewsFeed;

class HandlesEventLogicTest extends TestCase
{
	/**
	 * The date string used for generating the beginning date strings
	 * 
	 * @var string
	 */
	private $date = 'June 20, 2016 18:00:00';


    /**
     * Instance of Event repository
     * 
     * @var EventRepository
     */
    protected $repo;


    public function setUp()
    {
        parent::setUp();

        $this->signIn();

        $this->repo = $this->mock(EloquentEvent::class);
        $this->repo = $this->mock(EloquentEvent::class);
    }


	/**
	 * Seed an array of random event "request" data
	 * Essentially mocks the input from a form
	 * 
	 * @return array
	 */
	public function getRawEventData($repeats = false)
	{
		$start  = Carbon::parse($this->date, 'America/New_York');
        $end    = Carbon::instance($start)->addHours(2);
        $until  = Carbon::instance($end)->addWeeks(3)->startOfDay();

        $data = [
            'title'     => 'This is a test event!',
            'type'      => 'practice',
            'details'   => 'Boy, I sure do hope this test will pass!',
            'tz'        => 'America/New_York',
            'start'     => $start->timestamp,
            'end'       => $end->timestamp,
        ];

        if ($repeats) {
            $data['repeats'] = true;
            $data['days'] = ['Monday', 'Wednesday', 'Friday'];
            $data['until'] = $until->timestamp;
        }

        return $data;
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


    /** @test */
    public function it_transforms_the_given_data_in_the_constuctor_before_creating_or_updating()
    {
    	$data = $this->getRawEventData(true);
    	$team = $this->getTeam();

    	$handler = new HandlesEventLogic($data, $team->id, new EloquentEvent);

        $this->assertEquals('This is a test event!', $handler->title);
        $this->assertEquals(0, $handler->type);
        $this->assertEquals('Boy, I sure do hope this test will pass!', $handler->details);
        $this->assertEquals('America/New_York', $handler->tz);
        $this->assertEquals($data['start'], $handler->start->timestamp);
        $this->assertEquals($data['end'], $handler->end->timestamp);
        $this->assertEquals($data['until'], $handler->until->timestamp);
        $this->assertTrue($handler->repeats);
        $this->assertEquals(['Monday', 'Wednesday', 'Friday'], $handler->days);
    }



    /** @test */
    public function it_will_throw_an_exception_if_the_start_date_is_after_the_end_date()
    {
        $data = $this->getRawEventData();
        $team = $this->getTeam();

        $data['end'] = Carbon::createFromTimestamp($data['start'])->subHours(2)->timestamp;

        $this->setExpectedException('App\Exceptions\ApiException');

        new HandlesEventLogic($data, $team->id, new EloquentEvent);
    }


    /** @test */
    public function it_will_throw_an_exception_if_the_until_date_is_before_the_end_date()
    {
        $data = $this->getRawEventData(true);
        $team = $this->getTeam();

        $data['until'] = Carbon::createFromTimestamp($data['end'])->subHours(2)->timestamp;

        $this->setExpectedException('App\Exceptions\ApiException');

        new HandlesEventLogic($data, $team->id, new EloquentEvent);
    }


    /** @test */
    public function it_will_throw_an_exception_if_the_event_lasts_over_a_month()
    {
        $data = $this->getRawEventData();
        $team = $this->getTeam();

        $data['end'] = Carbon::createFromTimestamp($data['start'])->addWeeks(5)->timestamp;

        $this->setExpectedException('App\Exceptions\ApiException');

        new HandlesEventLogic($data, $team->id, new EloquentEvent);
    }


    /** @test */
    public function it_will_throw_an_exception_if_the_start_or_end_dates_are_100_years_ago()
    {
        $data = $this->getRawEventData(true);
        $team = $this->getTeam();

        $data['start'] = Carbon::create(1899, 1, 1)->timestamp;

        $this->setExpectedException('App\Exceptions\ApiException');

        new HandlesEventLogic($data, $team->id, new EloquentEvent);
    }


    /** @test */
    public function it_will_throw_an_exception_if_the_start_or_end_dates_are_100_years_in_the_future()
    {
        $data = $this->getRawEventData(true);
        $team = $this->getTeam();

        $data['end'] = Carbon::create(2101, 1, 1)->timestamp;

        $this->setExpectedException('App\Exceptions\ApiException');

        new HandlesEventLogic($data, $team->id, new EloquentEvent);
    }


    /** @test */
    public function it_will_throw_an_exception_if_this_request_will_create_over_250_events()
    {
        $data = $this->getRawEventData(true);
        $team = $this->getTeam();

        // they'd most likely create a ton of events by saying the event repeated for several years
        $data['until'] = Carbon::createFromTimestamp($data['end'])->addYears(5)->timestamp;

        $this->setExpectedException('App\Exceptions\ApiException');

        new HandlesEventLogic($data, $team->id, new EloquentEvent);
    }


    /** @test */
    public function it_creates_a_single_event_if_the_repeats_flag_is_not_set()
    {
        $data = $this->getRawEventData();
        $team = $this->getTeam();

        $createdEvent = Event::create([
            'title'       => $data['title'],
            'type'        => intval($data['type']),
            'start'       => $data['start'],
            'end'         => $data['end'],
            'owner_id'    => $team->id,
            'creator_id'  => $this->user->id,
            'details'     => $data['details']
        ]);

        $this->repo->shouldReceive('teamHasCreatedTooManyEvents')->once();
        $this->repo->shouldReceive('create')->once()
            ->with(Mockery::contains(1466460000, 1466467200))
            ->andReturn($createdEvent);

        $handler = new HandlesEventLogic($data, $team->id, $this->repo);

        $handler->create();
    }


    /** @test */
    public function it_creates_multiple_events_if_repeats_flag_is_set()
    {
        $data = $this->getRawEventData(true);
        $team = $this->getTeam();

        // set the 'until' date so it stops after two events
        $start  = Carbon::parse($this->date, 'America/New_York');
        $end    = Carbon::instance($start)->addHours(2);
        $until  = Carbon::instance($end)->addDays(3);

        $data['until'] = $until->timestamp;

        // just for the record:
        // 1466460000 == Monday June 20 at 6:00 pm, 1466467200 == 2 hours after that
        // 1466632800 == Wednesday June 22 at 6:00 pm, 1466640000 == 2 hours after that

        $monday = Event::create([
            'title'       => $data['title'],
            'type'        => intval($data['type']),
            'start'       => 1466460000,
            'end'         => 1466467200,
            'owner_id'    => $team->id,
            'creator_id'  => $this->user->id,
            'details'     => $data['details']
        ]);

        $wednesday = Event::create([
            'title'       => $data['title'],
            'type'        => intval($data['type']),
            'start'       => 1466632800,
            'end'         => 1466640000,
            'owner_id'    => $team->id,
            'creator_id'  => $this->user->id,
            'details'     => $data['details']
        ]);

        // the way the dummy request data is configured, the event repeats 2 times total
        $this->repo->shouldReceive('teamHasCreatedTooManyEvents')->once();

        $this->repo->shouldReceive('create')->once()
                ->with(Mockery::contains(1466460000, 1466467200))
                ->andReturn($monday);

        $this->repo->shouldReceive('create')->once()
                ->with(Mockery::contains(1466632800, 1466640000))
                ->andReturn($wednesday);        

        $handler = new HandlesEventLogic($data, $team->id, $this->repo);
        $handler->create();
    }


    /** @test */
    public function it_calculates_which_event_repeats_next_given_3_repeating_days_with_one_being_the_start_date()
    {
        $data = $this->getRawEventData(true);
        $team = $this->getTeam();
        $today = Carbon::parse($this->date)->startOfDay();

        $handler = new HandlesEventLogic($data, $team->id, new EloquentEvent);

        $today = $handler->setToNextRepeatingDay($today);
        $this->assertEquals('June 22 2016', $today->format('F j o'));

        $today = $handler->setToNextRepeatingDay($today);
        $this->assertEquals('June 24 2016', $today->format('F j o'));

        $today = $handler->setToNextRepeatingDay($today);
        $this->assertEquals('June 27 2016', $today->format('F j o'));

        $today = $handler->setToNextRepeatingDay($today);
        $this->assertEquals('June 29 2016', $today->format('F j o'));
    }


    /** @test */
    public function it_calculates_which_event_repeats_next_given_2_repeating_days_neither_are_the_start_date()
    {
        $data = $this->getRawEventData(true);
        $team = $this->getTeam();
        $data['days'] = ['Tuesday', 'Sunday'];

        $today = Carbon::parse($this->date)->startOfDay();

        $handler = new HandlesEventLogic($data, $team->id, new EloquentEvent);

        $today = $handler->setToNextRepeatingDay($today);
        $this->assertEquals('June 21 2016', $today->format('F j o'));

        $today = $handler->setToNextRepeatingDay($today);
        $this->assertEquals('June 26 2016', $today->format('F j o'));
    }


    /** @test */
    public function it_calculates_which_event_repeats_next_given_a_single_repeating_day()
    {
        $data = $this->getRawEventData(true);
        $team = $this->getTeam();
        $data['days'] = ['Monday'];

        $today = Carbon::parse($this->date)->startOfDay();

        $handler = new HandlesEventLogic($data, $team->id, new EloquentEvent);

        $today = $handler->setToNextRepeatingDay($today);
        $this->assertEquals('June 27 2016', $today->format('F j o'));

        $today = $handler->setToNextRepeatingDay($today);
        $this->assertEquals('July 4 2016', $today->format('F j o'));
    }
    

    /** @test */
    // public function creates_a_news_feed_entry_for_the_team_with_meta_data_about_the_event()
    // {
    //     $data = $this->getRawEventData();
    //     $team = $this->getTeam();

    //     $mock = $this->mock(EloquentNewsFeed::class);
    //     $mock->shouldReceive('newTeamEvents')->once();

    //     $handler = new HandlesEventLogic($data, $team->id, new EloquentEvent, $mock);
    //     $handler->create();
    // }





}