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

//all of the URIs in this group are API end points prefixed with /api/v1/
Route::group(['prefix' => '/api/v1'], function() {

	Route::post ('team/create', 							'TeamController@createTeam');
	Route::post ('team/create/{teamname}', 		'TeamController@checkAvailability');
	Route::post ('team/update/{teamname}/pic','TeamController@uploadPic');


	Route::resource ('team/{teamname}/stats', 'StatController');

	Route::get  	('team/{teamname}/data', 		'TeamController@getTeamData');
	Route::post  	('team/{teamname}/feed', 		'TeamController@postNewPost');
	Route::delete ('team/{teamname}/feed', 		'TeamController@deletePost');
	Route::post  	('team/{teamname}/fan', 		'TeamController@toggleFan');
	Route::put  	('team/{teamname}/user', 		'TeamController@updateMember');
	Route::post  	('team/{teamname}/user', 		'TeamController@newMember');
	Route::delete ('team/{teamname}/user', 		'TeamController@deleteMember');
	Route::get  	('team/{teamname}/events', 	'TeamController@getEvents');
	Route::post 	('team/{teamname}/events', 	'TeamController@newEvent');
	Route::put  	('team/{teamname}/events', 	'TeamController@updateEvent');
	Route::delete ('team/{teamname}/events', 	'TeamController@deleteEvent');
	Route::post  	('team/{teamname}/join', 		'TeamController@joinTeam');


	Route::get ('user/auth/data', 		 'UserController@getUserData');
	Route::post('user/auth/team/{id}', 'UserController@clearNotifications');

	Route::post('settings', function () {
	    // Save the user's timezone
	    if (Request::has('timezone')) {
	        Session::put('timezone', Request::get('timezone'));
	    }
	    // Save the user's locale
	    if (Request::has('locale')) {
	        Session::put('locale', Request::get('locale'));
	    }
	});
	Route::post  ('settings/stats/{sport}', 'StatController@addStatColumns');
	Route::get  ('stats/{sport}', 'StatController@getStatColumns');
});


//otherwise route to the javascript front-end and let vue-router handle it
Route::any('/{any}', 'SiteController@home')->where('any', '.*');




