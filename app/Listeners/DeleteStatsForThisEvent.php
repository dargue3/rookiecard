<?php

namespace App\Listeners;

use App\RC\Stat\StatRepository;
use App\Events\TeamDeletedAnEvent;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Contracts\Queue\ShouldQueue;

class DeleteStatsForThisEvent
{
    /**
     * An instance of a stat repository
     * 
     * @var StatRepository
     */
    protected $stat;


    /**
     * Create the event listener.
     *
     * @return void
     */
    public function __construct(StatRepository $stat)
    {
        $this->stat = $stat;
    }

    /**
     * Handle the event.
     *
     * @param  TeamDeletedAnEvent  $event
     * @return void
     */
    public function handle(TeamDeletedAnEvent $event)
    {
        $this->stat->deleteByEvent($event->team_id, $event->event->id);
    }
}
