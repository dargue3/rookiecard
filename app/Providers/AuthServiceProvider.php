<?php

namespace App\Providers;

use Laravel\Passport\Passport;
use Illuminate\Support\Facades\Gate;
use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;

use App\Team;
use App\Policies\TeamPolicy;

class AuthServiceProvider extends ServiceProvider
{
 
    protected $policies = [
        Team::class  => TeamPolicy::class,
    ];


    public function boot()
    {
        $this->registerPolicies();

        Passport::routes();
    }

}
