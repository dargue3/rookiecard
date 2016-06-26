<?php
namespace App\RC\Events;

use App\Team;
use App\NewsFeed;
use Carbon\Carbon;
use Illuminate\Http\Request;
use App\Exceptions\ApiException;
use App\RC\NewsFeed\NewsFeedRepository;
use Illuminate\Support\Facades\Auth;

class HandlesEventLogic
{
    /**
     * Given data about this event, made public for testability
     * @var mixed
     */
	public $team;
	public $title;
	public $type;
	public $start;
	public $end;
	public $details;
	public $tz;
	public $repeats = false;
	public $days;
	public $until;

    /**
     * Event repository instance
     * 
     * @var EventRepository
     */
    protected $event;

    /**
     * NewsFeed repository instance
     * @var NewsFeedRepository
     */
    protected $feed;

    /**
     * The maximum number of events you can create at once
     * 
     * @var integer
     */
    protected $maximumEvents = 500;


	public function __construct(array $data,
                                Team $team, 
                                EventRepository $event, 
                                NewsFeedRepository $feed)
	{
        $this->event = $event;
        $this->feed = $feed ?: new NewsFeed;

        $data = $this->transformData($data);

        // save all of the event data as attributes for easier access later
		$this->team         = $team;
        $this->title        = $data['title'];
        $this->type         = $data['type'];
        $this->start        = Carbon::createFromTimestamp($data['start'], $data['tz']);
        $this->end          = Carbon::createFromTimestamp($data['end'], $data['tz']);
        $this->details      = $data['details'];
        $this->tz           = $data['tz'];
        $this->repeats      = $data['repeats'];

        if ($this->repeats) {
            $this->days         = $data['days'];
            $this->until        = Carbon::createFromTimestamp($data['until'], $data['tz']);
        }

        $this->makeSureTheDatesAreReasonable();
	}


    /**
     * Massage the data a bit
     * 
     * @param  NewEventRequest $request 
     * @return array
     */
    public function transformData(array $data)
    {
        $data['type'] = intval($data['type']);

        if (! isset($data['repeats'])) {
            $data['repeats'] = false;
            $data['days'] = [];
            $data['until'] = null;
        }

        return $data;
    }


    /**
     * Ensure that the given dates seem real enough to continue
     * 
     * @return void       
     */
    public function makeSureTheDatesAreReasonable()
    {
        if (! is_a($this->start, Carbon::class) or ! is_a($this->end, Carbon::class)) {
            throw new ApiException("The given dates were invalid, try re-entering them");
        }

        if ($this->start >= $this->end) {
            throw new ApiException("The event ends before it starts!");
        }

        if ($this->start->year < 1900 or $this->end->year < 1900) {
            throw new ApiException("You weren't even born yet! Pick a more recent date");
        }

        if ($this->start->year > 2100 or $this->end->year > 2100) {
            throw new ApiException("There's being prepared, then there's you. Pick a more recent date");
        }

        if ($this->end->diffInDays($this->start) > 30) {
            throw new ApiException("This event lasts over a month. Break it up a little");
        }

        if ($this->repeats) {
            if ($this->until <= $this->end) {
                throw new ApiException("The event stops repeating before it starts!");
            }

            if (! is_a($this->until, Carbon::class)) {
                throw new ApiException("The given dates were invalid, try re-entering them");
            }

            $this->estimateTheNumberOfEvents();
        }

    }

    /**
     * Use some approximations to see if this request creates too many events at once
     * 
     * @return void
     */
    public function estimateTheNumberOfEvents()
    {
        $estimate = $this->until->diffInWeeks($this->start) * count($this->days);

        if ($estimate > 250) {
            throw new ApiException("We limit you to 250 repeating events per request");
        }
    }


	/**
	 * Kicks off the create event process
	 * 
	 * @return NewsFeed
	 */
    public function create()
    {
    	if ($this->event->teamHasCreatedTooManyEvents($this->team)) {
    		throw new ApiException("Your team has already created too many events");
    	}   

        if($this->repeats) {
        	$meta = $this->thisEventRepeats();
        }

        else {
            $meta = $this->theresJustOne();     
        }

        return $this->createNewsFeedEntry($meta);
    }


    /**
     * Creates an event given the start and end timestamps
     * 
     * @param  int $start A timestamp
     * @param  int $end A timestamp 
     * @return Event       
     */
    public function createEvent($start, $end)
    {
        return $this->event->create([
            'title'       => $this->title,
            'type'        => $this->type,
            'start'       => $start,
            'end'         => $end,
            'owner_id'    => $this->team->id,
            'creator_id'  => Auth::user()->id,
            'details'     => $this->details,
        ]);
    }


    /**
     * Creates a news feed entry given some meta data
     * 
     * @param  array $meta
     * @return int     
     */
    public function createNewsFeedEntry($meta)
    {
        return $this->feed->newTeamEvents($this->team, $meta);
    }


    /**
     * Create just one event
     * 
     * @return array The meta data that will be inserted into the news feed
     */
    public function theresJustOne()
    {
        $event = $this->createEvent(
            $this->start->timezone('UTC')->timestamp,
            $this->end->timezone('UTC')->timestamp
        );

        return ['event' => $event];
    }


    /**
     * Handles the logic of repeating events
     * 
     * @return array The meta data that will be inserted into the news feed
     */
    private function thisEventRepeats()
    {
        $hour = $this->start->hour;
        $minute = $this->start->minute;
        $lapse = $this->end->diffInMinutes($this->start);
        $today = Carbon::instance($this->start);


        // create the first event
        $firstEvent = $this->createEvent(
            $today->hour($hour)->minute($minute)->timezone('UTC')->timestamp,
            $today->addMinutes($lapse)->timestamp
        );

        $done = false;
        $count = 1;

        // goes until past the stop date or $count exceeds its limit
        while ($count < $this->maximumEvents) {

            // undo the changes from last iteration
            $today->timezone($this->tz)->startOfDay();

            $today = $this->setToNextRepeatingDay($today);

            // already past the last repeating day, quit
            if ($today > $this->until->startOfDay()) {
                break;
            }

            $event = $this->createEvent(
                $today->hour($hour)->minute($minute)->timezone('UTC')->timestamp,
                $today->addMinutes($lapse)->timestamp
            );

            $count++;
        }

        return ['event' => $firstEvent, 'repeats' => true, 'count' => $count];
    }

    /**
     * Set given Carbon instance to the next day this event repeats on
     * 
     * @param Carbon $today
     * @return Carbon
     */
    public function setToNextRepeatingDay(Carbon $today)
    {
        // have Carbon perform these calculations relative to the start date
        Carbon::setTestNow($today);

        $differences = $this->calculateDifferencesFromToday($today);

        if (empty($differences)) {
            // it must only repeat once per week (which is the same day of the week as $today)
            $increment = 7;   
        }
        else {
            // take the smallest difference in days, that will always give us the next repeating day
            $increment = min($differences);
        }

        // set back to normal behavior
        Carbon::setTestNow();

        return $today->addDays($increment);
    }


    /**
     * Calculates an array of number of days between given and next repeating day
     * 
     * @param  Carbon $today
     * @return array      
     */
    public function calculateDifferencesFromToday(Carbon $today)
    {
        $differences = [];

        // loop through the array of repeating days calculating the difference between $today and that day
        foreach ($this->days as $day) {
            $difference = $today->diffInDays(Carbon::parse('this ' . $day));
            if ($difference > 0) {
                // only include days of week that aren't $today->dayOfWeek
                $differences[] = $difference;
            }
        }

        return $differences;
    }


    
}