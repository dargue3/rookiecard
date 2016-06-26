<?php

use App\User;
use App\Team;
use App\TeamMember;
use Illuminate\Support\Facades\Artisan;

class TestCase extends Illuminate\Foundation\Testing\TestCase
{
    use TeamRoleHelpers;

    /**
     * The base URL to use while testing the application.
     *
     * @var string
     */
    protected $baseUrl = 'http://localhost/api/v1';

    /**
     * The logged in user instance
     * @var User
     */
    protected $user;

    /**
     * Mock a given class
     * @param  mixed $class
     * @return Mockery
     */
    public function mock($class)
    {
        $mock = Mockery::mock($class);
        $this->app->instance($class, $mock);

        return $mock;
    }



    /**
     * Login as either a random or given user and save their credentials
     *  
     * @param  User|null $user 
     * @return TestCase          
     */
    public function signIn(User $user = null)
    {
        $this->user = $user ?: factory(User::class)->create();

        $this->actingAs($this->user);

        return $this;
    }


    /**
     * Make the signed-in user (see above) an admin of this team
     * 
     * @param  Team   $team
     * @return TestCase     
     */
    public function makeAdminOfTeam(Team $team)
    {
        $this->seedRolesTable();

        $member = TeamMember::create([
            'user_id' => $this->user->id,
            'team_id' => $team->id,
        ]);

        $member->editMember(['test' => 123], true);

        return $this;
    }



    /**
     * Creates the application.
     *
     * @return \Illuminate\Foundation\Application
     */
    public function createApplication()
    {
        putenv('DB_DEFAULT=sqlite_testing');
        
        $app = require __DIR__.'/../bootstrap/app.php';

        $app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

        return $app;
    }


    public function setUp()
    {
        parent::setUp();

        Artisan::call('migrate');
    }


    public function tearDown()
    {
        Artisan::call('migrate:reset');

        parent::tearDown();
    }
}
