<?php

namespace App\Http\Middleware;

use Closure;

class RedirectIfNotOwner
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @return mixed
     */
    public function handle($request, Closure $next)
    {
        $username = $request->username;

        if(! $request->user()->isProfileOwner($username)) {
            //user isn't owner, redirect
            return redirect("/$username")->with('bad', 'You are not authorized to view that page');
        }
        return $next($request);
    }
}
