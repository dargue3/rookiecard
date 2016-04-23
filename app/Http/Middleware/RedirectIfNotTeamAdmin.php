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
        $teamname = $request->teamname;

        $user = $request->user();

        if(!$request->user()->isTeamAdmin($teamname)) {

            //user isn't admin of that team, abort
            abort(403, 'Unauthorized. If you think this is an error, tell us by going to Options, Submit Feedback.');
        }
        return $next($request);
    }
}
