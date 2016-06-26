<?php
use App\TeamMember;
use App\TeamRole;
use App\TeamInvite;
use App\User;
use App\Stat;
use App\RC\Team\Roles\InvitedPlayer;
use App\RC\Team\Roles\GhostPlayer;
use App\RC\Team\Roles\GhostCoach;
use App\RC\Team\Roles\InvitedCoach;
use App\RC\Team\Roles\RequestedToJoin;
use App\RC\Team\Roles\Player;
use App\RC\Team\Roles\Coach;
use App\RC\Team\Roles\Fan;
use App\RC\Team\Roles\Admin;


class TeamMemberTest extends TestCase
{
    
    /** @test */
    public function a_member_has_a_user_id()
    {
    	$this->seedMemberTable();

        $this->assertEquals(1, TeamMember::first()->user_id);
    }


    /** @test */
    public function a_member_has_a_team_id()
    {
    	$this->seedMemberTable();

    	$this->assertEquals(2, TeamMember::first()->team_id);
    }


    /** @test */
    public function can_fetch_a_member_with_a_query_scope()
    {
    	$this->seedMemberTable();

    	$this->assertCount(1, TeamMember::member(1, 2)->get());
    }


    /** @test */
    public function can_fetch_ghosts_with_a_query_scope()
    {
    	TeamMember::create(['user_id' => 0, 'team_id' => 2]);

    	$this->assertCount(1, TeamMember::ghosts(2)->get());
    }


    /** @test */
    public function can_fetch_a_member_with_a_scope()
    {
    	$this->seedMemberTable();

    	$this->assertCount(1, TeamMember::member(1, 2)->get());
    }


    /** @test */
    public function it_can_add_a_new_player()
    {
    	$this->seedRolesTable();
    	$member = TeamMember::newPlayer(2);

    	$this->assertCount(1, TeamMember::all());
    	$this->assertTrue($member->isPlayer());
    }


     /** @test */
    public function it_can_add_a_new_coach()
    {
    	$this->seedRolesTable();
    	$member = TeamMember::newCoach(2);

    	$this->assertCount(1, TeamMember::all());
    	$this->assertTrue($member->isCoach());
    }


    /** @test */
    public function when_a_new_player_or_coach_is_added_they_are_a_ghost()
    {
    	$this->seedRolesTable();
    	$player = TeamMember::newPlayer(2);
    	$coach = TeamMember::newCoach(2);

    	$this->assertTrue($player->isGhost());
    	$this->assertTrue($coach->isGhost());
    }


    /** @test */
    public function a_new_ghost_member_has_default_meta_data()
    {
    	$this->seedRolesTable();
    	$member = TeamMember::newPlayer(2);

    	$this->assertTrue(! empty($member->meta));
    }


    /** @test */
    public function new_meta_data_can_be_attached_to_a_member()
    {
        $this->seedRolesTable();
        $member = $this->seedMemberTable();

        $member->attachMetaData(['test' => 123]);

        $meta = json_decode($member->meta);

        $this->assertEquals(123, $meta->test);
    }



    /** @test */
    public function when_a_new_ghost_is_added_they_get_the_given_name_or_a_random_one_as_meta_data()
    {
    	$this->seedRolesTable();
    	$bob 	= TeamMember::newPlayer(2, 'Bob');
    	$random = TeamMember::newPlayer(2);

    	$bobsName = json_decode($bob->meta)->ghost->name;
    	$randomName = json_decode($random->meta)->ghost->name;

    	$this->assertEquals('Bob', $bobsName);
    	$this->assertTrue(! empty($randomName));
    }


    /** @test */
    public function when_a_user_is_invited_their_ghost_gets_their_email_as_meta_data()
    {
    	$this->seedRolesTable();
    	$user   = factory(User::class)->create();
    	$member = TeamMember::newPlayer(2)->invite($user->email);

    	$this->assertEquals($user->email, json_decode($member->meta)->ghost->email);
    }


    /** @test */
    public function when_an_existing_user_is_invited_to_a_team__create_a_ghost_and_an_invited_member_role()
    {
    	$this->seedRolesTable();
    	$user   = factory(User::class)->create();
    	$member = TeamMember::newPlayer(2)->invite($user->email);

    	$this->assertCount(2, TeamMember::all());

    	$invited = TeamMember::all()[1];
    	$this->assertTrue($invited->hasRole(new InvitedPlayer));
    }



    /** @test */
    public function if_an_invited_email_already_is_a_member_of_this_team_there_is_an_exception_thrown()
    {
    	$this->seedRolesTable();
    	$user   = factory(User::class)->create();
    	$member = TeamMember::newPlayer(2)->invite($user->email);

    	$this->setExpectedException('App\Exceptions\ApiException');

    	$member = TeamMember::newPlayer(2)->invite($user->email);
    }



