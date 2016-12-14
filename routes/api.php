<?php
use Illuminate\Http\Request;
	
Route::post('team/create', 'TeamController@create');
Route::get('team/create/{name}', 'TeamController@checkAvailability');
Route::get('team/create/dummy/{gender}', 'TeamController@createDummyNames');
Route::get('team/create/stats/{sport}', 'TeamController@getStatKeys');

Route::get('team/{teamname}', 'TeamController@getTeamData');
Route::delete('team/{teamname}', 'TeamController@deleteTeam');
Route::post('team/{teamname}/join', 'TeamController@joinTeam');

Route::post('team/{teamname}/fan', 'TeamController@toggleFan');

Route::get('user/{id}', 'UserController@auth');

Route::post('settings/auth', 'UserController@locale');
Route::post('options/feedback', 'SiteController@feedback');


// team admin routes
Route::group(['middleware' => 'admin'], function() {

	Route::post('team/{teamname}/temp_pic', 'TeamController@uploadTempPic');
	Route::post('team/{teamname}/settings', 'TeamController@update');
	Route::delete('team/{teamname}/delete', 'TeamController@delete');

	Route::resource('team/{teamname}/feed', 'TeamFeedController');

	Route::resource('team/{teamname}/stats', 'StatController');

	Route::get('team/{teamname}/member/randomize', 'MemberController@randomize');
	Route::resource('team/{teamname}/member', 'MemberController');


	Route::resource('team/{teamname}/event', 'EventController');

});

// secret panel routes
Route::group(['middleware' => 'dev'], function() {
	Route::get('admin/authorize', 'SecretPanelController@authorized');
	Route::get('admin/feedback', 'SecretPanelController@feedback');
	Route::post('admin/tester', 'SecretPanelController@newTester');
	Route::post('admin/feedback/wipe', 'SecretPanelController@clearDone');
	Route::post('admin/feedback/{id}', 'SecretPanelController@toggleFeedbackCompletion');
});
