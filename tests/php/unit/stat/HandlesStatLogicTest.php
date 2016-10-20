<?php

use App\Event;
use App\Team;
use App\Stat;
use App\TeamMember;
use App\Events\TeamPostedStats;
use App\RC\Stat\HandlesStatLogic;

class HandlesStatLogicTest extends TestCase
{
	protected $event;
	protected $team;
	protected $data;

	public function setUp()
	{
		parent::setUp();

		$this->getRawStats();

        $this->signIn();
	}


	/**
	 * Creates an array to simulate the data coming from the front-end
	 * 
	 * @return array
	 */
	public function getRawStats()
	{
		$this->team = factory(Team::class)->create();
		$this->event = factory(Event::class)->create(['owner_id' => $this->team->id]);
		factory(TeamMember::class, 2)->create(['team_id' => $this->team->id, 'user_id' => 0]);

		$this->data = [
			'event'			=> $this->event,
			'meta'			=> ['test' => 123],
			'stats'	=> [
				['id' => 0, 'member_id' => 1, 'pts' => 12, 'ast' => 6, 'reb' => 8, 'starter' => true],
				['id' => 0, 'member_id' => 2, 'pts' => 42, 'ast' => 2, 'reb' => 3, 'starter' => false],
			],
		];
	}


    /** @test */
    public function it_loads_the_request_data_into_the_class_attributes()
    {
    	$handler = new HandlesStatLogic($this->data, $this->team);

    	$this->assertEquals($this->team->id, $handler->team->id);
    	$this->assertEquals($this->event->id, $handler->event['id']);
    	$this->assertEquals($this->data['stats'], $handler->stats);

        $event = [
            'id'        => $this->event->id,
            'type'      => $this->event->type,
            'start'     => $this->event->start,
            'end'       => $this->event->end,
            'owner_id'  => $this->event->owner_id,
        ];

    	$this->assertEquals(array_merge($this->data['meta'], ['event' => $event]), $handler->meta);
    }


    /** @test */
    public function it_throws_an_exception_if_the_member_id_in_player_stats_doesnt_belong_to_the_team()
    {
    	factory(TeamMember::class)->create();

    	$this->data['stats'][0]['member_id'] = 3;

    	$this->setExpectedException('Exception');

    	$handler = new HandlesStatLogic($this->data, $this->team);
    }


    /** @test */
    public function it_throws_an_exception_if_the_user_id_in_the_stats_doesnt_match_the_members_user_id()
    {
    	factory(TeamMember::class)->create(['user_id' => 2]);

    	$this->data['stats'][0]['id'] = 3;

    	$this->setExpectedException('Exception');

    	$handler = new HandlesStatLogic($this->data, $this->team);
    }


    /** @test */
    public function it_throws_an_exception_if_the_team_doesnt_own_the_event_these_stats_are_attached_to()
    {
    	$event = factory(Event::class)->create(['owner_id' => 123]);

    	$this->data['event'] = $event;

    	$this->setExpectedException('Exception');

    	$handler = new HandlesStatLogic($this->data, $this->team);
    }


    /** @test */
    public function it_throws_an_exception_if_one_of_the_stat_keys_is_invalid()
    {
        $this->data['stats'][0]['cats'] = 3;

        $this->setExpectedException('Exception');

    	$handler = (new HandlesStatLogic($this->data, $this->team))->create();
    }


    /** @test */
    public function it_creates_player_stats_for_each_member_in_the_array_that_played_and_one_entry_of_team_totals()
    {
        $handler = (new HandlesStatLogic($this->data, $this->team))->create();

        $this->assertCount(2, Stat::all());
    }


    /** @test */
    public function it_fires_an_event_that_will_create_news_feed_entry_and_notifications()
    {
        $this->expectsEvents(TeamPostedStats::class);

        $handler = (new HandlesStatLogic($this->data, $this->team))->create();
    }


    /** @test */
    public function it_skips_any_players_that_played_zero_minutes()
    {
        $this->data['stats'][0]['min'] = 10;
        $this->data['stats'][1]['min'] = 0;

        $handler = (new HandlesStatLogic($this->data, $this->team))->create();

        $this->assertCount(1, Stat::all());
    }


    /** @test */
    public function it_skips_any_players_that_had_dnp_checked()
    {
        $this->data['stats'][0]['dnp'] = true; 
        $this->data['stats'][1]['dnp'] = false; 

        $handler = (new HandlesStatLogic($this->data, $this->team))->create();

        $this->assertCount(1, Stat::all());
    }


    /** @test */
    public function it_attaches_the_given_meta_data()
    {
        $handler = (new HandlesStatLogic($this->data, $this->team))->create();

        $stats = Stat::first();
        $meta = json_decode($stats->meta);

        $this->assertEquals($this->data['meta']['test'], $meta->test);
    }


    /** @test */
    public function it_adds_the_event_data_to_the_meta_data()
    {
        $handler = (new HandlesStatLogic($this->data, $this->team))->create();

        $stats = Stat::first();
        $meta = json_decode($stats->meta);

        $this->assertEquals($this->event->id, $meta->event->id);
    }


    /** @test */
    public function it_can_update_stats_for_a_given_event()
    {
        // create some initial stats
        (new HandlesStatLogic($this->data, $this->team))->create();

        $this->data['stats'][0]['pts'] = 56;
        $this->data['meta'] = ['cats_are' => 'the best'];

        // update them with new data
        (new HandlesStatLogic($this->data, $this->team))->update();

        $this->assertCount(2, Stat::all());

        $first = Stat::first();
        $meta = json_decode($first->meta);
        $stats = json_decode($first->stats);

        $this->assertFalse(isset($meta->test));
        $this->assertEquals('the best', $meta->cats_are);
        $this->assertEquals(56, $stats->pts);
    }



}