    /** @test */
    public function if_an_invited_user_with_this_email_does_not_exist_it_is_added_to_rc_team_invites_table()
    {
    	$this->seedRolesTable();
    	$member = TeamMember::newPlayer(2)->invite('cats@cats.com');

    	$invite = TeamInvite::first();
    	$this->assertEquals('cats@cats.com', $invite->email);
    	$this->assertEquals($member->id, $invite->ghost_id);
    	$this->assertEquals(2, $invite->team_id);
    }



    /** @test */
    public function a_new_member_can_request_to_join_the_team()
    {
        $this->seedRolesTable();
        $member = new TeamMember(['user_id' => 1, 'team_id' => 2]);

        $member->requestToJoin();

        $this->assertCount(1, TeamMember::all());
        $this->assertTrue($member->hasRole(new RequestedToJoin));
    }


    /** @test */
    public function a_member_can_cancel_their_request_to_join_a_team()
    {
        $this->seedRolesTable();
        $member = new TeamMember(['user_id' => 1, 'team_id' => 2]);

        $member->requestToJoin()->cancelRequestToJoin();

        $this->assertCount(0, TeamMember::all());
        $this->assertFalse($member->hasRole(new RequestedToJoin));
    }



    /** @test */
    public function an_existing_member_has_an_exception_thrown_if_they_request_to_join()
    {
        $this->seedRolesTable();

        $member = $this->seedMemberTable();

        $this->setExpectedException('App\Exceptions\ApiException');

        $member->addRole(new Player)->requestToJoin();
    }


    /** @test */
    public function a_fan_can_request_to_join_and_retain_their_fan_status()
    {
        $this->seedRolesTable();

        $member = $this->seedMemberTable();

        $member->addRole(new Fan)->requestToJoin();

        $this->assertCount(1, TeamMember::all());
        $this->assertTrue($member->hasRole(new RequestedToJoin));
        $this->assertTrue($member->hasRole(new Fan));
    }


    /** @test */
    public function an_invited_player_can_accept_the_invitation_to_join_and_become_a_player()
    {
        $this->seedRolesTable();

        $member = $this->seedMemberTable();

        $this->signIn();

        $member->addRole(new InvitedPlayer)->acceptInvitation();

        $this->assertCount(1, TeamMember::all());
        $this->assertTrue($member->hasRole(new Player));
    }


    /** @test */
    public function an_invited_coach_can_accept_the_invitation_to_join_and_become_a_coach()
    {
        $this->seedRolesTable();

        $member = $this->seedMemberTable();

        $this->signIn();

        $member->addRole(new InvitedCoach)->acceptInvitation();

        $this->assertCount(1, TeamMember::all());
        $this->assertTrue($member->hasRole(new Coach));
    }



    /** @test */
    public function an_invited_user_can_decline_the_invitation()
    {
        $this->seedRolesTable();

        $member = $this->seedMemberTable();

        $this->signIn();

        $member->addRole(new InvitedPlayer)->thanksButNoThanks();

        $this->assertFalse($member->hasRole(new InvitedPlayer));
        $this->assertFalse($member->hasRole(new Player));
    }



    /** @test */
    public function an_invited_user_can_decline_the_invitation_and_retain_their_fan_status()
    {
        $this->seedRolesTable();

        $member = $this->seedMemberTable();

        $this->signIn();

        $member->addRole(new Fan);
        $member->addRole(new InvitedPlayer)->thanksButNoThanks();

        $this->assertTrue($member->hasRole(new Fan));
        $this->assertFalse($member->hasRole(new InvitedPlayer));
    }



    /** @test */
    public function a_non_invited_member_has_an_exception_thrown_if_they_try_to_accept_an_invite()
    {
        $this->seedRolesTable();

        $member = $this->seedMemberTable();

        $member->addRole(new Fan);

        $this->setExpectedException('App\Exceptions\ApiException');

        $member->acceptInvitation();
    }



    /** @test */
    public function a_non_invited_member_has_an_exception_thrown_if_they_try_to_decline_an_invite()
    {
        $this->seedRolesTable();

        $member = $this->seedMemberTable();

        $member->addRole(new Fan);

        $this->setExpectedException('App\Exceptions\ApiException');

        $member->thanksButNoThanks();
    }



    /** @test */
    public function an_existing_member_has_an_exception_thrown_if_they_accept_an_invitation()
    {
        $this->seedRolesTable();

        $member = $this->seedMemberTable();

        $this->setExpectedException('App\Exceptions\ApiException');

        $member->addRole(new Player)->acceptInvitation();
    }



    /** @test */
    public function an_existing_member_has_an_exception_thrown_if_they_decline_an_invitation()
    {
        $this->seedRolesTable();

        $member = $this->seedMemberTable();

        $this->setExpectedException('App\Exceptions\ApiException');

        $member->addRole(new Player)->thanksButNoThanks();
    }




