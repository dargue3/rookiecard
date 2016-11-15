<?php

namespace App\Http\Middleware;

use App;
use Closure;
use App\RC\User\UserRepository;

class MustBeTeamAdmin
{
    /**
     * User must be an admin of the team given in the URL
     * Returns a '403 Forbidden' if they are not an admin
     */
    public function handle($request, Closure $next)
    {
        $user = App::make(UserRepository::class);

        if (! $user->isTeamAdmin($request->teamname->id, $request->user()->id)) {
            abort(403, 'You must be a Team Admin to perform this action.');       
        }

        return $next($request);
    }
}
