<?php

use App\Team;
use App\TeamMember;
use App\RC\Team\JoinTeam;
use App\RC\Team\TeamMemberRepository;

class JointTeamTest extends TestCase
{
	protected $member;
	protected $team;

	public function setUp()
	{
		parent::setUp();

		$this->member = App::make(TeamMemberRepository::class);

		$this->team = factory(Team::class)->create();

		$this->signIn();

		$this->seedRolesTable();
	}


    /** @test */
    public function it_accepts_an_invitation_to_join_a_team()
    {
    	$this->member->newPlayer($this->team->id)->invite($this->user->email);

    	(new JoinTeam('accept', $this->team->id))->handle();

    	$this->assertTrue($this->member->isMember());
    	$this->assertFalse($this->member->hasBeenInvited());
    }


    /** @test */
    public function it_declines_an_invitation_to_join_a_team()
    {
    	$this->member->newPlayer($this->team->id)->invite($this->user->email);

    	$this->assertCount(2, $this->member->all());

    	(new JoinTeam('decline', $this->team->id))->handle();

    	$this->assertCount(1, $this->member->all());
    }


    /** @test */
    public function it_sends_a_request_to_a_team_admin_asking_if_the_logged_in_user_may_join_their_team()
    {
    	(new JoinTeam('request', $this->team->id))->handle();

    	$this->assertCount(1, $this->member->all());

    	$this->member->using($this->member->find(1));

    	$this->assertTrue($this->member->hasRequestedToJoin());
    }


    /** @test */
    public function it_cancels_a_previous_request_to_join_a_given_team()
    {
    	(new JoinTeam('request', $this->team->id))->handle(); // precondition

    	(new JoinTeam('cancel', $this->team->id))->handle();

    	$this->assertCount(0, $this->member->all());
    }


    /** @test */
    public function it_throws_an_exception_if_an_unsupported_action_is_passed_to_the_constructor()
    {
    	$this->setExpectedException('Exception');

    	(new JoinTeam('cat', $this->team->id))->handle();
    }


}