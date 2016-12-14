<?php

namespace App\Http\Controllers;

use Auth;
use App\Feedback;
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


    /**
     * Fetch all feedback that has been submitted so far
     * 
     * @return Illuminate\Http\Response
     */
    public function feedback()
    {
    	return ['ok' => true, 'feedback' => Feedback::all()];
    }


    /**
     * The given feedback item has been marked as 'done'
     * 
     * @param  int $id 
     * @return void 
     */
    public function toggleFeedbackCompletion($id)
    {
    	Feedback::find($id)->toggle();
    }


    /**
     * Delete all of the feedback entries that are marked 'done'
     * 
     * @return Illuminate\Http\Response
     */
    public function clearDone()
    {
    	Feedback::finished()->delete();

    	return ['ok' => true, 'feedback' => Feedback::all()];
    }
}
