<?php

use App\RC\Team\TeamMemberRepository;

use App\RC\Team\Roles\Admin;
use App\RC\Team\Roles\Player;
use App\RC\Team\Roles\GhostPlayer;
use App\RC\Team\Roles\Coach;
use App\RC\Team\Roles\GhostCoach;
use App\RC\Team\Roles\Fan;
use App\RC\Team\Roles\InvitedPlayer;
use App\RC\Team\Roles\InvitedCoach;
use App\RC\Team\Roles\RequestedToJoin;

class ManagesTeamRolesTest extends TestCase
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

        $this->repo = $this->app->make(TeamMemberRepository::class);

        $this->member = $this->repo->create(['user_id' => 1,'team_id' => 2]);

        // tell the repo to operate on $this->member
        $this->repo->using($this->member);

        $this->seedRolesTable();
	}


    /** @test */
    public function all_role_classes_have_a_name_and_an_id_attribute_and_method()
    {
        foreach($this->roles as $role) {
            $this->assertClassHasAttribute('name', $role);
            $this->assertClassHasAttribute('id', $role);
        }
    }


    /** @test */
    public function a_role_can_be_added_to_a_member()
    {
        $this->assertCount(0, $this->member->roles()->get());

    	$this->repo->addRole(new Player);

    	$this->assertTrue($this->repo->hasRole(new Player));
        $this->assertCount(1, $this->member->roles()->get());
    }



    /** @test */
    public function a_role_can_be_removed_from_a_member()
    {
    	$this->repo->addRole(new Player);

    	$this->assertTrue($this->repo->hasRole(new Player));

    	$this->repo->removeRole(new Player);

    	$this->assertFalse($this->repo->hasRole(new Player));
    }



    /** @test */
    public function a_member_can_have_multiple_roles()
    {
    	$this->repo->addRole(new Player);
    	$this->repo->addRole(new Admin);
    	$this->repo->addRole(new Fan);

    	$this->assertTrue($this->repo->hasRole(new Player));
    	$this->assertTrue($this->repo->hasRole(new Admin));
    	$this->assertTrue($this->repo->hasRole(new Fan));
    }


    /** @test */
    public function all_roles_can_be_removed_from_a_member()
    {
    	$this->repo->addRole(new Player);
    	$this->repo->addRole(new Admin);
    	$this->repo->addRole(new Fan);

    	$this->assertCount(3, $this->member->roles()->get());

    	$this->repo->removeAllRoles();

    	$this->assertCount(0, $this->repo->roleArray());
    }


    /** @test */
    public function all_other_roles_can_be_removed_from_a_member_by_using_addRole_with_extra_argument()
    {
        $this->repo->addRole(new Player);
        $this->repo->addRole(new Admin);
        $this->repo->addRole(new Fan);

        $this->assertCount(3, $this->member->roles()->get());

        $this->repo->addRole(new Coach, true);

        $this->assertCount(1, $this->member->roles()->get());
    }



    /** @test */
    public function a_member_can_optionally_be_deleted_if_they_have_no_remaining_roles()
    {
        $this->assertFalse($this->member->trashed());

        $this->repo->addRole(new Player);

        $this->repo->removeRole(new Player)->deleteIfTheyHaveNoRoles();

        $this->member = $this->repo->find($this->member->id);

        $this->assertTrue(! $this->member);
    }



    /** @test */
    public function a_role_can_be_set_with_a_binary_flag()
    {
    	$this->repo->setRole(new Player, true);

    	$this->assertTrue($this->repo->hasRole(new Player));

    	$this->repo->setRole(new Player, false);

    	$this->assertFalse($this->repo->hasRole(new Player));
    }



    /** @test */
    public function a_role_can_be_toggled_on_or_off()
    {
        $this->repo->toggleRole(new Player);

        $this->assertTrue($this->repo->hasRole(new Player));

        $this->repo->toggleRole(new Player);

        $this->assertFalse($this->repo->hasRole(new Player));
    }


    /** @test */
    public function a_member_can_have_their_role_switched_between_player_or_coach()
    {
        $this->repo->addRole(new Player);

        $this->assertTrue($this->repo->hasRole(new Player));

        $this->repo->setMemberRole('coach');

        $this->assertFalse($this->repo->hasRole(new Player));
        $this->assertTrue($this->repo->hasRole(new Coach));
    }


    /** @test */
    public function a_ghost_member_can_have_their_role_toggled_between_ghost_player_or_ghost_coach()
    {
        $this->repo->addRole(new GhostCoach);

        $this->assertTrue($this->repo->hasRole(new GhostCoach));

        $this->repo->setMemberRole('player');

        $this->assertFalse($this->repo->hasRole(new GhostCoach));
        $this->assertTrue($this->repo->hasRole(new GhostPlayer));
    }



    /** @test */
    public function a_member_with_a_player_or_coach_role_is_a_member()
    {
    	$this->repo->addRole(new Player);
    	$this->assertTrue($this->repo->isMember());

        $this->repo->removeRole(new Player);
        $this->repo->addRole(new Coach);
        $this->assertTrue($this->repo->isMember());

        $this->repo->removeRole(new Player);
        $this->repo->removeRole(new Coach);
        $this->assertFalse($this->repo->isMember());
    }



    /** @test */
    public function a_member_with_a_fan_role_is_a_fan()
    {
        $this->repo->addRole(new Fan);
        $this->assertTrue($this->repo->isFan());

        $this->repo->removeRole(new Fan);
        $this->assertFalse($this->repo->isFan());
    }


    /** @test */
    public function a_member_with_a_ghostplayer_or_ghostcoach_role_is_a_ghost()
    {
        $this->repo->addRole(new GhostPlayer);
        $this->assertTrue($this->repo->isGhost());

        $this->repo->removeRole(new GhostPlayer);
        $this->repo->addRole(new GhostCoach);
        $this->assertTrue($this->repo->isGhost());

        $this->repo->removeRole(new GhostPlayer);
        $this->repo->removeRole(new GhostCoach);
        $this->assertFalse($this->repo->isGhost());
    }


    /** @test */
    public function a_member_with_an_admin_role_is_an_admin()
    {
        $this->repo->addRole(new Admin);
        $this->assertTrue($this->repo->isAdmin());

        $this->repo->removeRole(new Admin);
        $this->assertFalse($this->repo->isAdmin());
    }


    /** @test */
    public function a_member_with_a_player_role_is_a_player()
    {
        $this->repo->addRole(new Player);
        $this->assertTrue($this->repo->isPlayer());

        $this->repo->removeRole(new Player);
        $this->assertFalse($this->repo->isPlayer());
    }



    /** @test */
    public function a_member_with_a_coach_role_is_a_coach()
    {
        $this->repo->addRole(new Coach);
        $this->assertTrue($this->repo->isCoach());

        $this->repo->removeRole(new Coach);
        $this->assertFalse($this->repo->isCoach());
    }


    /** @test */
    public function a_member_with_an_invitedplayer_or_invitedcoach_role_has_been_invited()
    {
        $this->repo->addRole(new InvitedPlayer);
        $this->assertTrue($this->repo->hasBeenInvited());

        $this->repo->removeRole(new InvitedPlayer);
        $this->repo->addRole(new InvitedCoach);
        $this->assertTrue($this->repo->hasBeenInvited());

        $this->repo->removeRole(new InvitedPlayer);
        $this->repo->removeRole(new InvitedCoach);
        $this->assertFalse($this->repo->hasBeenInvited());
    }


    /** @test */
    public function a_member_with_a_requested_to_join_role_has_requested_to_join()
    {
        $this->repo->addRole(new RequestedToJoin);
        $this->assertTrue($this->repo->hasRequestedToJoin());

        $this->repo->removeRole(new RequestedToJoin);
        $this->assertFalse($this->repo->hasRequestedToJoin());
    }



    /** @test */
    public function role_methods_can_be_chained_together()
    {
        $this->repo->addRole(new Fan)
                ->setRole(new Admin, true)
                ->removeRole(new Admin)
                ->toggleRole(new GhostPlayer);

        $this->assertTrue($this->repo->hasRole(new Fan));
        $this->assertTrue($this->repo->hasRole(new GhostPlayer));
        $this->assertFalse($this->repo->hasRole(new Admin));

        $this->repo->setRole(new GhostPlayer, false)
                ->removeRole(new Fan)
                ->deleteIfTheyHaveNoRoles();

        $this->member = $this->repo->find($this->member->id);

        $this->assertFalse($this->repo->hasRole(new GhostPlayer));
        $this->assertFalse($this->repo->hasRole(new Fan));
        $this->assertTrue(! $this->member);
    }

}