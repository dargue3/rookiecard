<?php

namespace App\Http\Middleware;

use App;
use Closure;
use App\RC\User\UserRepository;

class RedirectIfNotTeamAdmin
{

    //checks if user is an admin of the team page before allowing them to edit
    //redirects user to team's page with error message if not admin
    public function handle($request, Closure $next)
    {
        $user = App::make(UserRepository::class);

        if (! $user->isTeamAdmin($request->teamname->id, $request->user()->id)) {
            abort(403, 'You must be a Team Admin to perform this action.');       
        }

        return $next($request);
    }
}
