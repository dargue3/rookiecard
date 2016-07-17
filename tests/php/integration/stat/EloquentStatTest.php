<?php

use App\Stat;
use App\Team;
use App\Event;
use App\TeamMember;
use App\RC\Stat\EloquentStat;

class EloquentStatTest extends TestCase
{
	/**
	 * The instance of the team used for testing
	 * 
	 * @var Team
	 */
	protected $team;


	/**
	 * The instance of an event used for testing
	 * 
	 * @var Event
	 */
	protected $event;


	/**
	 * The instance of EloquentStat
	 * 
	 * @var EloquentStat
	 */
	protected $repo;



	public function setUp()
	{
		parent::setUp();

		$this->team = factory(Team::class)->create();

		$this->event = factory(Event::class)->create(['owner_id' => $this->team->id]);

		$this->repo = new EloquentStat;
	}


	/** @test */
	public function it_has_a_model_path_attribute_used_for_out_of_the_box_eloquent_functionality()
	{
		$this->assertTrue(null !== $this->repo->modelPath());
	}


    /** @test */
    public function it_fetches_all_the_stats_associated_with_a_given_team()
    {
    	factory(Stat::class, 5)->create(['team_id' => $this->team->id]);

    	$stats = $this->repo->findByTeam($this->team->id);

    	$this->assertCount(5, $stats);
    }


    /** @test */
    public function it_fetches_all_the_stats_associated_with_a_given_team_and_event()
    {
    	factory(Stat::class, 5)->create(['team_id' => $this->team->id, 'event_id' => $this->event->id]);
    	factory(Stat::class, 3)->create(['team_id' => $this->team->id, 'event_id' => 242]);

    	$stats = $this->repo->findByEvent($this->team->id, $this->event->id);

    	$this->assertCount(5, $stats);
    }


    /** @test */
    public function it_deletes_all_stats_associated_with_a_given_team_and_event()
    {
    	factory(Stat::class, 5)->create(['team_id' => $this->team->id, 'event_id' => $this->event->id]);
    	factory(Stat::class, 3)->create(['team_id' => $this->team->id, 'event_id' => 242]);

    	$this->repo->deleteByEvent($this->team->id, $this->event->id);

    	$this->assertCount(3, Stat::all());
    }


    /** @test */
    public function it_deletes_all_stats_associated_with_a_given_team_member()
    {
    	$member = factory(TeamMember::class)->create(['team_id' => $this->team->id]);
    	factory(Stat::class, 5)->create(['team_id' => $this->team->id, 'member_id' => $member->id]);
    	factory(Stat::class, 3)->create(['team_id' => $this->team->id, 'member_id' => 242]);

    	$this->repo->deleteByMember($this->team->id, $member->id);

    	$this->assertCount(3, Stat::all());
    }


    /** @test */
    public function it_can_switch_the_ownership_of_stats_between_two_team_members()
    {
    	$old = factory(TeamMember::class)->create(['team_id' => $this->team->id]);
    	$new = factory(TeamMember::class)->create(['team_id' => $this->team->id]);

    	factory(Stat::class)->create([
    		'team_id' 	=> $this->team->id,
    		'member_id' => $old->id,
    		'owner_id'	=> $old->user_id,
    	]);

    	$this->assertEquals($old->id, Stat::first()->member_id);
    	$this->assertEquals($old->user_id, Stat::first()->owner_id);

    	$this->repo->switchOwners($old, $new);

    	$this->assertEquals($new->id, Stat::first()->member_id);
    	$this->assertEquals($new->user_id, Stat::first()->owner_id);
    }
}