<?php

namespace App\Providers;

use App\Notification;
use Illuminate\Support\ServiceProvider;
use App\User;
use App\Team;
use App\TeamPlayer;
use Illuminate\Support\Facades\Auth;

class ViewComposerServiceProvider extends ServiceProvider
{
    /**
     * Bootstrap the application services.
     *
     * @return void
     */
    public function boot()
    {
        $this->composeNav();
    }

    /**
     * Register the application services.
     *
     * @return void
     */
    public function register()
    {

    }



    //bind user information when the nav bar is loaded
    public function composeNav()
    {

        view()->composer('partials/nav', function($view) {

            //only if user is logged in
            if(!empty(Auth::user())) {

                $username = User::findOrFail(Auth::user()->id)->username;

                //get notification count
                $count = Notification::where('user_id', Auth::user()->id)->count();
                if ($count == 0)
                    $count = '';

                //if there's multiple teams, link sends to /team/select landing page
                $teamCount = TeamPlayer::where('player_id', Auth::user()->id)->count();
                if($teamCount > 1)
                    $teamname = 'select';

                //else send to /team/{ teamname }
                else {
                    $player = TeamPlayer::where('player_id', Auth::user()->id)->first();
                    if($player)
                        $teamname = Team::find($player->team_id)->teamname;
                    else
                        $teamname = 'join'; //send no where for now
                }

                //load nav view with variables
                $view->with([
                    'username'          => $username,
                    'notificationCount' => $count,
                    'teamname'          => $teamname

                ]);
            }
        });
    }



}
