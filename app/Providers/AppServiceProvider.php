<?php

namespace App\Providers;

use App\Notification;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Bootstrap any application services.
     *
     * @return void
     */
    public function boot()
    {

    }

    /**
     *
     *
     * Register any application services.
     *
     * @return void
     */
    public function register()
    {
        $this->app->bind(
            'App\RC\Events\EventRepository',
            'App\RC\Events\EloquentEvent'
        );

        $this->app->bind(
            'App\RC\Team\TeamRepository',
            'App\RC\Team\EloquentTeam'
        );
    }
}
