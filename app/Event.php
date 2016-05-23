<?php

namespace App;

use Illuminate\Http\Request;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\Auth;
use Carbon\Carbon;

use App\Stat;
use App\NewsFeed;

class Event extends Model
{
    /**
    * currently supported event types:
    * 0 = practice
    * 1 = home game
    * 2 = away game
    * 3 = other
    * 
    *
    */


    use SoftDeletes;
    
    protected $table = 'rc_events';

    protected $dates = ['deleted_at'];

    protected $guarded = [];




    //get all events for a team, echo to ajax call
    public function getTeamEvents($team) {

        //parse all events related to team, return as json
        return $this->where('owner_id', $team->id)->orderBy('start')->get();

    }

    

    //for finding events in the future in a search
    public function scopeFuture($query) {

        return $query->where('start', '>=', Carbon::now());

    }



    //delete a team event
    public function deleteTeamEvent($team) {

        //only tell the team and create news feed entry if the event hasn't happened yet
        if(Carbon::createFromTimestampUTC($this->end)->isFuture()) {
            $meta = ['event' => $this];
            $feed = (new NewsFeed)->deleteTeamEvent($team, $meta);
        }
        else {
            $feed = null;
        }

        //delete associated stats
        (new Stat)->deleteByEvent($team, $this);

        $this->delete();

        return $feed;
    }



    //updates an event, notifies team members and fans
    public function updateTeamEvent(Request $request, $team) {

        $start = $request->start;
        $end = $request->end;
        
        //keep a copy of the old event
        $oldEvent = $this;
       
        $this->title = $request->title;
        $this->type = intval($request->type);
        $tz = $request->session()->get('timezone');
        if(!$tz)
            $tz = 'UTC';

        $this->start = Carbon::parse($start, $tz)->timezone('UTC')->timestamp;
        $this->end = Carbon::parse($end, $tz)->timezone('UTC')->timestamp;

        if($this->end < $this->start) {
            return false;
        }

        $this->details = $request->details;
        $this->save();


        //only tell the team and create news feed entry if the event hasn't happened yet
        if(Carbon::createFromTimestampUTC($this->end)->isFuture()) {
            $meta = ['event' => $this, 'oldEvent' => $oldEvent];
            $feed = (new NewsFeed)->updateTeamEvent($team, $meta);
        }
        else {
            $feed = null;
        }
        
        return $feed;
    }



