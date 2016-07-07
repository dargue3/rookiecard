<?php
namespace App\RC\Notification;

use App;
use Exception;
use App\Notification;
use App\RC\Team\TeamRepository;
use App\RC\User\UserRepository;
use App\Repositories\EloquentRepository;

class EloquentNotification extends EloquentRepository implements NotificationRepository
{
	/**
	 * The path of this model, to be used in EloquentRepository
	 * 
	 * @var string
	 */
	protected $modelPath = 'App\Notification';


	/**
	 * The type of notification being created
	 * 
	 * @var string
	 */
	protected $type;


	/**
	 * The id of the team or user that created this notification
	 * 
	 * @var int
	 */
	protected $creator_id;


	/**
	 * Any relevent data associated with this notification
	 * 
	 * @var array
	 */
	protected $data;



	/**
	 * Create a notification for the given users
	 * 
	 * @param  int $creator_id
	 * @param  array  $users  Array of user ids that follow this team
	 * @param  string $type       
	 * @param  array $data       
	 * @return void             
	 */
	public function send($creator_id, array $users, $type, $data)
	{
		$this->creator_id = $creator_id;
		$this->type = $type;
		$this->data = $data;

		$userRepo = App::make(UserRepository::class);

		foreach ($users as $user_id) {
			$settings = json_decode($userRepo->findOrFail($user_id, ['settings'])->settings)->notifications;

			if (isset($settings->{ $type })) {
				$this->handle($user_id, $settings->{ $type });
			} else {
				throw new Exception("Cannot generate notifications for unsupported type '$type'");
			}
		}
	}


	/**
	 * Send the given user an appropriate notification based on their setting
	 * 
	 * @param  int $user_id 
	 * @param  int $setting    
	 * @return EloquentNotification     
	 */
	public function handle($user_id, $setting)
	{
		switch ($setting) {
			case 2:
				$this->sendEmail($user_id);
			case 1:
				$this->notify($user_id);
				break;
			default:
				break;
		}

		return $this;
	}


	/**
	 * Send a notification in the form of an email to a given user
	 * 
	 * @param  int $user_id 
	 * @return EloquentNotification         
	 */
	public function sendEmail($user_id)
	{
		// DO THE MAIL RELATED STUFF HERE

		return $this;
	}


	/**
	 * Send a notification in the form of a badge on the nav-bar to a given user
	 * 
	 * @param  int $user_id 
	 * @return EloquentNotification          
	 */
	public function notify($user_id)
	{
		Notification::create([
			'user_id'		=> $user_id,
			'creator_id'	=> $this->creator_id,
			'type'			=> $this->type,
			'meta'			=> json_encode($this->data),
		]);

		return $this;
	}


	/**
	 * Fetch all of the given user's notifications
	 * 
	 * @param  int $user_id 
	 * @return Illuminate\Support\Collection          
	 */
	public function user($user_id)
	{
		return Notification::where('user_id', $user_id)->get();
	}


}