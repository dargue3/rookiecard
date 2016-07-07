<?php

use Carbon\Carbon;
use App\RC\User\UserRepository;

$factory->define(App\User::class, function ($faker) {
    $repo = App::make(UserRepository::class);

    $birthday = Carbon::createFromDate(1992, 4, 20)->timestamp;

    $gender = $faker->randomElement(['male', 'female']);

    $settings = $repo->defaultSettings();

    return [
        'firstname' 		=> $faker->firstname,
        'lastname' 			=> $faker->lastname,
        'username' 			=> $faker->username,
        'email'             => $faker->email,
        'gender'            => $gender,
        'birthday' 			=> $birthday,
        'password' 			=> str_random(10),
        'remember_token'	=> str_random(10),
        'settings'          => json_encode($settings),
        'meta'              => json_encode(['test' => 123]),
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
        'pic'               => 'path\to\pic',
        'backdrop'          => 'path\to\pic',
    ];
});


$factory->define(App\TeamMember::class, function ($faker) {
	$num = (string) $faker->numberBetween(0, 99);
	$positions = $faker->randomElements(['pg', 'sg', 'sf', 'pf', 'c'], 2);
    return [
        'user_id' 	=> $faker->randomNumber,
        'team_id' 	=> $faker->randomNumber,
        'meta'		=> json_encode([
            'num'       => $num,
            'positions' => $positions,
            'name'      => $faker->name,
            'email'     => $faker->email
        ]),
    ];
});


$factory->define(App\Event::class, function ($faker) {

	// pick a nearby start and end time
	$start = Carbon::createFromTimestamp($faker->dateTimeBetween('-30 days', '+30 days')->getTimestamp());
	$start = $start->minute(0)->second(0);
	$end = Carbon::instance($start)->addHours(3);
    $type = $faker->randomElement(['practice', 'home_game', 'away_game', 'other']);

    return [
    	'title' 		=> $faker->words(3, true),
    	'start' 		=> $start->timestamp,
    	'end' 			=> $end->timestamp,
    	'type'			=> $type,
        'owner_id' 		=> $faker->numberBetween(1, 100),
        'creator_id' 	=> $faker->numberBetween(1, 100),
    	'details'		=> $faker->sentences(2, true),
    ];
});


$factory->define(App\NewsFeed::class, function ($faker) {
    $type = $faker->randomElement([
        'team_event_create',
        'team_event_delete',
        'team_event_update',
        'team_post',
        'team_stats',
    ]);

    return [
        'owner_id'      => $faker->numberBetween(1, 100),
        'creator_id'    => $faker->numberBetween(1, 100),
        'type'          => $type,
        'meta'          => json_encode(['test' => 123])
    ];
});


$factory->define(App\Notification::class, function ($faker) {
    $type = $faker->randomElement([
        'team_event_create',
        'team_event_delete',
        'team_event_update',
        'team_post',
        'team_stats',
    ]);

    return [
        'user_id'       => $faker->numberBetween(1, 100),
        'creator_id'    => $faker->numberBetween(1, 100),
        'type'          => $type,
        'meta'          => json_encode(['test' => 123])
    ];
});


$factory->define(App\Stat::class, function ($faker) {
    return [
        'owner_id'      => $faker->numberBetween(1, 100),
        'member_id'     => $faker->numberBetween(1, 100),
        'team_id'       => $faker->numberBetween(1, 100),
        'type'          => 0,
        'sport'         => 0,
        'season'        => 1,
        'stats'         => json_encode(['test' => 123]),
        'meta'          => json_encode(['test' => 123]),
        'event_date'    => 1460239200,
        'event_id'      => 1,
    ];
});



