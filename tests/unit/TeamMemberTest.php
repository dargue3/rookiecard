<?php
use App\TeamMember;
use App\TeamRole;
use App\TeamInvite;
use App\User;
use App\RC\Team\Roles\InvitedPlayer;


class TeamMemberTest extends TestCase
{
	use TeamRoleHelpers;
	use SignedInUser;
    
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

    	$this->assertTrue(!empty($member->meta));
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
    	$this->assertTrue(!empty($randomName));
    }


    /** @test */
    public function when_an_existing_user_is_invited_to_replace_their_ghost_an_invited_member_is_also_created()
    {
    	$this->seedRolesTable();
    	$user   = factory(User::class)->create();
    	$member = TeamMember::newPlayer(2)->invite($user->email);

    	$this->assertCount(2, TeamMember::all());

    	$invited = TeamMember::all()[1];
    	$this->assertTrue($invited->hasRole(new InvitedPlayer));
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
    public function if_an_invited_email_already_belongs_to_a_member_there_is_an_exception_thrown()
    {
    	$this->seedRolesTable();
    	$user   = factory(User::class)->create();
    	$member = TeamMember::newPlayer(2)->invite($user->email);

    	$this->setExpectedException('App\Exceptions\ApiException');

    	$member = TeamMember::newPlayer(2)->invite($user->email);
    }



    /** @test */
    public function if_a_user_with_this_email_does_not_exist_it_is_added_to_rc_team_invites_table()
    {
    	$this->seedRolesTable();
    	$member = TeamMember::newPlayer(2)->invite('cats@cats.com');

    	$invite = TeamInvite::first();
    	$this->assertEquals('cats@cats.com', $invite->email);
    	$this->assertEquals($member->id, $invite->ghost_id);
    	$this->assertEquals(2, $invite->team_id);
    }



    /**
     * Seed the TeamMember table with a member
     * @return void
     */
	public function seedMemberTable()
	{
		$attributes = [
			'user_id'    => 1,
			'team_id'    => 2,
		];

		TeamMember::create($attributes);
	}

}