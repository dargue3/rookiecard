<?php

namespace App\Http\Controllers;

use Auth;
use App\AlphaTester;
use Illuminate\Http\Request;

class SecretPanelController extends Controller
{
    /**
     * Check if logged in user is authorized to view the secret panel
     * 
     * @return Illuminate\Http\Response
     */
    public function authorized()
    {
    	return ['ok' => true, 'authorized' => Auth::id() == 1];
    }


    /**
     * A new alpha tester is being added
     * 
     * @param  Request $request
     * @return Illuminate\Http\Response
     */
    public function newTester(Request $request)
    {
    	AlphaTester::create($request->all());

    	return ['ok' => true];
    }
}
