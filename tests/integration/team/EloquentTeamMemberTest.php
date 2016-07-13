<?php

use App\RC\Team\EloquentTeamMember;
use App\TeamMember;
use App\TeamInvite;
use App\Team;
use App\User;
use App\RC\Stat\StatRepository;

use App\RC\Team\Roles\InvitedPlayer;
use App\RC\Team\Roles\GhostPlayer;
use App\RC\Team\Roles\GhostCoach;
use App\RC\Team\Roles\InvitedCoach;
use App\RC\Team\Roles\RequestedToJoin;
use App\RC\Team\Roles\Player;
use App\RC\Team\Roles\Coach;
use App\RC\Team\Roles\Fan;
use App\RC\Team\Roles\Admin;


class EloquentTeamMemberTest extends TestCase
{
    /**
     * A TeamMember object to use throughout the tests
     * 
     * @var TeamMember
     */
    protected $member;

    /**
     * An instance of a team member repository
     * 
     * @var TeamMemberRepository
     */
    protected $repo;


    public function setUp()
    {
        parent::setUp();

        $this->signIn();

        $this->repo = new EloquentTeamMember;

        $this->seedRolesTable();
    }


    /** @test */
    public function it_sets_its_own_member_attribute_to_a_given_member_object()
    {
        $member = TeamMember::create(['user_id' => 5, 'team_id' => 5]);

        $this->repo->using($member);

        $this->assertEquals($member, $this->repo->member);
    }


    /** @test */
    public function it_sets_its_own_member_attribute_to_a_given_member_id()
    {
        $member = TeamMember::create(['user_id' => 5, 'team_id' => 5]);

        $this->repo->using($member->id);

        $this->assertEquals($member->id, $this->repo->member->id);
        $this->assertEquals($member->team_id, $this->repo->member->team_id);
    }


    /** @test */
    public function it_can_add_a_new_player()
    {
    	$this->repo->newPlayer(2);

    	$this->assertCount(1, TeamMember::all());
    	$this->assertTrue($this->repo->isPlayer());
    }


     /** @test */
    public function it_can_add_a_new_coach()
    {
    	$this->repo->newCoach(2);

    	$this->assertCount(1, TeamMember::all());
    	$this->assertTrue($this->repo->isCoach());
    }


    /** @test */
    public function it_can_add_the_logged_in_user_as_a_member_and_admin_when_they_create_a_team()
    {
        $this->repo->addTeamCreator(2, new Fan);

        $this->assertCount(1, TeamMember::all());
        $this->assertTrue($this->repo->isFan());
        $this->assertTrue($this->repo->isAdmin());

        $this->repo->addTeamCreator(3, new Player);

        $this->assertTrue($this->repo->isPlayer());
    }


     /** @test */
    public function it_can_toggle_the_logged_in_users_fan_status()
    {
        $this->repo->toggleFan(2);

        $this->assertTrue($this->repo->isFan());

        $this->repo->toggleFan(2);

        $this->assertFalse($this->repo->isFan());
    }


    /** @test */
    public function when_a_new_player_or_coach_is_added_they_are_a_ghost()
    {
    	$this->repo->newPlayer(2);

    	$this->assertTrue($this->repo->isGhost());
    }


    /** @test */
    public function a_new_ghost_member_has_default_meta_data()
    {
    	$this->repo->newPlayer(2);

    	$this->assertTrue(! empty($this->repo->member->meta));
    }


    /** @test */
    public function new_meta_data_can_be_attached_to_a_member()
    {
        $member = TeamMember::create(['user_id' => 1, 'team_id' => 2]);
        $this->repo->using($member);

        $this->repo->attachMetaData(['test' => 123]);

        $meta = json_decode($this->repo->member->meta);

        $this->assertEquals(123, $meta->test);
    }



    /** @test */
    public function when_a_new_ghost_is_added_they_get_the_given_name()
    {
    	$this->repo->newPlayer(2, 'Bob');

    	$name = json_decode($this->repo->member->meta)->name;

    	$this->assertEquals('Bob', $name);
    }


    /** @test */
    public function when_a_new_ghost_is_added_they_get_with_no_given_name_they_get_a_random_one()
    {
        $this->repo->newPlayer(2);

        $name = json_decode($this->repo->member->meta)->name;

        $this->assertTrue(! empty($name));
    }


    /** @test */
    public function when_a_user_is_invited_their_ghost_gets_their_email_as_meta_data()
    {
    	$user = factory(User::class)->create();
    	$this->repo->newPlayer(2)->invite($user->email);

    	$this->assertEquals($user->email, json_decode($this->repo->member->meta)->email);
    }


