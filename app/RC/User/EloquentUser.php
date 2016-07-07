<?php
namespace App\RC\User;

use App;
use Auth;
use App\User;
use Exception;
use App\RC\Team\TeamRepository;
use App\RC\Stat\StatRepository;
use App\RC\Event\EventRepository;
use App\RC\Team\TeamMemberRepository;
use App\RC\NewsFeed\NewsFeedRepository;
use App\Repositories\EloquentRepository;
use App\RC\Notification\NotificationTypes;
use App\RC\Notification\NotificationRepository;

class EloquentUser extends EloquentRepository implements UserRepository
{
	use NotificationTypes;

	/**
	 * The path of this model, to be used in EloquentRepository
	 * 
	 * @var string
	 */
	protected $modelPath = 'App\User';


	/**
	 * The instance of the class that transforms user data
	 * 
	 * @var TransformsUserData
	 */
	protected $transformer;


			
	public function __construct()
	{
		$this->transformer = new TransformsUserData;	
	}


	/**
	 * Return all of this user's data formatted for front-end consumption
	 * 
	 * @param  string|null $username 
	 * @return array          
	 */
	public function data($username = null)
	{
		$user = $username ? User::username($username) : Auth::user();

        return $this->transformer->user($user);
	}


	/**
	 * Fetch all of the teams a given user is associated with 
	 * 
	 * @param  int|string $user
	 * @return array
	 */
    public function teams($username = null)
    {
    	$user = $username ? User::username($username) : Auth::user();

    	$repo = App::make(TeamMemberRepository::class);

        $teams = $repo->teams($user->id);

		return $this->transformer->teams($teams);
    }


	/**
	 * Fetch all the notifications for a given user
	 * 
	 * @param  int $user_id 
	 * @return Illuminate\Support\Collection          
	 */
	public function notifications($user_id)
	{
		$repo = App::make(NotificationRepository::class);

		return $repo->user($user_id);
	}


	/**
	 * Fetch the default settings for a user
	 * 0 = No notifications
	 * 1 = Create notification
	 * 2 = Create notification and email
	 * 
	 * @return array
	 */
	public function defaultSettings()
	{
		return [
			'notifications' => [
				'team_event_create' => 1,
				'team_event_update' => 2,
				'team_event_delete' => 2,
				'team_stats' 		=> 1,
				'team_post' 		=> 1,
				'user_post' 		=> 2,
				'user_stats'		=> 1,
			],
		];
	}


    /**
     * Check whether or not this user is an admin of a given team
     * 
     * @param  int  $user_id
     * @param  int  $team_id
     * @return boolean          
     */
    public function isTeamAdmin($team_id, $user_id = null)
    {
    	$repo = App::make(TeamMemberRepository::class);

    	$user_id = $user_id ?: Auth::id();

        $member = $repo->teamMember($user_id, $team_id);

        if (! $member) {
            return false;
        }

        return $repo->using($member)->isAdmin();
    }



	/**
	 * Change the method in which this user is notified for this type of event
	 * 
	 * @param  int $user_id 
	 * @param  string $type    
	 * @param  int $setting Between 0 and 2
	 * @return EloquentUser          
	 */
	public function adjustNotifications($user_id, $type, $setting)
	{
		$user = User::findOrFail($user_id);

		$settings = json_decode($user->settings);

		$this->verifySetting($type, $setting);

		$settings->notifications->{ $type } = $setting;
		$user->settings = json_encode($settings);
		$user->save();

		return $this;
	}


	/**
	 * Make sure that this setting is valid
	 * 
	 * @param  string $type 
	 * @param  int $setting 
	 * @return void
	 */
	public function verifySetting($type, $setting)
	{
		if (! is_integer($setting)) {
			throw new Exception("Setting has to be an integer. '$setting' given");
		}

		if ($setting > 2 or $setting < 0) {
			throw new Exception("Setting has to be between 0 and 2. '$setting' given");
		}

		if (! isset($this->stringToInt[$type])) {
			throw new Exception("'$type' is an unsupported notification type");
		}
	}

}