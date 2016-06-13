<?php

use App\TeamMember;
use App\TeamRole;
use App\RC\Team\Roles\Admin;
use App\RC\Team\Roles\Player;
use App\RC\Team\Roles\GhostPlayer;
use App\RC\Team\Roles\Coach;
use App\RC\Team\Roles\GhostCoach;
use App\RC\Team\Roles\Fan;
use App\RC\Team\Roles\InvitedPlayer;
use App\RC\Team\Roles\InvitedCoach;
use App\RC\Team\Roles\RequestedToJoin;

class TeamRolesTest extends TestCase
{
    use TeamRoleHelpers;

	public function seedWithMember()
	{
		$attributes = [
			'user_id'    => 1,
			'team_id'    => 2,
		];

		return TeamMember::create($attributes);
	}


    /** @test */
    public function all_role_classes_have_a_name_and_an_id_attribute_and_method()
    {
        $this->seedRolesTable();

        foreach($this->roles as $role) {
            $this->assertTrue(method_exists($role, 'name'));
            $this->assertTrue(method_exists($role, 'id'));
            $this->assertClassHasAttribute('name', $role);
            $this->assertClassHasAttribute('id', $role);
        }
    }


    /** @test */
    public function a_role_can_be_added_to_a_member()
    {
        $member = $this->seedWithMember();
    	$this->seedRolesTable();

        $this->assertCount(0, $member->roles()->get());

    	$member->addRole(new Player);

    	$this->assertTrue($member->hasRole(new Player));
        $this->assertCount(1, $member->roles()->get());
    }



    /** @test */
    public function a_role_can_be_removed_from_a_member()
    {
    	$member = $this->seedWithMember();
        $this->seedRolesTable();

    	$member->addRole(new Player);

    	$this->assertTrue($member->hasRole(new Player));

    	$member->removeRole(new Player);

    	$this->assertFalse($member->hasRole(new Player));
    }



    /** @test */
    public function a_member_can_have_multiple_roles()
    {
    	$member = $this->seedWithMember();
        $this->seedRolesTable();

    	$member->addRole(new Player);
    	$member->addRole(new Admin);
    	$member->addRole(new Fan);

    	$this->assertTrue($member->hasRole(new Player));
    	$this->assertTrue($member->hasRole(new Admin));
    	$this->assertTrue($member->hasRole(new Fan));
    }



    /** @test */
    public function an_api_exception_is_thrown_when_you_add_an_existing_role()
    {
        $member = $this->seedWithMember();
        $this->seedRolesTable();

        $this->setExpectedException('App\Exceptions\ApiException');

        $member->addRole(new Player);
        $member->addRole(new Player);
    }



    /** @test */
    public function all_roles_can_be_removed_from_a_member()
    {
    	$member = $this->seedWithMember();
        $this->seedRolesTable();

    	$member->addRole(new Player);
    	$member->addRole(new Admin);
    	$member->addRole(new Fan);

    	$this->assertCount(3, $member->roles()->get());

    	$member->removeAllRoles();

    	$this->assertCount(0, $member->roleArray);
    }


    /** @test */
    public function all_other_roles_can_be_removed_from_a_member_by_using_addRole_with_extra_argument()
    {
        $member = $this->seedWithMember();
        $this->seedRolesTable();

        $member->addRole(new Player);
        $member->addRole(new Admin);
        $member->addRole(new Fan);

        $this->assertCount(3, $member->roles()->get());

        $member->addRole(new Coach, true);

        $this->assertCount(1, $member->roles()->get());
    }



    /** @test */
    public function a_member_can_optionally_be_deleted_if_they_have_no_remaining_roles()
    {
        $member = $this->seedWithMember();
        $this->seedRolesTable();

        $member->addRole(new Player);
        
        $this->assertCount(1, $member->roles()->get());
        $this->assertFalse($member->trashed());

        $member->removeRole(new Player)->deleteIfTheyHaveNoRoles();

        $this->assertTrue($member->trashed());
    }



    /** @test */
    public function a_role_can_be_set_with_a_binary_flag()
    {
    	$member = $this->seedWithMember();
        $this->seedRolesTable();

    	$member->setRole(new Player, true);

    	$this->assertTrue($member->hasRole(new Player));

    	$member->setRole(new Player, false);

    	$this->assertFalse($member->hasRole(new Player));
    }



