<?php

namespace App\Http\Requests;

use App\Http\Requests\Request;

class NewEventRequest extends Request
{

    //middleware already ensures a team admin is sending this
    public function authorize()
    {
        return true;
    }

    
    //define the rules applied to the inputs 
    public function rules()
    {
        return [
            'title'             => 'required|max:50',
            'type'              => 'required|size:1',
            'start'             => 'required|integer',
            'end'               => 'required|integer',
            'repeats'           => 'boolean',
            'until'             => 'required_with:repeats|integer',
            'repeatDays'        => 'required_with:repeats|array',
            'details'           => 'max:5000',
        ];
    }
}
