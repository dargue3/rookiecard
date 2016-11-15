<?php

namespace App\Http\Requests;

use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Foundation\Http\FormRequest;

class UpdateTeamRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     *
     * @return bool
     */
    public function authorize()
    {
        return true; 
    }


    /**
     * Get the validation rules that apply to the request.
     *
     * @return array
     */
    public function rules(Request $request)
    {
        return [
            'teamURL'   => [
                'required',
                'max:18',
                'alpha_dash',
                'not_in:create',
                Rule::unique('rc_teams', 'teamname')->ignore($request->teamname->id),
            ],
            'name'      => 'required|max:50',
            'slogan'    => 'max:50',
            'homefield' => 'max:50',
            'city'      => 'required|max:100',
            'lat'       => 'required|numeric',
            'long'      => 'required|numeric',
            'timezone'  => 'required|timezone',
            'pic'       => 'required',
            'backdrop'  => 'required',
        ];
    }
}
