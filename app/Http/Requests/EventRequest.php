<?php

namespace App\Http\Requests;

use App\Http\Requests\Request;

class EventRequest extends Request
{

    // middleware already ensures a team admin is sending this
    public function authorize()
    {
        return true;
    }

    
    // define the rules applied to the inputs 
    public function rules()
    {
        return [
            'title'        => 'required|max:50',
            'type'         => 'required|string|in:practice,home_game,away_game,other',
            'start'        => 'required|integer',
            'end'          => 'required|integer',
            'details'      => 'max:5000',
            'repeats'      => 'boolean',
            'days'         => 'required_with:repeats|array',
            'days.*'       => 'required_with:repeats|in:Monday,Tuesday,Wednesday,Thursday,Friday,Saturday,Sunday',
            'until'        => 'required_with:repeats|integer',
        ];
    }
}
