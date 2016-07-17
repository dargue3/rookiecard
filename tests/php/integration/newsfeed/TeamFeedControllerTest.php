<?php

use App\Team;
use App\NewsFeed;
use App\RC\NewsFeed\NewsFeedRepository;

class TeamFeedControllerTest extends TestCase
{
	/**
	 * The base url being used in every test
	 * 
	 * @var string
	 */
	protected $url = '/team/teamname/feed/';

	/**
	 * The team we are operating on
	 * @var Team
	 */
	protected $team;


	public function setUp()
	{
		parent::setUp();

		$this->team = factory(Team::class)->create(['teamname' => 'teamname']);

		$this->signIn()->makeAdminOfTeam($this->team);
	}


    /** @test */
    public function it_has_a_store_method_for_when_a_user_writes_a_post_on_a_teams_feed()
    {
    	$this->expectsEvents(App\Events\UserPostedToTeamFeed::class);

    	$this->call('POST', $this->url, ['post' => 'Hey team!']);

    	$this->assertResponseOk();
    }


    /** @test */
    public function it_has_a_destroy_method_for_deleting_a_given_feed_entry()
    {
    	$entry = factory(NewsFeed::class)->create(['owner_id' => $this->team->id]);

    	$mock = $this->mock(NewsFeedRepository::class);
    	$mock->shouldReceive('findOrFail')->once()->andReturn($entry);
    	$mock->shouldReceive('destroy')->once();

    	$this->call('DELETE', $this->url . $entry->id);

    	$this->assertResponseOk();
    }
}