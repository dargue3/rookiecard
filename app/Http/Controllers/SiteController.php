<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Input;
use Illuminate\Support\Facades\URL;

use App\Http\Requests;
use App\Http\Controllers\Controller;
use App\User;

class SiteController extends Controller
{

    //website root is for logged in users only
    public function __construct() {

        $this->middleware('auth');

    }


    //send users to root directory, Vue takes over from there
    public function  home(Request $request) {

        return view('main');

    }


    //when someone has made a search from the navbar
    public function  getSearch() {

        //first trim white spaces
        Input::merge(array_map('trim', Input::all()));

        //split up by spaces, query each word
        $fullQuery = Input::get('q');
        $queries = explode(" ", $fullQuery);




        $results  = [];
        $allUsers = [];


        //if there was query data, loop through each word and match results
        foreach($queries as $query) {

            //continue if the query is a blank space (otherwise would return all users)
            if($query == "") continue;

            $firstnames = User::searchByFirstName($query)->get();
            $lastnames  = User::searchByLastName ($query)->get();
            $usernames  = User::searchByUsername ($query)->get();

            $results[] = $firstnames->merge($lastnames)->merge($usernames);
        }

        //merge all results into one array
        foreach($results as $user) {
            $allUsers = $user->merge($allUsers);
        }

        return view('site/search', compact(
            'allUsers',
            'fullQuery'
        ));

    }
}






























