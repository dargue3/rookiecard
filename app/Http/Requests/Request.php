<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\Validator;

abstract class Request extends FormRequest
{
    

  //override errors function to return data formatted for Vue consumption
  //triggers when validation fails on a CreateTeamRequest, etc.
	protected function formatErrors(Validator $validator) {

		return ['ok' => false, 'error' => $validator->errors()];
	
	}


}
