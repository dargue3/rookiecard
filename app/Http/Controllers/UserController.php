<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use App\Http\Requests;
use App\Http\Controllers\Controller;

use Illuminate\Support\Facades\Auth;
use App\User;
use App\Team;
use App\TeamPlayer;
use App\TeamFan;
use App\Notification;
use App\Fan;

class UserController extends Controller
{

    //for ajax requests from App.vue
    //returns logged in user data
    public function getUserData()
    {
        $user = Auth::user();

        //User model by default hides emails
        $user->mail = Auth::user()->email;
        $teams = $user->teams();

        return [
            'auth'  => $user,
            'teams' => $teams,
        ];

    }

    //for clearing notifications when a Team page is visited this user belongs to
    public function clearNotifications($id)
    {
        Notification::where('user_id', Auth::user()->id)->where('creator_id', $id)->delete();
    }



}
