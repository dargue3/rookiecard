<?php

namespace App\Listeners;

use App\RC\Team\TeamRepository;
use App\Events\Contracts\NotifiesUsers;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Contracts\Queue\ShouldQueue;
use App\RC\Notification\NotificationRepository;

class NotifyUsers
{
    /**
     * An instance of a team repository
     * 
     * @var TeamRepository
     */
    protected $team;


    /**
     * An instance of a notification repository
     * 
     * @var NotificationRepository
     */
    protected $notification;


    /**
     * Create the event listener.
     *
     * @return void
     */
    public function __construct(NotificationRepository $notification, 
                                TeamRepository $team)
    {
        $this->team = $team;
        $this->notification = $notification;
    }

    /**
     * Handle the event.
     *
     * @param  NotifiesUsers  $event
     * @return void
     */
    public function handle(NotifiesUsers $event)
    {
        $this->notification->send($event->owner(), $event->users($this->team), $event->type(), $event->data());
    }
}
