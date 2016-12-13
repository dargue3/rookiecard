<?php
namespace App\Http\Controllers;

use Auth;
use App\Feedback;
use Illuminate\Http\Request;

class SiteController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth');
    }


    /**
     * Send to the main.blade where Vue takes over
     * 
     * @param  Request $request 
     */
    public function home(Request $request)
    {
        return view('main')
                ->with('auth', $request->user())
                ->with('timezone', session('timezone'))
                ->with('locale', session('locale'));
    }


    /**
     * User has submitted some feedback about the site
     * 
     * @param  Request $request
     * @return Illuminate\Http\Response 
     */
    public function feedback(Request $request)
    {
        $this->validate($request, [
            'type'      => 'required|in:bug,suggestion,compliment',
            'details'   => 'required|max:5000',
        ]);

        Feedback::create(array_merge($request->all(), ['creator_id' => Auth::id()]));

        return ['ok' => true];
    }

}