    /** @test */
    public function invited_member_replaces_an_existing_ghost_when_they_accept_an_invite()
    {
        $this->seedRolesTable();

        $this->signIn();

        // create a ghost player and invite user to replace them
        TeamMember::newPlayer(2, $this->user->fullName())->invite($this->user->email);

        $ghost = TeamMember::ghosts(2)->first();
        $invited = TeamMember::where('user_id', $this->user->id)->first();

        $this->assertCount(2, TeamMember::all());
        $this->assertTrue($ghost->hasRole(new GhostPlayer));
        $this->assertTrue($invited->hasRole(new InvitedPlayer));

        $invited->acceptInvitation();

        $this->assertCount(1, TeamMember::all());
        $this->assertTrue($invited->hasRole(new Player));
    }



    /** @test */
    public function invited_member_gets_relevent_ghost_meta_data_when_they_replace_one()
    {
        $this->seedRolesTable();

        $this->signIn();

        // create a ghost player and invite user to replace them
        TeamMember::newPlayer(2, $this->user->fullName())->invite($this->user->email);

        $ghost = TeamMember::ghosts(2)->first();
        $invited = TeamMember::where('user_id', $this->user->id)->first();

        // attach some dummy meta data
        $ghost->attachMetaData(['test' => 123]);

        $invited->acceptInvitation();

        // ensure that dummy data is still there and ghost data is gone
        $meta = json_decode($invited->meta);
        $this->assertEquals(123, $meta->test);
        $this->assertFalse(isset($meta->ghost));
    }



    /** @test */
    public function when_a_user_accepts_an_invite__they_own_any_stats_belonging_to_their_ghost()
    {
        $this->seedRolesTable();

        $this->signIn();

        // create a ghost player and invite user to replace them
        TeamMember::newPlayer(2, $this->user->fullName())->invite($this->user->email);

        $ghost = TeamMember::ghosts(2)->first();
        $invited = TeamMember::where('user_id', $this->user->id)->first();

        factory(Stat::class, 5)->create([
            'member_id' => $ghost->id,
            'owner_id'  => 0,
            'team_id'   => 2,
        ]);

        // these stats belong to the ghost
        $this->assertCount(5, Stat::teamMember(2, $ghost->id)->get());

        $invited->acceptInvitation();

        // the stats have switched from the ghost to the new member
        $this->assertCount(5, Stat::teamMember(2, $invited->id)->get());
    }


    /** @test */
    public function a_member_can_have_their_data_edited_to_match_inputted_arguments()
    {
        $this->seedRolesTable();
        $member = $this->seedMemberTable();

        $member->attachMetaData(['num' => '00']);

        $meta = json_decode($member->meta);
        $this->assertEquals('00', $meta->num);
        $this->assertFalse($member->hasRole(new Admin));

        // attach jersey number meta data and admin status
        $member->editMember(['num' => '12', 'test' => 123], $admin = true);

        $meta = json_decode($member->meta);

        $this->assertEquals('12', $meta->num);
        $this->assertEquals(123, $meta->test);
        $this->assertTrue($member->hasRole(new Admin));
    }



    /** @test */
    public function an_exception_is_thrown_if_a_non_member_is_deleted_from_the_team()
    {
        $this->seedRolesTable();
        $member = $this->seedMemberTable();

        $this->setExpectedException('App\Exceptions\ApiException');

        $member->addRole(new Fan)->deleteMember();
    }



    /** @test */
    public function if_member_being_deleted_is_a_user__a_ghost_takes_their_place()
    {
        $this->seedRolesTable();
        $member = $this->seedMemberTable();
        
        $member->addRole(new Player);

        factory(App\User::class)->create(['id' => $member->user_id]);
        $user = User::first();

        factory(Stat::class, 5)->create([
            'member_id' => $member->id,
            'owner_id'  => $member->user_id,
            'team_id'   => $member->team_id,
        ]);

        $member->attachMetaData(['num' => 123]);

        $member->deleteMember();

        $meta = json_decode($member->meta);

        $this->assertTrue($member->hasRole(new GhostPlayer));
        $this->assertEquals(123, $meta->num); // ghost retains meta data
        $this->assertCount(5, Stat::teamMember(2, $member->id)->get()); // ghost retains stats
    }


    /** @test */
    public function if_a_ghost_member_is_being_deleted__all_associated_data_is_also_deleted()
    {
        $this->seedRolesTable();
        
        $member = TeamMember::newPlayer(2)->invite('cats@cats.com');

        factory(Stat::class, 5)->create([
            'member_id' => $member->id,
            'owner_id'  => $member->user_id,
            'team_id'   => $member->team_id,
        ]);

        $member->deleteMember();

        $this->assertTrue($member->trashed());
        $this->assertCount(0, Stat::teamMember(2, $member->id)->get()); // stats are deleted
        $this->assertCount(0, TeamInvite::all()); // pending invite is deleted
    }




    /**
     * Seed the TeamMember table with a member
     * 
     * @return void
     */
	public function seedMemberTable()
	{
		$attributes = [
			'user_id'    => 1,
			'team_id'    => 2,
		];

		return TeamMember::create($attributes);
	}

}