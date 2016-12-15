<?php
namespace App;

use App\Team;
use Laravel\Passport\HasApiTokens;
use Illuminate\Auth\Authenticatable;
use App\RC\Team\TeamMemberRepository;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Auth\Passwords\CanResetPassword;
use Illuminate\Foundation\Auth\Access\Authorizable;
use Illuminate\Contracts\Auth\Authenticatable as AuthenticatableContract;
use Illuminate\Contracts\Auth\Access\Authorizable as AuthorizableContract;
use Illuminate\Contracts\Auth\CanResetPassword as CanResetPasswordContract;


class User extends Model implements AuthenticatableContract, CanResetPasswordContract, AuthorizableContract
{
    use SoftDeletes;
    use Authenticatable, Authorizable, CanResetPassword;
    use HasApiTokens, Notifiable;

    protected $table = 'rc_users';
    protected $dates = ['deleted_at'];
    protected $guarded = [];
    protected $hidden = ['password', 'remember_token', 'email', 'birthday', 'created_at', 'settings', 'updated_at', 'deleted_at'];


    /**
     * Find a user model with a given username
     * 
     * @param  Builder $query    
     * @param  string $username 
     * @return User
     */
    public function scopeUsername($query, $username)
    {
        return $query->where('username', $username)->firstOrFail();
    }



    /**
     * Convert the gender to a string before giving to front-end
     * 
     * @param  int $gender 
     * @return string       
     */
    public function getGenderAttribute($gender)
    {
        if ($gender == 0) return 'male';
        if ($gender == 1) return 'female';
    }



    /**
     * Convert the gender to an int before storing in db
     * 
     * @param  string $gender 
     * @return void       
     */
    public function setGenderAttribute($gender)
    {
        if ($gender == 'male') $this->attributes['gender'] = 0;
        if ($gender == 'female') $this->attributes['gender'] = 1;
    }



    /**
     * Return this user's full name
     * 
     * @return string 
     */
    public function fullName()
    {
        return "$this->firstname $this->lastname"; 
    }


    /**
     * Return a small amount of this user's data for front-end
     * 
     * @return array 
     */
    public function brief()
    {
        return [
            'id'            => $this->id,
            'firstname'     => $this->firstname,
            'lastname'      => $this->lastname,
            'username'      => $this->username,
        ];
    }


    /**
     * Is the logged in user Dan Argue?
     * 
     * @return boolean
     */
    public function isDan()
    {
        return $this->id == 1;
    }

}
