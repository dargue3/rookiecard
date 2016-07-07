<?php


use App\Stat;
use App\Team;
use App\Event;
use App\NewsFeed;
use App\TeamMember;
use App\RC\Team\EloquentTeam;
use App\RC\Stat\StatRepository;
use App\RC\Sports\SportInterface;
use App\RC\Event\EventRepository;

class EloquentTeamTest extends TestCase
{
	/**
	 * EloquentTeam instance
	 * 
	 * @var EloquentTeam
	 */
	protected $repo;


	/**
	 * An instance of a team
	 * 
	 * @var Team
	 */
	protected $team;


	public function setUp()
	{
		parent::setUp();

		$event = $this->app->make(EventRepository::class);
		$stat = $this->app->make(StatRepository::class);
		$this->repo = new EloquentTeam($event, $stat);

		$this->team = factory(Team::class)->create();

    	$this->signIn();
	}


    /** @test */
    public function it_returns_all_the_ids_of_users_associated_with_this_team()
    {
    	factory(TeamMember::class, 5)->create(['team_id' => $this->team->id]); // real users
    	factory(TeamMember::class, 3)->create(['team_id' => $this->team->id, 'user_id' => 0]); // ghosts

    	$member = TeamMember::first();

    	$users = $this->repo->users($this->team->id);
    	
    	$this->assertCount(5, $users);
    	$this->assertEquals($member->user_id, $users[0]);
    }


    /** @test */
    public function it_returns_all_the_members_of_this_team()
    {
    	factory(TeamMember::class, 5)->create(['team_id' => $this->team->id, 'user_id' => 0]); // ghosts

    	$members = $this->repo->members($this->team->id);
    	
    	$this->assertCount(5, $members);
    }


    /** @test */
    public function it_returns_all_the_news_feed_entries_for_this_team()
    {
    	factory(NewsFeed::class, 5)->create(['owner_id' => $this->team->id]);

    	$feed = $this->repo->feed($this->team->id);
    	
    	$this->assertCount(5, $feed);
    }


    /** @test */
    public function it_returns_all_the_events_belonging_to_this_team()
    {
    	factory(Event::class, 3)->create(['owner_id' => $this->team->id]);

    	$events = $this->repo->events($this->team->id);
    	
    	$this->assertCount(3, $events);
    }


    /** @test */
    public function it_returns_an_instance_of_the_sport_that_this_team_plays()
    {
    	$sport = $this->repo->sport($this->team->id);

    	$this->assertTrue(is_a($sport, SportInterface::class));
    }


    /** @test */
    public function it_returns_all_the_positions_associated_with_the_sport_that_this_team_plays()
    {
    	$positions = $this->repo->positions($this->team->id);

    	$this->assertTrue(! empty($positions));
    }


    /** @test */
    public function it_returns_all_of_the_above_data_in_one_big_array()
    {
    	$data = $this->repo->getAllData($this->team->id);

    	$this->assertTrue(array_key_exists('team', $data));
    	$this->assertTrue(array_key_exists('members', $data));
    	$this->assertTrue(array_key_exists('feed', $data));
    	$this->assertTrue(array_key_exists('events', $data));
    	$this->assertTrue(array_key_exists('positions', $data));
    	$this->assertTrue(array_key_exists('stats', $data));
    }
}