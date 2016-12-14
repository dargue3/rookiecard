<?php

namespace App\Http\Middleware;

use Closure;

class MustBeRookiecardDev
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
        if ($request->user()->id != 1) {
            abort(403, 'You are not authorized');       
        }

        return $next($request);
    }
}
