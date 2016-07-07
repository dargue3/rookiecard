<?php

namespace App\Providers;

use Illuminate\Contracts\Events\Dispatcher as DispatcherContract;
use Illuminate\Foundation\Support\Providers\EventServiceProvider as ServiceProvider;

class EventServiceProvider extends ServiceProvider
{
    /**
     * The event listener mappings for the application.
     *
     * @var array
     */
    protected $listen = [
        'App\Events\TeamCreatedAnEvent' => [
            'App\Listeners\CreateNewsFeedEntry',
            'App\Listeners\NotifyUsers'
        ],

        'App\Events\TeamUpdatedAnEvent' => [
            'App\Listeners\CreateNewsFeedEntry',
            'App\Listeners\NotifyUsers'
        ],

        'App\Events\TeamDeletedAnEvent' => [
            'App\Listeners\CreateNewsFeedEntry',
            'App\Listeners\NotifyUsers'
        ],

        'App\Events\TeamInvitedUserToJoin' => [
            'App\Listeners\NotifyUsers'
        ],

        'App\Events\UserPostedToTeamFeed' => [
            'App\Listeners\CreateNewsFeedEntry',
            'App\Listeners\NotifyUsers'
        ],
    ];

    /**
     * Register any other events for your application.
     *
     * @param  \Illuminate\Contracts\Events\Dispatcher  $events
     * @return void
     */
    public function boot(DispatcherContract $events)
    {
        parent::boot($events);

        //
    }
}