    /** @test */
    public function when_an_existing_user_is_invited_to_a_team__create_a_ghost_and_an_invited_member_role()
    {
        $user = factory(User::class)->create();
    	$this->repo->newPlayer(2)->invite($user->email);

    	$this->assertCount(2, TeamMember::all());

    	$this->repo->using(TeamMember::all()[1]);
    	$this->assertTrue($this->repo->hasRole(new InvitedPlayer));
    }



    /** @test */
    public function if_an_invited_email_already_is_a_member_of_this_team_there_is_an_exception_thrown()
    {
    	$user = factory(User::class)->create();
    	$this->repo->newPlayer(2)->invite($user->email);

    	$this->setExpectedException('Exception');

    	$this->repo->newPlayer(2)->invite($user->email);
    }



    /** @test */
    public function if_an_invited_user_with_this_email_does_not_exist_it_is_added_to_rc_team_invites_table()
    {
    	$this->repo->newPlayer(2)->invite('cats@cats.com');

    	$invite = TeamInvite::first();
    	$this->assertEquals('cats@cats.com', $invite->email);
    	$this->assertEquals($this->repo->member->id, $invite->ghost_id);
    	$this->assertEquals(2, $invite->team_id);
    }



    /** @test */
    public function a_new_member_can_request_to_join_the_team()
    {
        $this->repo->requestToJoin(5);

        $this->assertCount(1, TeamMember::all());
        $this->assertTrue($this->repo->hasRole(new RequestedToJoin));
    }


    /** @test */
    public function an_existing_member_has_an_exception_thrown_if_they_request_to_join()
    {
        $this->setExpectedException('Exception');

        $member->addRole(new Player)->requestToJoin();
    }



    /** @test */
    public function a_member_can_cancel_their_request_to_join_a_team()
    {
        $this->repo->requestToJoin(5)->cancelRequestToJoin(5);

        $this->assertCount(0, TeamMember::all());
        $this->assertFalse($this->repo->hasRole(new RequestedToJoin));
    }



    /** @test */
    public function an_invited_player_can_accept_the_invitation_to_join_and_become_a_player()
    {
        $this->repo->newPlayer(5)->invite($this->user->email);

        $this->repo->acceptInvitation(5);

        $this->assertCount(1, TeamMember::all());
        $this->assertTrue($this->repo->hasRole(new Player));
    }


    /** @test */
    public function an_invited_coach_can_accept_the_invitation_to_join_and_become_a_coach()
    {
        $this->repo->newCoach(5)->invite($this->user->email);

        $this->repo->acceptInvitation(5);

        $this->assertCount(1, TeamMember::all());
        $this->assertTrue($this->repo->hasRole(new Coach));
    }



    /** @test */
    public function an_invited_user_can_decline_the_invitation()
    {
        $this->repo->newPlayer(5)->invite($this->user->email);

        $this->repo->thanksButNoThanks(5);

        $this->assertFalse($this->repo->hasRole(new InvitedPlayer));
        $this->assertFalse($this->repo->hasRole(new Player));
    }



    /** @test */
    public function a_non_invited_member_has_an_exception_thrown_if_they_try_to_accept_an_invite()
    {
        $member = TeamMember::create(['user_id' => 1, 'team_id' => 2]);
        $this->repo->using($member);
        
        $this->repo->addRole(new Fan);

        $this->setExpectedException('Exception');

        $this->repo->acceptInvitation(20);
    }



    /** @test */
    public function a_non_invited_member_has_an_exception_thrown_if_they_try_to_decline_an_invite()
    {
        $member = TeamMember::create(['user_id' => 1, 'team_id' => 2]);
        $this->repo->using($member);
        
        $this->repo->addRole(new Fan);

        $this->setExpectedException('Exception');

        $this->repo->thanksButNoThanks();
    }


    /** @test */
    public function invited_member_replaces_an_existing_ghost_when_they_accept_an_invite()
    {
        // create a ghost player and invite user to replace them
        $this->repo->newPlayer(2, $this->user->fullName())->invite($this->user->email);

        $ghost = TeamMember::ghosts(2)->first();
        $invited = TeamMember::member($this->user->id, 2)->first();

        $this->assertCount(2, TeamMember::all());

        $this->repo->acceptInvitation(2);

        $this->assertCount(1, TeamMember::all());
        $this->assertTrue($this->repo->hasRole(new Player));
    }



    /** @test */
    public function invited_member_gets_relevent_ghost_meta_data_when_they_replace_one()
    {
        // create a ghost player and invite user to replace them
        $this->repo->newPlayer(2, $this->user->fullName())->invite($this->user->email);

        $ghost = TeamMember::ghosts(2)->first();
        $invited = TeamMember::where('user_id', $this->user->id)->first();

        // attach some dummy meta data
        $this->repo->using($ghost);
        $this->repo->attachMetaData(['test' => 123]);

        $this->repo->acceptInvitation(2);

        // ensure that dummy data is still there and ghost data is gone
        $meta = json_decode($this->repo->member->meta);
        $this->assertEquals(123, $meta->test);
        $this->assertFalse(isset($meta->ghost));
    }



