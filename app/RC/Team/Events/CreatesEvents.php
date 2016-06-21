<?php
namespace App\RC\Team\Events;

use App\Team;
use App\Event;
use App\NewsFeed;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class CreatesEvents
{
	private $team;
	private $title;
	private $type;
	private $startDate;
	private $endDate;
	private $details;
	private $tz;
	private $repeats;
	private $days;
	private $stopDate;

	public function __construct(Request $request, Team $team)
	{
		$this->team = $team;

		// store the variables that will be needed
		$this->title      = $request->title;
        $this->type       = intval($request->type);
        $this->details    = $request->details;
        $this->tz         = $request->session()->get('timezone');

        if ($request->has('repeats')) {
            // this is a repeating event and has some extra details included
            $this->repeats  = $request->repeats;
            $this->days     = $request->repeatDays;
            $this->stopDate = Carbon::createFromTimestamp($request->until, $tz);
        }
        else {
            $this->repeats  = false;
            $this->days     = [];
            $this->stopDate = null;
        }

        // create carbon instances in user's timezone
        $this->startDate  = Carbon::createFromTimestamp($request->start, $tz);
        $this->endDate    = Carbon::createFromTimestamp($request->end, $tz);

	}


	/**
	 * Kicks off the create event process
	 * 
	 * @return NewsFeed
	 */
    public function create()
    {
    	if ($this->team->hasCreatedTooManyEvents()) {
    		throw new ApiException("Your team has already created too many events");
    	}   

        if($this->repeats) {
        	$meta = $this->thisEventRepeats();
        }

        else {
            $meta = $this->theresJustOne();     
        }

        // add this event to the news feed
        return (new NewsFeed)->newTeamEvents($this->team, $meta);
    }


    /**
     * Creates an event given the start and end timestamps
     * 
     * @param  int $start
     * @param  int $end  
     * @return Event       
     */
    public function createEvent($start, $end)
    {
        $event = new Event;

        $event->title       = $this->title;
        $event->type        = $this->type;
        $event->start       = $start;
        $event->end         = $end;
        $event->owner_id    = $this->team->id;
        $event->creator_id  = Auth::user()->id;
        $event->details     = $this->details;

        $event->save();

        return $event;
    }


    /**
     * Create just one event
     * 
     * @return array The meta data that will be inserted into the news feed
     */
    public function theresJustOne()
    {
        $event = $this->createEvent(
            $this->startDate->timezone('UTC')->timestamp,
            $this->endDate->timezone('UTC')->timestamp,
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
    	$startHour      = $this->startDate->hour;
        $startMinutes   = $this->startDate->minute;
        $lapse          = $this->endDate->diffInMinutes($this->startDate);

        // will use this in the news feed meta data later
        $repeatDaysForStatus = '';

        // reassign integer values to the days of the week repeated
        foreach ($this->days as $day) {
            switch ($day) {
                case 'Sunday':
                    $tempRepeatDays[] = Carbon::SUNDAY;
                    $dayNames[] = $day;
                    $repeatDaysForStatus .= ",Su";
                    break;
                case 'Monday':
                    $tempRepeatDays[] = Carbon::MONDAY;
                    $dayNames[] = $day;
                    $repeatDaysForStatus .= ",M";
                    break;
                case 'Tuesday':
                    $tempRepeatDays[] = Carbon::TUESDAY;
                    $dayNames[] = $day;
                    $repeatDaysForStatus .= ",T";
                    break;
                case 'Wednesday':
                    $tempRepeatDays[] = Carbon::WEDNESDAY;
                    $dayNames[] = $day;
                    $repeatDaysForStatus .= ",W";
                    break;
                case 'Thursday':
                    $tempRepeatDays[] = Carbon::THURSDAY;
                    $dayNames[] = $day;
                    $repeatDaysForStatus .= ",R";
                    break;
                case 'Friday':
                    $tempRepeatDays[] = Carbon::FRIDAY;
                    $dayNames[] = $day;
                    $repeatDaysForStatus .= ",F";
                    break;
                case 'Saturday':
                    $tempRepeatDays[] = Carbon::SATURDAY;
                    $dayNames[] = $day;
                    $repeatDaysForStatus .= ",S";
                    break;
            }
        }
        // chop off leading comma
        $repeatDaysForStatus = substr($repeatDaysForStatus, 1);

        /**
         * The code below reorders the days of the week which are repeated.
         * The repeatDays always uses the same order: Sunday, Monday, etc.
         * Because the code does Carbon('this _____') to push the iteration forward,
         * you need to order the days of the week starting at the startDay of week.
         *
         * Example: if your repeat data from POST looks like every M T W F, and your first event is
         * on Wednesday, you'll want to first call Carbon('this Wednesday'), followed by Friday,
         * Monday, then Tuesday. Otherwise you'd go from Wednesday then start fresh with Monday and skip
         * Friday altogether.
         */

        $dayOfWeek = $this->startDate->dayOfWeek;

        // find days which are >= today
        for ($x = 0; $x < count($tempRepeatDays); $x++) {
            if ($tempRepeatDays[$x] >= $dayOfWeek) {
                $repeatDays[] = $dayNames[$x];
            }
        }
        // find days < today
        for ($x = 0; $x < count($tempRepeatDays); $x++) {
            if ($tempRepeatDays[$x] < $dayOfWeek) {
                $repeatDays[] = $dayNames[$x];
            }
        }


        
        // if the event starts on a day of the week that isn't in the repeating sequence,
        // make sure that first event gets created also.
        // Example: if your repeating days were W F and the start date was on Monday,
        // the first Carbon('this Wednesday') would completely skip that first  Monday event
        $createFirstEvent = false;
        if (!in_array($dayOfWeek, $tempRepeatDays)) {
            $createFirstEvent = true;
        }

        $today = $this->startDate;

        // continuously loop through the repeatDays adding events for each one
        // think of each iteration of the first loop as being a week
        // goes until a break triggers or $count exceeds its limit
        for ($count = 0; $count < 250; $count++) {

            // think of each iteration of this loop being a day in the week which has an event
            for ($x = 0; $x < count($this->repeatDays); $x++) {

                // make new definition of 'today' every loop
                Carbon::setTestNow($today);

                if ($createFirstEvent) {
                    // include this first event but next loop move on with the 'next Monday' logic
                    $x = -1; // reset the loop counter back to the beginning
                    $createFirstEvent = false;
                }

                // below code checks how to move the the date forward based on which days of the week the event repeats

                else if (count($this->repeatDays) > 1) { 
                    // e.g. if it repeats W F, you'd say 'this Wednesday', 'this Friday', 'this Wednesday', etc.
                    $today = new Carbon('this ' . $this->repeatDays[$x], $tz);
                }

                else if ($count == 0) {
                    // e.g. if this is the first event and the event is on a Monday, start with 'this Monday'
                    $today = new Carbon('this ' . $this->repeatDays[$x], $tz);
                }

                else {
                    // e.g. if it only repeats on Monday, you always say 'next Monday' to move the iteration
                    $today = new Carbon('next ' . $this->repeatDays[$x], $tz);
                }


                //check if we're done


                // is today past the stop day? we're done, don't create this event
                if ($today->startOfDay() > $this->stopDate->startOfDay()) {
                    break 2;
                }

                // is today the last day it repeats? then add this and quit
                if ($today->isSameDay($this->stopDate)) {
                    $done = true;
                }

                // reset carbon's definition of 'now', create method uses it
                Carbon::setTestNow();

                $event = $this->createEvent(
                    $today->addHours($startHour)->addMinutes($startMinutes)->timezone('UTC')->timestamp,
                    $today->addMinutes($lapse)->timestamp
                );

                if ($count == 0) {
                    // save first event for news feed meta data
                    $firstEvent = $event;
                }
                else {
                    // store last event for news feed meta data
                    $lastEvent = $event;
                }

                // reset today back to midnight
                $today->subHours($startHour)->subMinutes($startMinutes + $lapse)->timezone($tz);

                if ($done) {
                    break 2;
                }
            }
        }

        // reset carbon's definition of 'now', create method uses it
        Carbon::setTestNow();

        $repeatsString = "$firstEvent->start:$lastEvent->start:$repeatDaysForStatus";

        return ['event' => $firstEvent, 'repeats' => $repeatsString];
    }


    
}