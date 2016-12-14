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
        // reserved route keywords
        $reserved = implode(',', config('rookiecard.reserved.teamnames'));

        return [
            'teamURL'   => [
                'required',
                'max:18',
                'alpha_dash',
                'not_in:' . $reserved,
                Rule::unique('rc_teams', 'teamname')->ignore($request->teamname->id),
            ],
            'name'      => 'required|max:50',
            'slogan'    => 'max:50',
            'homefield' => 'max:50',
            'city'      => 'required|max:100',
            'lat'       => 'required|numeric',
            'long'      => 'required|numeric',
            'timezone'  => 'required|timezone',
            'statKeys'  => 'required|array',
            'pic.url'           => 'regex:/\/storage\/.+/',
            'backdrop.url'      => 'regex:/\/storage\/.+/',
            'pic.crops'         => 'array|size:4',
            'backdrop.crops'    => 'array|size:4',
            'backdrop.crops.*'  => 'numeric',
            'pic.crops.*'       => 'numeric',
            'onlyMembersCanViewLocation'    => 'required|boolean',
            'onlyMembersCanViewRoster'      => 'required|boolean',
            'onlyMembersCanViewEvents'      => 'required|boolean',
            'membersAreInviteOnly'          => 'required|boolean',
            'fansRequireAcceptance'         => 'required|boolean',
            'notifyOnNewEvent'              => 'required|boolean',
            'notifyOnEditedEvent'           => 'required|boolean',
            'notifyOnDeletedEvent'          => 'required|boolean',
            'notifyOnNewStats'              => 'required|boolean',
            'notifyOnNewMember'             => 'required|boolean',
        ];
    }
}
