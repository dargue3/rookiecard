<?php
use Illuminate\Support\Facades\Route;


/*
|--------------------------------------------------------------------------
| Application Routes
|--------------------------------------------------------------------------
|
| Here is where you can register all of the routes for an application.
| It's a breeze. Simply tell Laravel the URIs it should respond to
| and give it the controller to call when that URI is requested.
|
*/


//auth controller for login, logout, registration, password reset
Route::get  ('/login',       'Auth\AuthController@getLogin');
Route::post ('/login',       'Auth\AuthController@postLogin');
Route::get  ('/register',    'Auth\AuthController@getRegister');
Route::post ('/register',    'Auth\AuthController@postRegister');
Route::get  ('/logout',      'Auth\AuthController@getLogout');
Route::get  ('/resetPass',   'Auth\PasswordController@getEmail');
Route::post ('/resetPass',   'Auth\PasswordController@postEmail');
Route::get  ('/newPass',     'Auth\PasswordController@getReset');
Route::post ('/newPass',     'Auth\PasswordController@postReset');





//api routes for ajax requests
Route::get  	('/api/v1/team/{teamname}/data', 'TeamController@getTeamData');

Route::resource  	('/api/v1/team/{teamname}/stats', 'StatController');

Route::post  	('/api/v1/team/{teamname}/feed', 'TeamController@postNewPost');
Route::delete  	('/api/v1/team/{teamname}/feed/{id}', 'TeamController@deletePost');

Route::post  	('/api/v1/team/{teamname}/fan', 'TeamController@toggleFan');

Route::put  	('/api/v1/team/{teamname}/user', 'TeamController@updateUser');

Route::get  	('/api/v1/team/{teamname}/events', 'TeamController@getEvents');
Route::post 	('/api/v1/team/{teamname}/events', ['middleware' => 'admin', 'uses' => 'TeamController@newEvent']);
Route::put  	('/api/v1/team/{teamname}/events', ['middleware' => 'admin', 'uses' => 'TeamController@updateEvent']);
Route::delete ('/api/v1/team/{teamname}/events', ['middleware' => 'admin', 'uses' => 'TeamController@deleteEvent']);



Route::get  ('/api/v1/user/auth/data', 'UserController@getUserData');
Route::post  ('/api/v1/user/auth/team/{id}', 'UserController@clearNotifications');


Route::post('/api/v1/settings', function () {
    // Save the user's timezone
    if (Request::has('timezone')) {
        Session::put('timezone', Request::get('timezone'));
    }
    // Save the user's locale
    if (Request::has('locale')) {
        Session::put('locale', Request::get('locale'));
    }
});




//routes for redirecting all other traffic to javascript app
Route::any  ('/',       										'SiteController@home');
Route::any  ('/{a}',       									'SiteController@home');
Route::any  ('/{a}/{b}',       							'SiteController@home');
Route::any  ('/{a}/{b}/{c}',       					'SiteController@home');
Route::any  ('/{a}/{b}/{c}/{e}',       			'SiteController@home');
Route::any  ('/{a}/{b}/{c}/{e}/{h}',				'SiteController@home');
Route::any  ('/{a}/{b}/{c}/{e}/{h}/{m}', 		'SiteController@home');
