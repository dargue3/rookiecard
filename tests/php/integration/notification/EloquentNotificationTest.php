<?php

use App\User;
use App\Notification;
use App\RC\User\UserRepository;
use App\RC\Notification\EloquentNotification;

class EloquentNotificationTest extends TestCase
{
	/**
	 * The instance of the repo
	 * 
	 * @var EloquentNotification
	 */
	protected $repo;

	/**
	 * Some dummy data to attach 
	 * 
	 * @var array
	 */
	protected $data;

	/**
	 * The users on the team
	 * 
	 * @var TeamMember
	 */
	protected $users;


	public function setUp()
	{
		parent::setUp();

		$this->repo = new EloquentNotification;

		factory(User::class, 5)->create();

		$this->users = [1, 2, 3, 4, 5];

		$this->data = ['test' => 123];
	}


    /** @test */
    public function it_creates_a_notification_for_each_user_that_follows_this_team_with_enabled_notifications()
    {
    	$this->repo->send(1, $this->users, 'team_event_create', $this->data);

    	$this->assertCount(5, Notification::all());
    }


    /** @test */
    public function it_attaches_given_data_as_notification_meta_data()
    {
    	$this->repo->send(1, $this->users, 'team_event_create', $this->data);

    	$meta = json_decode(Notification::first()->meta);

    	$this->assertEquals(123, $meta->test);
    }


    /** @test */
    public function it_doesnt_send_a_notification_if_the_user_has_it_disabled()
    {
    	$user = App::make(UserRepository::class);

    	$user->adjustNotifications(1, 'team_event_create', 0);

    	$this->repo->send(1, $this->users, 'team_event_create', $this->data);

    	$this->assertCount(4, Notification::all());
    }


    /** @test */
    public function it_fetches_all_notifications_for_a_given_user()
    {
    	factory(Notification::class, 5)->create(['user_id' => 1]);

    	$this->assertCount(5, $this->repo->user(1));
    }

    
}