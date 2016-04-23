<?php

namespace App\Http\Controllers\Auth;

use App\User;
use Validator;
use App\Http\Controllers\Controller;
use Illuminate\Foundation\Auth\ThrottlesLogins;
use Illuminate\Foundation\Auth\AuthenticatesAndRegistersUsers;

class AuthController extends Controller
{
    /*
    |--------------------------------------------------------------------------
    | Registration & Login Controller
    |--------------------------------------------------------------------------
    |
    | This controller handles the registration of new users, as well as the
    | authentication of existing users. By default, this controller uses
    | a simple trait to add these behaviors. Why don't you explore it?
    |
    */

    use AuthenticatesAndRegistersUsers, ThrottlesLogins;

    protected $redirectAfterLogout = '/';

    protected $username = 'email';

    protected $maxLoginAttempts = 5;

    protected function authenticated() {
        //when the user is logged in via ajax
        return redirect('/home');
    }

    /**
     * Create a new authentication controller instance.
     *
     * @return void
     */
    public function __construct()
    {
        $this->middleware('guest', ['except' => 'getLogout']);
    }

    /**
     * Get a validator for an incoming registration request.
     *
     * @param  array  $data
     * @return \Illuminate\Contracts\Validation\Validator
     */
    protected function validator(array $data)
    {
        return Validator::make($data, [
            'firstname'              => 'required|alpha_dash|max:25',
            'lastname'               => 'required|alpha_dash|max:30',
            'username'               => 'required|alpha_num|unique:rc_users,username|max:30|
                                         not_in:register,login,logout,team,leagues,
                                         resetPass, newPass',
            'email'                  => 'required|email|unique:rc_users,email',
            'password'               => 'required|min:8|alpha_num|confirmed',
            'password_confirmation'  => 'required',
            'birthdate'              => 'required|date',
            'gender'                 => 'required|boolean'
        ]);
    }

    /**
     * Create a new user instance after a valid registration.
     *
     * @param  array  $data
     * @return User
     */
    protected function create(array $data)
    {
        return User::create([
            'firstname' => $data['firstname'],
            'lastname'  => $data['lastname'],
            'username'  => $data['username'],
            'email'     => $data['email'],
            'password'  => bcrypt($data['password']),
            'birthday'  => $data['birthdate'],
            'gender'    => $data['gender'],
        ]);
    }
}
