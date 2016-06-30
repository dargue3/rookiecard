<?php
namespace App\RC\Event;

use Carbon\Carbon;
use Illuminate\Http\Request;
use App\Exceptions\ApiException;
use Illuminate\Support\Facades\Auth;
use App\RC\NewsFeed\NewsFeedRepository;

class HandlesEventLogic
{
    /**
     * @var string
     */
	public $title;

    /**
     * @var int
     */
	public $type;

    /**
     * @var Carbon
     */
	public $start;

    /**
     * @var Carbon
     */
	public $end;

    /**
     * @var string
     */
	public $details;

    /**
     * The logged-in user's timezone
     * 
     * @var string
     */
	public $tz;

    /**
     * @var boolean
     */
	public $repeats = false;

    /**
     * Array of days that the event repeats on, like: ['Monday', 'Wednesday']
     * 
     * @var array
     */
	public $days;

    /**
     * @var Carbon
     */
	public $until;

    /**
     * The id of the team that is creating this event
     * 
     * @var int
     */
    public $team_id;

    /**
     * Event repository instance
     * 
     * @var EventRepository
     */
    protected $event;

    /**
     * The maximum number of events user can create at once
     * 
     * @var integer
     */
    protected $limitPerRequest;


	public function __construct(array $data, $team_id, EventRepository $event)
	{
        $this->event = $event;
		$this->team_id = $team_id;

        $this->limitPerRequest = config('rookiecard.events.limitPerRequest');

        // save all of the event data as attributes for easier access later
        $this->title        = $data['title'];
        $this->type         = $data['type'];
        $this->tz           = $data['tz'];
        $this->start        = Carbon::createFromTimestamp($data['start'], $this->tz);
        $this->end          = Carbon::createFromTimestamp($data['end'], $this->tz);
        $this->details      = $data['details'];

        if (isset($data['repeats'])) {
            $this->repeats = true;
            $this->days = $data['days'];
            $this->until = Carbon::createFromTimestamp($data['until'], $this->tz)->startOfDay();
        }

        $this->makeSureTheDatesAreReasonable();
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
     * Use some approximations to see if this request will create too many events at once
     * 
     * @return void
     */
    public function estimateTheNumberOfEvents()
    {
        $estimate = $this->until->diffInWeeks($this->start) * count($this->days);

        if ($estimate > $this->limitPerRequest) {
            throw new ApiException("We limit you to $this->limitPerRequest repeating events per request");
        }
    }


	/**
	 * Kicks off the create event process
	 * 
	 * @return NewsFeed
	 */
    public function create()
    {
    	if ($this->event->teamHasCreatedTooManyEvents($this->team_id)) {
    		throw new ApiException("Your team has already created too many events");
    	}   

        if($this->repeats) {
        	return $this->thisEventRepeats();
        }

    
        return $this->theresJustOne();     
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
            'owner_id'    => $this->team_id,
            'creator_id'  => Auth::user()->id,
            'details'     => $this->details,
        ]);
    }


    // /**
    //  * Creates a news feed entry given some meta data
    //  * 
    //  * @param  array $meta
    //  * @return int     
    //  */
    // public function createNewsFeedEntry($meta)
    // {
    //     return $this->feed->teamCreatedAnEvent($this->team, $meta);
    // }


    /**
     * Create just one event
     * 
     * @return array
     */
    public function theresJustOne()
    {
        $event = $this->createEvent(
            $this->start->timezone('UTC')->timestamp,
            $this->end->timezone('UTC')->timestamp
        );

        return array($event);
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
        $events[] = $this->createEvent(
            $today->hour($hour)->minute($minute)->timezone('UTC')->timestamp,
            $today->addMinutes($lapse)->timestamp
        );

        $done = false;
        $count = 1;

        // goes until past the stop date or $count exceeds its limit
        while ($count < $this->limitPerRequest) {

            // undo the changes from last iteration
            $today->timezone($this->tz)->startOfDay();

            $today = $this->setToNextRepeatingDay($today);

            // already past the last repeating day, quit
            if ($today > $this->until) {
                break;
            }

            $events[] = $this->createEvent(
                $today->hour($hour)->minute($minute)->timezone('UTC')->timestamp,
                $today->addMinutes($lapse)->timestamp
            );

            $count++;
        }

        return $events;
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
     * Calculates an array of number of days between $today and next repeating day
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