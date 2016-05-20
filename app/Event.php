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
    * type column:
    * 0 = team event
    * 
    *
    */
    use SoftDeletes;
    /**
     * The database table used by the model.
     *
     * @var string
     */
    protected $table = 'rc_events';

    protected $dates = ['deleted_at'];

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = ['id', 'type', 'owner_id', 'creator_id', 'title', 'details', 'start', 'end'];




    //get all events for a team, echo to ajax call
    public function getTeamEvents($team) {

        //parse all events related to team, return as json
        return $this->where('owner_id', $team->id)->where('type', 0)->orderBy('start')->get();

    }


    

    //for finding events in the future in a search
    public function scopeFuture($query) {

        return $query->where('start', '>=', Carbon::now());

    }



    //delete a team event
    public function deleteTeamEvent($team) {

        //only tell the team and create news feed entry if the event hasn't happened yet
        if(Carbon::createFromTimestampUTC($this->end)->isFuture()) {
            $feed = new NewsFeed;
            $feed = $feed->deleteTeamEvent($team, $this);
        }
        else {
            $feed = null;
        }

        //delete associated stats
        $stats = new Stat;
        $stats->deleteByEvent($team, $event);

        $this->delete();

        return $feed;
    }



    //updates an event, notifies team members and fans
    public function updateTeamEvent($request, $team) {

        $start = $request->start;
        $end = $request->end;
        
        //keep a copy of the old event
        $oldEvent = $this;
       
        $this->title = $request->title;
        $this->class = intval($request->class);
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
            $feed = new NewsFeed;
            $feed = $feed->updateTeamEvent($team, $this, $oldEvent);
        }
        else {
            $feed = null;
        }
        
        return $feed;
    }



    //creates an event, notifies players and fans
    public function createTeamEvent($team, Request $request) {


        $eventCount = $this->where('owner_id', $team->id)->count();

        //if they have a lot of events, throw error
        //not sure if necessary, just some security for the beginning
        if($eventCount > 1000) {
            echo "Too many events already created!";
            return;
        }


        $title      = $request->get('title');
        $class      = $request->get('eventClass');
        $from       = $request->get('fromDate') . " " . $request->get('fromTime');
        $to         = $request->get('toDate') . " " . $request->get('toTime');
        $until      = $request->get('until');
        $repeats    = $request->get('repeats');
        $days       = $request->get('repeatDays');
        $details    = $request->get('details');
        $tz         = $request->session()->get('timezone');

        if($repeats) {
            //more than one event
            if(empty($until) || empty($days))
                //they checked 'repeats' but didn't fill in enough data
                $repeats = false;
        }

        //create carbon instances from date strings in user's timezone
        $startDate  = Carbon::parse($from, $tz);
        $endDate    = Carbon::parse($to, $tz);

        if($endDate < $startDate) {
            //dates got messed up, fail
            echo json_encode(['data' => 'End date is before start date!', 'result' => false]);
            return;
        }
        
        $done = false;
        $count = 0;

        //check if it repeats, store all event info
        if($repeats) {

            
            $stopDate   = Carbon::parse($until, $tz);

            $startHour      = $startDate->hour;
            $startMinutes   = $startDate->minute;
            $lapse          = $endDate->diffInMinutes($startDate);


            $days = $request->get('repeatDays');


            //for storing what days are repeated
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


            $createFirstEvent = false;
            //if the event starts on a day of the week that isn't in the repeating sequence,
            //make sure that first event gets created also 
            //e.g. the Carbon('this Monday') would skip otherwise
            if(!in_array($dayOfWeek, $tempRepeatDays))
                $createFirstEvent = true;
    

            $today = $startDate;



            //loop through all the possible days
            //count is a fail-safe in case of error
            while($count < 250) {

                for($x = 0; $x < count($repeatDays); $x++) {

                    $event = new Event;

                    //make new definition of 'today' every loop
                    Carbon::setTestNow($today);

                    //include this first event
                    if($createFirstEvent) {
                        $x = -1; //reset the loop count
                        $createFirstEvent = false;
                    }
                    //like saying: today is now defined as "this Monday"
                    elseif(count($repeatDays) > 1)
                        $today = new Carbon('this ' . $repeatDays[$x], $tz);
                    elseif($count == 0)
                        $today = new Carbon('this ' . $repeatDays[$x], $tz);
                    else
                        $today = new Carbon('next ' . $repeatDays[$x], $tz);

                    //is today past the stop day? then quit creating
                    if($today->startOfDay() > $stopDate->startOfDay())
                        break 2;

                    //is today the stop day? then add this and quit
                    if($today->isSameDay($stopDate))
                        $done = true;


                    //save the new event data
                    $event->start   = $today->addHours($startHour)->addMinutes($startMinutes)->timezone('UTC')->timestamp;
                    $event->end     = $today->addMinutes($lapse)->timestamp;
                    $event->title   = $title;
                    $event->class   = intval($class);
                    $event->owner_id = $team->id;
                    $event->creator_id = Auth::user()->id;
                    $event->details = $details;
                    $event->type    = 0;
                    $event->save();



                    //reset carbon's definition of 'now', create method uses it
                    Carbon::setTestNow();


                    if($count == 0)
                        //save first event for repeats meta data
                        $firstEvent = $event;
                    else
                        //store last event for repeats meta data
                        $lastEvent = $event;



                    //reset today back to midnight on that day in their timezone
                    $today->subHours($startHour)->subMinutes($startMinutes + $lapse)->timezone($tz);

                    $count++;

                    if($done)
                        break 2;

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

            $event->title = $title;
            $event->class = intval($class);
            $event->start = $startDate->timezone('UTC')->timestamp;
            $event->end   = $endDate->timezone('UTC')->timestamp;
            $event->owner_id = $team->id;
            $event->creator_id = Auth::user()->id;
            $event->details = $details;
            $event->type = 0;
            $event->save();

            $metaData = ['event' => $event];
        }

        //add this event to the news feed
        $update = new NewsFeed;
        $update = $update->newTeamEvents($team, $metaData);

        return $update;
    }


    













}
