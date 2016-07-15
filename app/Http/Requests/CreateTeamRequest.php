<?php

namespace App\Http\Requests;

use App\Http\Requests\Request;

class CreateTeamRequest extends Request
{
    
    //anyone is allowed to send one of these requests
    public function authorize()
    {
        return true;
    }

    
    //define the rules applied to the inputs 
    public function rules()
    {
        return [
            'name'              => 'required|max:50',
            'teamname'          => 'required|unique:rc_teams|alpha_num|max:18|not_in:create',
            'gender'            => 'required|in:male,female,coed',
            'sport'             => 'required|in:basketball',
            'slogan'            => 'max:50',
            'homefield'         => 'max:50',
            'city'              => 'required|max:100',
            'lat'               => 'required|numeric',
            'long'              => 'required|numeric',
            'userIsA'           => 'required|in:player,coach,fan',
            'players'           => 'required|array',
            'coaches'           => 'required|array',
            'players.*.name'    => 'required|max:50',
            'players.*.email'   => 'email',
            'coaches.*.name'    => 'required|max:50',
            'coaches.*.email'   => 'email',
            'userStats'         => 'array',
            'rcStats'           => 'array',
        ];
    }
}