    //creates an event, notifies players and fans
    public function createTeamEvents(Request $request, $team) {

        //if they have a lot of events, throw error
        //not sure if necessary, just some security for the beginning
        if($this->where('owner_id', $team->id)->count() > 5000) {
            return ['ok' => false, 'error' => 'Event limit reached'];
        }


        $title      = $request->title;
        $type      = $request->type;
        $from       = $request->start;
        $to         = $request->end;
        $details    = $request->details;
        $tz         = $request->session()->get('timezone');

        //check if this is a repeating event
        if($request->has('repeats')) {
            $repeats    = $request->repeats;
            $days       = $request->repeatDays;
            $until      = $request->until;
        }
        else {
            $repeats = false;
        }

        //create carbon instances in user's timezone
        $startDate  = Carbon::createFromTimestamp($from, $tz);
        $endDate    = Carbon::createFromTimestamp($to, $tz);
        
        $done = false;
        $count = 0;

        //check if it repeats, store all event info
        if($repeats) {
            
            $stopDate   = Carbon::createFromTimestamp($until, $tz);

            $startHour      = $startDate->hour;
            $startMinutes   = $startDate->minute;
            $lapse          = $endDate->diffInMinutes($startDate);

            //will use this in the news feed meta data later
            $repeatDaysForStatus = '';

            //reassign integer values to the days of the week repeated
            foreach($days as $day) {

                switch($day) {
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
            //chop off leading comma
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

            $dayOfWeek = $startDate->dayOfWeek;

            //find days which are >= today
            for($x = 0; $x < count($tempRepeatDays); $x++) {
                if($tempRepeatDays[$x] >= $dayOfWeek) {
                    $repeatDays[] = $dayNames[$x];
                }
            }
            //find days < today
            for($x = 0; $x < count($tempRepeatDays); $x++) {
                if($tempRepeatDays[$x] < $dayOfWeek) {
                    $repeatDays[] = $dayNames[$x];
                }
            }


            
            //if the event starts on a day of the week that isn't in the repeating sequence,
            //make sure that first event gets created also.
            //Example: if your repeating days were W F and the start date was on Monday,
            //the first Carbon('this Wednesday') would completely skip that first  Monday event
            $createFirstEvent = false;
            if(!in_array($dayOfWeek, $tempRepeatDays))
                $createFirstEvent = true;
    
            $today = $startDate;

            //continuously loop through the repeatDays adding events for each one
            //think of each iteration of the while loop as being a week
            //goes until a break triggers or $count exceeds its limit
            while($count < 250) {

                //each iteration of this loop creates an event
                for($x = 0; $x < count($repeatDays); $x++) {

                    //make new definition of 'today' every loop
                    Carbon::setTestNow($today);

                    if($createFirstEvent) {
                        //include this first event but next loop move on with the 'next Monday' logic
                        $x = -1; //reset the loop counter back to the beginning
                        $createFirstEvent = false;
                    }

                    //below code checks how to move the the date forward based on which days of the week
                    //the event repeats

                    else if(count($repeatDays) > 1) { 
                        //e.g. if it repeats W F, you'd say 'this Wednesday', 'this Friday', 'this Wednesday', etc.
                        $today = new Carbon('this ' . $repeatDays[$x], $tz);
                    }

                    else if($count == 0) {
                        //e.g. if this is the first event and the event is on a Monday, start with 'this Monday'
                        $today = new Carbon('this ' . $repeatDays[$x], $tz);
                    }

                    else {
                        //e.g. if it only repeats on Monday, you always say 'next Monday' to move the iteration
                        $today = new Carbon('next ' . $repeatDays[$x], $tz);
                    }

                    //is today past the stop day? we're done, don't create this event
                    if($today->startOfDay() > $stopDate->startOfDay())
                        break 2;


                    //is today the last day it repeats? then add this and quit
                    if($today->isSameDay($stopDate))
                        $done = true;

                    //reset carbon's definition of 'now', create method uses it
                    Carbon::setTestNow();

                    $event = new Event;

                    //save the new event data
                    $event->start       = $today->addHours($startHour)->addMinutes($startMinutes)->timezone('UTC')->timestamp;
                    $event->end         = $today->addMinutes($lapse)->timestamp;
                    $event->title       = $title;
                    $event->type        = intval($type);
                    $event->owner_id    = $team->id;
                    $event->creator_id  = Auth::user()->id;
                    $event->details     = $details;

                    $event->save();   

                    if($count == 0) {
                        //save first event for news feed meta data
                        $firstEvent = $event;
                    }
                    else {
                        //store last event for news feed meta data
                        $lastEvent = $event;
                    }

                    //reset today back to midnight
                    $today->subHours($startHour)->subMinutes($startMinutes + $lapse)->timezone($tz);

                    $count++;

                    if($done) {
                        //that was the last event needed
                        break 2;
                    }

                }
            }

            //reset carbon's definition of 'now', create method uses it
            Carbon::setTestNow();

            $repeatsString = "$firstEvent->start:$lastEvent->start:$repeatDaysForStatus";
            $metaData = ['event' => $firstEvent, 'repeats' => $repeatsString];

        }

        else {
            //if just single event, add
            $event = new Event;

            $event->title       = $title;
            $event->type        = intval($type);
            $event->start       = $startDate->timezone('UTC')->timestamp;
            $event->end         = $endDate->timezone('UTC')->timestamp;
            $event->owner_id    = $team->id;
            $event->creator_id  = Auth::user()->id;
            $event->details     = $details;

            $event->save();

            $metaData = ['event' => $event];
        }

        //add this event to the news feed
        return (new NewsFeed)->newTeamEvents($team, $metaData);
    }


    













}
