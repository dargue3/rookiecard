<?php
namespace App\Http\Controllers;

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

}






























