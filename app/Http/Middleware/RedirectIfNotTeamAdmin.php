<?php

namespace App\Http\Middleware;

use Closure;
use App\App;

class RedirectIfNotTeamAdmin
{

    //checks if user is an admin of the team page before allowing them to edit
    //redirects user to team's page with error message if not admin
    public function handle($request, Closure $next)
    {
        if (! $request->user()->isTeamAdmin($request->teamname)) {
            //user isn't admin of that team, abort
            abort(403, 'You must be a Team Admin to perform this action.');       
        }

        return $next($request);
    }
}
