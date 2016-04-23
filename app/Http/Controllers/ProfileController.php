<?php

namespace App\Http\Controllers;

use App\Images\Image;
use Illuminate\Http\Request;

use App\Http\Requests;
use App\Http\Controllers\Controller;
use App\User as User;
use App\Team;
use App\TeamPlayer;
use App\TeamFan;
use App\Notification;
use App\Fan;
use Illuminate\Support\Facades\Auth;
use App\Metrics\FormatMetrics;
use App\Metric;
use App\UserMeta;
use Carbon\Carbon;




class ProfileController extends Controller
{



    //set this controller as "for logged in users only"
    public function __construct() {

        $this->middleware('auth');

    }

    //for ajax requests from App.vue
    //returns logged in user data
    public function getUserData() {

        $user = User::findOrFail(Auth::user()->id);

        //find the teams this player is on
        $playersTeams = TeamPlayer::where('player_id', $user->id)->get();
        $fansTeams = TeamFan::where('fan_id', $user->id)->get();
        
        $memberOf = [];
        $fanOf = [];

        //loop through results, save necessary data
        for($x = 0; $x < count($playersTeams); $x++) {
            $thisTeam = Team::find($playersTeams[$x]->team_id);

            //find notifications for teams this player is a member of
            $count = Notification::where('user_id', $user->id)->where('creator_id', $playersTeams[$x]->team_id)
                                    ->where('type', 'LIKE', 'team%')->count();

            $memberOf[$x]['count'] = $count ? $count : '';
            $memberOf[$x]['teamname'] = $thisTeam->teamname;
            $memberOf[$x]['name'] = $thisTeam->name;
        }

        //find notifications for teams this player is a fan of
        for($x = 0; $x < count($fansTeams); $x++) {
            $thisTeam = Team::find($fansTeams[$x]->team_id);
            $count = Notification::where('user_id', $user->id)->where('creator_id', $fansTeams[$x]->team_id)
                                    ->where('type', 'LIKE', 'team%')->count();

            $fanOf[$x]['count'] = $count ? $count : '';
            $fanOf[$x]['teamname'] = $thisTeam->teamname;
            $fanOf[$x]['name'] = $thisTeam->name;
        }
        //convert user model to array, drops password and cookie data
        $user = $user->toArray();

        //respond to request with JSON
        echo json_encode(array($user, $memberOf, $fanOf));
    }


    //get user's data, send to profile view
    public function getProfile($username) {

        //gather profile owner's info, and logged in user's info
        $user = User::where('username', $username)->firstOrFail();
        $loggedUserID = Auth::user()->id;

        //for metrics foreach loop
        $counter = 0;

        $age = Carbon::parse($user->birthday)->age;



        //check if logged in user == profile owner
        if ($loggedUserID == $user->id)
            $owner = TRUE;
        else {
            $owner = FALSE;
            $isFan = $user->isFan($loggedUserID);
        }

        //gather profile data
        $userOptions    = $user->metas();
        $userMetrics    = $user->metrics();
        $userFans       = $user->fans();


        if(!array_key_exists('proPic', $userOptions))
            $userOptions['proPic'] = 'images/proPic_default.jpeg';




        return view('profile/profile', compact(
            'user',
            'userOptions',
            'userMetrics',
            'counter',
            'owner',
            'isFan',
            'userFans',
            'age'

        ));

    }


    //user just submitted post form from /edit page
    public function postEditProfile($username) {

        //get user data
        $user = User::where('id', Auth::user()->id)->first();
        $id = $user->id;

        $metric = new Metric;
        $meta   = new UserMeta;
        $image  = new Image;


        if(!empty($_FILES['proPic']['name'])) {
            //found an uploaded picture

            $kaboom = explode('/', $_FILES['proPic']['type']);
            $ext = $kaboom[1];

            $newName =  'images/proPic/proPic_' . $id . "." . $ext;

            $size = $_FILES['proPic']['size'];
            $filepath = $_FILES['proPic']['tmp_name'];

            if($size > 10000000)
                return FALSE;

            //upload picture to images folder
            $result = move_uploaded_file($filepath, $newName);

            if($result == TRUE) {
                //resize and save file
                $image->load($newName)->thumbnail(320, 320)->save();

                //update if exists, otherwise create
                $new = $meta->firstOrNew(['user_id' => $id, 'meta_tag' => 'proPic']);
                $new->meta_value = $newName;
                $new->save();

            }

        }


        //loop through all the data, find which ones are set
        foreach($_POST as $key => $value) {

            switch($key) {
                case 'jersey_num':
                case 'honors':
                    //the ones going to UserMeta class

                    if($value == 'none' || empty($value))
                    //no value selected, toss the data
                        break;

                    //update if exists, otherwise create
                    $new = $meta->firstOrNew(['user_id' => $id, 'meta_tag' => $key]);
                    $new->meta_value = $value;
                    $new->save();

                    break;

                case 'metricsSelect':
                    //the ones going to Metric class

                    $metric->where('user_id', $id)->delete();

                    $orderArr = [];

                    foreach($value as $metricTag) {

                        $order = $_POST[$metricTag . 'Order'];

                        $metricValue = $_POST[$metricTag];

                        if ($order == 'none' || in_array($order, $orderArr))
                            //if order isn't set or duplicate $order values, toss the data
                            break;

                        if ($metricValue == 'none' || empty($metricValue))
                            //no value selected, toss the data
                            break;

                        //create new metric with that tag
                        $metric->create(['user_id' => $id, 'metric_tag' => $metricTag, 'metric_value' => $metricValue, 'on_profile' => $order]);
                        $metric->save();
                        $orderArr[] = $order;



                    }

                    break;

            }


        }

        return redirect("/$username")->with('good', 'Your rookiecard was edited successfully');

    }





    //get username, load profile
    public function getEditProfile($username) {

        $user = User::where('username', $username)->firstOrFail();



        //get list of user metrics names
        $format = new FormatMetrics;
        $metricData = $format->metricNames;
        foreach($metricData as $key => $val) {
            $metrics[$key] = $val[0];
        }

        $jerseyNums['none'] = '--';
        $jerseyNums['00']= '00';
        for($x = 0; $x < 100; $x++)
            $jerseyNums[$x] = $x;

        $sports = array(
            'Baseball',
            'Basketball',
            'Soccer',
            'Rugby',
            'Swimming',
            'Running',
            'Field Hockey',
            'Hockey',
            'Football'
            );


        $metricVals = $format->metricVals();


        $order = array('none' => '--', 1 => 1, 2 =>  2, 3 =>  3, 4 =>  4, 5 =>  5,
            6 => 6, 7 =>  7, 8 =>  8, 9 =>  9, 10 =>  10, 11 =>  11, 12 =>  12);





        return view('profile/edit', compact(
            'user',
            'jerseyNums',
            'sports',
            'metrics',
            'metricVals',
            'order'
        ));

    }


    //Auth::user just became a fan of users
    public function becomeFan($username) {

        $player = User::where('username', $username)->firstOrFail();

        Fan::create(['player_id' => $player->id, 'fan_id' => Auth::user()->id]);


        return redirect("/$username")->with('good', "You are now a fan of $player->firstname");

    }



    //Auth::user just became a fan of user
    public function unFan($username) {

        $player = User::where('username', $username)->firstOrFail();

        $where = array('player_id' => $player->id, 'fan_id' => Auth::user()->id);

        Fan::where($where)->delete();


        return redirect("/$username")->with('good', "You are no longer a fan of $player->firstname");

    }




}
