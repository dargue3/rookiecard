<?php
use App\User;
use App\TeamRole;

class HelpersTest extends TestCase
{
    use SignedInUser;
    use TeamRoleHelpers;

    /** @test */
    public function a_random_user_gets_logged_in_when_no_arguments_to_sign_in_method()
    {
    	$this->signIn();

    	$this->assertEquals($this->user->id, Auth::id());
    }


    /** @test */
    public function a_given_user_gets_logged_in_when_passed_to_sign_in_method()
    {
        $user = factory(User::class)->create();

        $this->signIn($user);

        $this->assertEquals($user->id, Auth::id());
        $this->assertEquals($user->id, $this->user->id);
    }


    /** @test */
    public function the_team_roles_table_gets_seeded_with_roles()
    {
        $this->seedRolesTable();

        $this->assertCount(count($this->roles), TeamRole::all());
    }
}