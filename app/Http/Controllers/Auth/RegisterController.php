<?php

namespace App\Http\Controllers\Auth;

use App\User;
use App\AlphaTester;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Validator;
use Illuminate\Foundation\Auth\RegistersUsers;

class RegisterController extends Controller
{
	/*
	|--------------------------------------------------------------------------
	| Register Controller
	|--------------------------------------------------------------------------
	|
	| This controller handles the registration of new users as well as their
	| validation and creation. By default this controller uses a trait to
	| provide this functionality without requiring any additional code.
	|
	*/

	use RegistersUsers;

	/**
	 * Where to redirect users after login / registration.
	 *
	 * @var string
	 */
	protected $redirectTo = '/';

	/**
	 * Create a new controller instance.
	 *
	 * @return void
	 */
	public function __construct()
	{
		$this->middleware('guest');
	}

	/**
	 * Get a validator for an incoming registration request.
	 *
	 * @param  array  $data
	 * @return \Illuminate\Contracts\Validation\Validator
	 */
	protected function validator(array $data)
	{
		// reserved route keywords
		$reserved = implode(',', config('rookiecard.reserved.usernames'));

		// only alpha testers allowed at this time
		$testers = AlphaTester::testers();

		return Validator::make($data, [
			'firstname' => 'required|max:50',
			'lastname'  => 'required|max:50',
			'username'  => 'required|max:18|unique:rc_users|not_in:' . $reserved,
			'email'     => 'required|email|unique:rc_users|in:' . $testers,
			'password'  => 'required|min:6|confirmed',
		], ['email.in' => 'You are not an authorized alpha tester']);
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
		]);
	}
}