    /** @test */
    public function a_role_can_be_toggled_on_or_off()
    {
        $member = $this->seedWithMember();
        $this->seedRolesTable();

        $member->toggleRole(new Player);

        $this->assertTrue($member->hasRole(new Player));

        $member->toggleRole(new Player);

        $this->assertFalse($member->hasRole(new Player));
    }



    /** @test */
    public function a_member_with_a_player_or_coach_role_is_a_fan()
    {
    	$member = $this->seedWithMember();
        $this->seedRolesTable();

    	$member->addRole(new Player);
    	$this->assertTrue($member->isMember());

        $member->removeRole(new Player);
        $member->addRole(new Coach);
        $this->assertTrue($member->isMember());

        $member->removeRole(new Player);
        $member->removeRole(new Coach);
        $this->assertFalse($member->isMember());
    }



    /** @test */
    public function a_member_with_a_fan_role_is_a_fan()
    {
        $member = $this->seedWithMember();
        $this->seedRolesTable();

        $member->addRole(new Fan);
        $this->assertTrue($member->isFan());

        $member->removeRole(new Fan);
        $this->assertFalse($member->isFan());
    }


    /** @test */
    public function a_member_with_a_ghostplayer_or_ghostcoach_role_is_a_ghost()
    {
        $member = $this->seedWithMember();
        $this->seedRolesTable();

        $member->addRole(new GhostPlayer);
        $this->assertTrue($member->isGhost());

        $member->removeRole(new GhostPlayer);
        $member->addRole(new GhostCoach);
        $this->assertTrue($member->isGhost());

        $member->removeRole(new GhostPlayer);
        $member->removeRole(new GhostCoach);
        $this->assertFalse($member->isGhost());
    }


    /** @test */
    public function a_member_with_an_admin_role_is_an_admin()
    {
        $member = $this->seedWithMember();
        $this->seedRolesTable();

        $member->addRole(new Admin);
        $this->assertTrue($member->isAdmin());

        $member->removeRole(new Admin);
        $this->assertFalse($member->isAdmin());
    }


    /** @test */
    public function a_member_with_a_player_role_is_a_player()
    {
        $member = $this->seedWithMember();
        $this->seedRolesTable();

        $member->addRole(new Player);
        $this->assertTrue($member->isPlayer());

        $member->removeRole(new Player);
        $this->assertFalse($member->isPlayer());
    }



    /** @test */
    public function a_member_with_a_coach_role_is_a_coach()
    {
        $member = $this->seedWithMember();
        $this->seedRolesTable();

        $member->addRole(new Coach);
        $this->assertTrue($member->isCoach());

        $member->removeRole(new Coach);
        $this->assertFalse($member->isCoach());
    }


    /** @test */
    public function a_member_with_an_invitedplayer_or_invitedcoach_role_has_been_invited()
    {
        $member = $member = $this->seedWithMember();
        $this->seedRolesTable();

        

        $member->addRole(new InvitedPlayer);
        $this->assertTrue($member->hasBeenInvited());

        $member->removeRole(new InvitedPlayer);
        $member->addRole(new InvitedCoach);
        $this->assertTrue($member->hasBeenInvited());

        $member->removeRole(new InvitedPlayer);
        $member->removeRole(new InvitedCoach);
        $this->assertFalse($member->hasBeenInvited());
    }


    /** @test */
    public function a_member_with_a_requested_to_join_role_has_requested_to_join()
    {
        $member = $this->seedWithMember();
        $this->seedRolesTable();

        $member->addRole(new RequestedToJoin);
        $this->assertTrue($member->hasRequestedToJoin());

        $member->removeRole(new RequestedToJoin);
        $this->assertFalse($member->hasRequestedToJoin());
    }



    /** @test */
    public function a_member_is_invitable()
    {
        $member = $this->seedWithMember();
        $this->seedRolesTable();

        $member->addRole(new Fan);
        $this->assertTrue($member->isInvitable());

        $member->addRole(new RequestedToJoin, true);
        $this->assertTrue($member->isInvitable());

        $member->addRole(new Player, true);
        $this->assertFalse($member->isInvitable());

        $member->addRole(new Coach, true);
        $this->assertFalse($member->isInvitable());

        $member->addRole(new InvitedPlayer, true);
        $this->assertFalse($member->isInvitable());

        $member->addRole(new InvitedCoach, true);
        $this->assertFalse($member->isInvitable());
    }

}