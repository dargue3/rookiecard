<?php
namespace App\Listeners;

use App\RC\Team\TeamRepository;
use App\RC\NewsFeed\NewsFeedRepository;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Contracts\Queue\ShouldQueue;
use App\Events\Contracts\CreatesNewsFeedEntries;

class CreateNewsFeedEntry
{
    /**
     * An instance of a news feed repository
     * 
     * @var NewsFeedRepository
     */
    protected $feed;


    /**
     * Create the event listener.
     *
     * @return void
     */
    public function __construct(NewsFeedRepository $feed)
    {
        $this->feed = $feed;
    }

    /**
     * Add an entry to the given owners' feeds
     *
     * @param  CreatesNewsFeedEntry  $event
     * @return void
     */
    public function handle(CreatesNewsFeedEntries $event)
    {
        $this->feed->add($event->owner(), $event->type(), $event->data());
    }
}
