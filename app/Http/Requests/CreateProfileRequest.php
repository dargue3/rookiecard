<?php

namespace App\Http\Requests;

use App\Http\Requests\Request;

class CreateProfileRequest extends Request
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
    public function rules()
    {
        return [
            'firstname'              => 'required|alpha_dash|max:25',
            'lastname'               => 'required|alpha_dash|max:30',
            'username'               => 'required|unique:rc_users,username|max:30|
                                         not_in:register,login,logout,team,league,search,
                                         feedback,leaderboard,leaderboards',
            'email'                  => 'required|email|unique:rc_users,email',
            'password'               => 'required|min:8|alphaNum|confirmed',
            'password_confirmation'  => 'required',
            'birthdate'              => 'required|date',
            'gender'                 => 'required|boolean'
        ];
    }
}
