<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

use App\Notification;

class UserEmailSetting extends Model
{
    protected $table = 'rc_user_email_settings';

    protected $guarded = [];


    public function scopeUser($query, $user_id) {
    	return $query->where('user_id', $user_id);
    }

    //check the database for whether or not the user wants to be emailed
    //for a notification of this type
    public function doesUserWantAnEmail($user_id, $type) {
    	$settings = $this->user($user_id)->first();

    	return $settings[$type];
    }
}
