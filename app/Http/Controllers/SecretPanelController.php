<?php

namespace App\Http\Controllers;

use Auth;
use App\User;
use App\Team;
use App\Event;
use App\Stat;
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
     * Fetch all the fun RC statistics and stuff
     * 
     * @return Illuminate\Http\Response
     */
    public function get()
    {
        return [
            'ok' => true,
            'feedback' => Feedback::all(),
            'counts' => [
                'users'     => User::count(),
                'teams'     => Team::count(),
                'events'    => Event::count(),
                'stats'     => Stat::count(),
            ],
        ];
    }


    /**
     * A new alpha tester is being added
     * 
     * @param  Request $request
     * @return Illuminate\Http\Response
     */
    public function newTester(Request $request)
    {
    	AlphaTester::create($request->email);

    	return ['ok' => true];
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
    public function deleteDoneFeedback()
    {
    	Feedback::finished()->delete();

    	return ['ok' => true, 'feedback' => Feedback::all()];
    }
}
