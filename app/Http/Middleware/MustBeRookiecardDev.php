<?php

namespace App\Http\Middleware;

use Closure;

class MustBeRookiecardDev
{
    /**
     * Block all requests unless made by a Rookiecard developer
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @return mixed
     */
    public function handle($request, Closure $next)
    {
        if (! $request->user()->isDan()) {
            abort(403, 'You are not authorized');       
        }

        return $next($request);
    }
}
