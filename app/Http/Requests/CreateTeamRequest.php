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
            'name'                  => 'required|max:50',
            'teamname'              => 'required|unique:rc_teams|alpha_dash|max:18|not_in:create',
            'gender'                => 'required|in:male,female,coed',
            'sport'                 => 'required|in:basketball',
            'slogan'                => 'max:50',
            'homefield'             => 'max:50',
            'city'                  => 'required|max:100',
            'lat'                   => 'required|numeric',
            'long'                  => 'required|numeric',
            'timezone'              => 'required|timezone',
            'userIsA'               => 'required|in:player,coach,fan',
            'players'               => 'array',
            'coaches'               => 'array',
            'players.*.firstname'   => 'required_with:players|max:50',
            'players.*.lastname'    => 'required_with:players|max:50',
            'players.*.email'       => 'email',
            'coaches.*.firstname'   => 'required_with:coaches|max:50',
            'coaches.*.lastname'    => 'required_with:coaches|max:50',
            'coaches.*.email'       => 'email',
            'userStats'             => 'array',
            'rcStats'               => 'array',
        ];
    }
}
