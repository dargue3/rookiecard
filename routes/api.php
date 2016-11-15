<?php
use Illuminate\Http\Request;
	
Route::post('team/create', 'TeamController@create');
Route::get('team/create/{name}', 'TeamController@checkAvailability');
Route::get('team/create/dummy/{gender}', 'TeamController@createDummyNames');
Route::get('team/create/stats/{sport}', 'TeamController@getStatKeys');

Route::get('team/{teamname}', 'TeamController@getTeamData');
Route::post('team/{teamname}/join', 'TeamController@joinTeam');

Route::post('team/{teamname}/fan', 'TeamController@toggleFan');

Route::get('user/{id}', 'UserController@auth');

Route::post('settings/auth', 'UserController@locale');


// team admin routes
Route::group(['middleware' => 'admin'], function() {

	Route::post('team/{teamname}/temp_pic', 'TeamController@uploadTempPic');
	Route::post('team/{teamname}/settings', 'TeamController@update');

	Route::resource('team/{teamname}/feed', 'TeamFeedController');

	Route::resource('team/{teamname}/stats', 'StatController');

	Route::get('team/{teamname}/member/randomize', 'MemberController@randomize');
	Route::resource('team/{teamname}/member', 'MemberController');

	Route::resource('team/{teamname}/event', 'EventController');

});
