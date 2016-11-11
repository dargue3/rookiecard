<?php
namespace App\Http\Controllers;

use App\Http\Requests;
use Illuminate\Http\Request;
use App\RC\User\UserRepository;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;

class UserController extends Controller
{

    /**
     * An instance of a user repository
     * 
     * @var UserRepository
     */
    protected $user;
        
    public function __construct(UserRepository $user)
    {
        $this->user = $user;
    }


    /**
     * Return the logged-in user's data
     * 
     * @return array
     */
    public function auth(Request $request, $id)
    {
        return [
            'ok'    => true,
            'user'  => $this->user->data($id),
            'teams' => $this->user->teams($id)
        ];
    }


    /**
     * Save the user's locale and timezone variables
     * @param  Request $request 
     * @return Illuminate\Http\Response
     */
    public function locale(Request $request)
    {
        if ($request->has('timezone')) {
            session(['timezone' => $request->get('timezone')]);
        }
        if ($request->has('locale')) {
            session(['locale' => $request->get('locale')]);
        }

        dd(session(['timezone']));
    }



    /**
     * Return the data associated with a given username
     * 
     * @param string $username 
     * @return array
     */
    public function data($username)
    {
        return [
            'ok'    => true,
            'user'  => $this->user->data($username),
            'teams' => $this->user->teams($username)
        ];
    }


}
