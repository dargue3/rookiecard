<?php

namespace App\Providers;

use Illuminate\Contracts\Auth\Access\Gate as GateContract;
use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;

use App\Team;
use App\Policies\TeamPolicy;

class AuthServiceProvider extends ServiceProvider
{
 
    protected $policies = [
        Team::class  => TeamPolicy::class,
    ];


    public function boot(GateContract $gate)
    {
        $this->registerPolicies($gate);
    }

}
