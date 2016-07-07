<?php
use Illuminate\Support\Facades\Route;


// auth controller routes
Route::get  ('/login',       'Auth\AuthController@getLogin');
Route::post ('/login',       'Auth\AuthController@postLogin');
Route::get  ('/register',    'Auth\AuthController@getRegister');
Route::post ('/register',    'Auth\AuthController@postRegister');
Route::get  ('/logout',      'Auth\AuthController@getLogout');
Route::get  ('/resetPass',   'Auth\PasswordController@getEmail');
Route::post ('/resetPass',   'Auth\PasswordController@postEmail');
Route::get  ('/newPass',     'Auth\PasswordController@getReset');
Route::post ('/newPass',     'Auth\PasswordController@postReset');



// all of the URIs in this group are API end points prefixed with /api/v1/
Route::group(['prefix' => '/api/v1'], function() {

	Route::post('team/create', 'TeamController@createTeam');
	Route::post('team/create/{name}', 'TeamController@checkAvailability');

	Route::get('team/{teamname}', 'TeamController@getTeamData');
	Route::post('team/{teamname}/join', 'TeamController@requestToJoin');
	Route::post('team/{teamname}/invite', 'TeamController@respondToInvitation');
	Route::post('team/{teamname}/pic', 'TeamController@uploadPic');
	Route::post('team/{teamname}/fan', 'TeamController@toggleFan');

	Route::resource('team/{teamname}/feed', 'TeamFeedController');

	Route::resource('team/{teamname}/stats', 'StatController');

	Route::resource('team/{teamname}/member', 'MemberController');
	
	Route::resource  ('team/{teamname}/event', 	'EventController');
	

	Route::get ('user/auth', 'UserController@auth');

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
	

// otherwise route to the javascript front-end and let vue-router handle it
Route::any('/{any}', 'SiteController@home')->where('any', '.*');




