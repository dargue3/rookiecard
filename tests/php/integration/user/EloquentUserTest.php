<?php

use App\User;
use App\Team;
use App\TeamMember;
use App\Notification;
use App\RC\User\EloquentUser;

class EloquentUserTest extends TestCase
{
	/**
	 * The repository instance
	 * 
	 * @var EloquentUser
	 */
	protected $repo;


	public function setUp()
	{
		parent::setUp();

		$this->repo = new EloquentUser;

		$this->signIn();
	}


    /** @test */
    public function it_can_adjust_a_users_notification_settings()
    {
    	$this->repo->adjustNotifications($this->user->id, 'team_post', 0);

    	$user = User::find($this->user->id);

    	$settings = json_decode($user->settings);

    	$this->assertEquals(0, $settings->notifications->team_post);
    }


    /** @test */
    public function it_throws_an_exception_if_you_try_to_set_an_incorrect_type_for_notifications()
    {
    	$this->setExpectedException('Exception');

    	$this->repo->adjustNotifications($this->user->id, 'cats_cats', 0);
    }


    /** @test */
    public function it_throws_an_exception_if_you_try_to_set_an_incorrect_setting_for_notifications()
    {
    	$this->setExpectedException('Exception');

    	$this->repo->adjustNotifications($this->user->id, 'team_post', 4);
    }


    /** @test */
    public function it_fetches_all_notifications_for_a_given_user()
    {
        factory(Notification::class, 5)->create(['user_id' => $this->user->id]);

        $this->assertCount(5, $this->repo->notifications($this->user->id));
    }


    /** @test */
    public function it_returns_a_brief_overview_of_all_the_teams_a_given_user_belongs_to()
    {
        $team1 = factory(Team::class)->create();
        $team2 = factory(Team::class)->create();
        $user = factory(User::class)->create();
        factory(TeamMember::class)->create(['team_id' => $team1->id, 'user_id' => $user->id]);
        factory(TeamMember::class)->create(['team_id' => $team2->id, 'user_id' => $user->id]);

        $teams = $this->repo->teams($user->id);

        $this->assertCount(2, $teams);
        $this->assertEquals($team1->teamname, $teams[0]['teamname']);
        $this->assertEquals($team2->teamname, $teams[1]['teamname']);
    }

    /** @test */
    public function it_returns_an_array_of_data_about_a_given_user()
    {
        $user = factory(User::class)->create();

        $data = $this->repo->data($user->id);

        $this->assertEquals($user->id, $data['id']);
        $this->assertFalse(isset($data['email']));
        $this->assertFalse(isset($data['settings']));
        $this->assertTrue($data['age'] < 100);
    }


    /** @test */
    public function it_tells_whether_or_not_a_user_is_an_admin_of_a_given_team()
    {
        $team = factory(Team::class)->create();

        $this->makeAdminOfTeam($team);

        $this->assertTrue($this->repo->isTeamAdmin($this->user->id, $team->id));

        $randomUser = factory(User::class)->create();

        $this->assertFalse($this->repo->isTeamAdmin($randomUser->id, $team->id));
    }



    
}