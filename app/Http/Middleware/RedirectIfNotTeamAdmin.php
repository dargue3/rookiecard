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
        $repo = App::make(UserRepository::class);

        // for routes.php readability, $request->teamname is an instance of App\Team
        if (! $repo->isTeamAdmin($request->teamname->id)) {
            //user isn't admin of that team, abort
            abort(403, 'You must be a Team Admin to perform this action.');       
        }

        return $next($request);
    }
}
