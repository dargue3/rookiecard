<?php

/*
|--------------------------------------------------------------------------
| Model Factories
|--------------------------------------------------------------------------
|
| Here you may define all of your model factories. Model factories give
| you a convenient way to create models for testing and seeding your
| database. Just tell the factory how a default model should look.
|
*/

$factory->define(App\User::class, function ($faker) {
    return [
        'firstname' 		=> $faker->firstname,
        'lastname' 			=> $faker->lastname,
        'username' 			=> $faker->username,
        'email'             => $faker->email,
        'gender'            => $faker->boolean,
        'birthday' 			=> $faker->date(),
        'password' 			=> str_random(10),
        'remember_token'	=> str_random(10),
    ];
});


$factory->define(App\Team::class, function ($faker) {
    return [
        'name'              => $faker->words(2, true),
        'teamname'          => $faker->username,
        'season'            => 1,
        'creator_id'        => 1,
        'sport'             => 0,
        'gender'            => 0,
        'long'              => -70.8389219,
        'lat'               => 42.9375932,
        'pic'               => '',
        'backdrop'          => '',
    ];
});


$factory->define(App\TeamMember::class, function ($faker) {
	$num = (string) $faker->numberBetween(0, 99);
	$positions = $faker->randomElements(['pg', 'sg', 'sf', 'pf', 'c'], 2);
    return [
        'user_id' 	=> $faker->randomNumber,
        'team_id' 	=> $faker->randomNumber,
        'meta'		=> json_encode(['num' => $num, 'positions' => $positions]),
    ];
});


$factory->define(App\Event::class, function ($faker) {

	// pick a nearby start and end time
	$start = Carbon\Carbon::createFromTimestamp($faker->dateTimeBetween('-30 days', '+30 days')->getTimestamp());
	$start = $start->minute(0)->second(0);
	$end = Carbon\Carbon::instance($start)->addHours(3);

    return [
    	'title' 		=> $faker->words(3, true),
    	'start' 		=> $start->timestamp,
    	'end' 			=> $end->timestamp,
    	'type'			=> $faker->numberBetween(0, 3),
        'owner_id' 		=> $faker->numberBetween(1, 100),
        'creator_id' 	=> $faker->numberBetween(1, 100),
    	'details'		=> $faker->sentences(2, true),
    ];
});


$factory->define(App\Stat::class, function ($faker) {
    return [
        'owner_id' => 0,
        'member_id' => 1,
        'team_id' => 2,
        'type' => 0,
        'sport' => 0,
        'season' => 1,
        'stats' => json_encode(['test' => 123]),
        'meta' => json_encode(['test' => 123]),
        'event_date' => 1460239200,
        'event_id' => 1,
    ];
});