    /** @test */
    public function when_a_user_accepts_an_invite__they_own_any_stats_belonging_to_their_ghost()
    {
        // create a ghost player and invite user to replace them
        $this->repo->newPlayer(2, $this->user->fullName())->invite($this->user->email);

        $ghost = TeamMember::ghosts(2)->first();
        $invited = TeamMember::where('user_id', $this->user->id)->first();

        $mock = $this->mock(StatRepository::class);
        $mock->shouldReceive('switchOwners')->once();

        $this->repo->acceptInvitation(2);
    }


    /** @test */
    public function a_member_can_have_their_data_edited_to_match_inputted_arguments()
    {
        $member = TeamMember::create(['user_id' => 1, 'team_id' => 2]);

        $this->repo->using($member)->attachMetaData(['num' => '00']);

        // get a new version from the db to ensure the data is saved
        $member = TeamMember::find($member->id);

        $meta = json_decode($member->meta);
        $this->assertEquals('00', $meta->num);
        $this->assertFalse($this->repo->hasRole(new Admin));

        // attach jersey number meta data and admin status
        $this->repo->editMember(['num' => '12', 'email' => 'cats@cats.com'], false, $admin = true);

        $member = TeamMember::find($member->id);

        $meta = json_decode($member->meta);

        $this->assertEquals('12', $meta->num);
        $this->assertEquals('cats@cats.com', $meta->email);
        $this->assertTrue($this->repo->hasRole(new Admin));
    }



    /** @test */
    public function an_exception_is_thrown_if_a_non_member_is_deleted_from_the_team()
    {
        $member = TeamMember::create(['user_id' => 1, 'team_id' => 2]);

        $this->repo->using($member);
        $this->repo->addRole(new Fan);
        
        $this->setExpectedException('Exception');

        $this->repo->deleteMember($member->id);
    }



    /** @test */
    public function if_member_being_deleted_is_a_user__a_ghost_takes_their_place()
    {
        $user = factory(App\User::class)->create();
        $member = TeamMember::create(['user_id' => $user->id, 'team_id' => 2]);

        $this->repo->using($member);
        $this->repo->addRole(new Player);

        $this->repo->attachMetaData(['num' => 123]);

        $mock = $this->mock(StatRepository::class);
        $mock->shouldReceive('switchOwners')->once();

        $this->repo->deleteMember($member->id);

        $meta = json_decode($this->repo->member->meta);

        $this->assertTrue($this->repo->hasRole(new GhostPlayer));
        $this->assertEquals(123, $meta->num); // ghost retains meta data
    }


    /** @test */
    public function if_a_ghost_member_is_being_deleted__all_associated_data_is_also_deleted()
    {
        $this->repo->newPlayer(2)->invite('cats@cats.com');

        $mock = $this->mock(StatRepository::class);
        $mock->shouldReceive('deleteByMember')->once();

        $this->repo->deleteMember(TeamMember::first()->id);

        $this->assertCount(0, TeamMember::all());
        $this->assertCount(0, TeamInvite::all()); // pending invite is deleted
    }


    /** @test */
    public function it_returns_a_team_member_object_if_a_given_user_belongs_to_a_given_team()
    {
        $team = factory(Team::class)->create();
        factory(TeamMember::class)->create(['team_id' => $team->id, 'user_id' => $this->user->id]);

        $member = $this->repo->teamMember($this->user->id, $team->id);

        $this->assertEquals($member->user_id, $this->user->id);
        $this->assertEquals($member->team_id, $team->id);
    }


    /** @test */
    public function it_returns_an_array_of_all_the_teams_that_a_given_user_belongs_to_with_their_respective_roles()
    {
        $team1 = factory(Team::class)->create();
        $team2 = factory(Team::class)->create();

        $this->repo->newPlayer($team1->id)->invite($this->user->email)->acceptInvitation($team1->id);
        $this->repo->newCoach($team2->id)->invite($this->user->email);

        $teams = $this->repo->teams($this->user->id);

        $this->assertCount(2, $teams);
        $this->assertEquals($team1->id, $teams[0]['team']->id);
        $this->assertEquals($team2->id, $teams[1]['team']->id);

        $this->assertTrue($teams[0]['roles']['isMember']);
        $this->assertFalse($teams[0]['roles']['hasBeenInvited']);
        $this->assertFalse($teams[0]['roles']['isFan']);

        $this->assertFalse($teams[1]['roles']['isMember']);
        $this->assertFalse($teams[1]['roles']['isFan']);
        $this->assertTrue($teams[1]['roles']['hasBeenInvited']);
    }

}