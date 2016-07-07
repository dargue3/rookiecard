<?php

use App\NewsFeed;
use App\RC\NewsFeed\EloquentNewsFeed;

class EloquentNewsFeedTest extends TestCase
{
	/**
	 * The data to be attached to the feed entry
	 * 
	 * @var array
	 */
	protected $data;


	/**
	 * The instance of EloquentNewsFeed
	 * 
	 * @var EloquentNewsFeed
	 */
	protected $repo;


	public function setUp()
	{
		parent::setUp();

		$this->repo = new EloquentNewsFeed;

		$this->data = ['test' => 123];

		$this->signIn();
	}


    /** @test */
    public function it_adds_data_associated_with_the_feed_entry_to_class_attributes()
    {
    	$this->repo->add(5, 'team_stats', $this->data);

    	$this->assertEquals(5, $this->repo->owner_id);
    	$this->assertEquals('team_stats', $this->repo->type);
    	$this->assertEquals(['test' => 123], $this->repo->meta);
    }


    /** @test */
    public function it_creates_a_feed_entry_with_the_given_attributes()
    {
    	$this->repo->add(5, 'team_stats', $this->data);

    	$entry = NewsFeed::first();

    	$this->assertCount(1, NewsFeed::all());
    	$this->assertEquals($entry->owner_id, 5);
    	$this->assertEquals($entry->creator_id, $this->user->id);
    	$this->assertEquals($entry->meta, json_encode($this->data));
    }
}