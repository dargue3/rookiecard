<?php
namespace App\Providers;

use Illuminate\Support\ServiceProvider;

class RepositoryServiceProvider extends ServiceProvider
{
    /**
     * Bootstrap the application services.
     *
     * @return void
     */
    public function boot()
    {
        
    }

    /**
     * Register the application services.
     *
     * @return void
     */
    public function register()
    {
        $this->app->bind('App\RC\Event\EventRepository', 'App\RC\Event\EloquentEvent');
        $this->app->bind('App\RC\Team\TeamRepository','App\RC\Team\EloquentTeam');
        $this->app->bind('App\RC\User\UserRepository','App\RC\User\EloquentUser');
        $this->app->bind('App\RC\Team\TeamMemberRepository','App\RC\Team\EloquentTeamMember');
        $this->app->bind('App\RC\NewsFeed\NewsFeedRepository','App\RC\NewsFeed\EloquentNewsFeed');
        $this->app->bind('App\RC\Notification\NotificationRepository','App\RC\Notification\EloquentNotification');
        $this->app->bind('App\RC\Stat\StatRepository','App\RC\Stat\EloquentStat');
    }
}
