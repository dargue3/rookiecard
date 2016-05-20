<?php

namespace App\Policies;

use Illuminate\Auth\Access\HandlesAuthorization;
use Illuminate\Http\Request;

use App\TeamMember;
use App\Team;
use App\User;
use App\Event;
use App\NewsFeed;

class TeamPolicy
{
    use HandlesAuthorization;
   

    //make sure the user in the request belongs to this team
    public function editUser(User $user, Team $team, $member_id) {

        return $team->id == TeamMember::findOrFail($member_id)->team_id;

    }



    //make sure the logged in user is allowed to edit this event
    public function editEvents(User $user, Team $team, $event_id) {

        return $team->id == Event::findOrFail($event_id)->owner_id;

    }



    //make sure the logged in user is allowed to edit this news feed post
    public function editPosts(User $user, Team $team, $post_id) {

        return $team->id == NewsFeed::findOrFail($post_id)->owner_id;

    }



    //make sure all of the stats and users in the request belong to this team
    public function editStats(User $user, Team $team, Request $request) {

        //loop through all the uploaded stats, check that the
        //member_id, id, & team all correspond to eachother
        foreach($request->playerStats as $stats)    {
            $member = TeamMember::find($stats['member_id']);

            if(!$member) {
                //this person isn't even in the database
                return false;
            }

            if($member->team_id != $team->id) {
                //this person isn't on this team
                return false;
            }

            if($stats['id'] != $member->user_id) {
                //the stat's user_id doesn't match TeamMember's user_id, tampered with
                return false;
            }
        }

        if($request->team['id'] != $team->id) {
            //wrong team
            return false;
        }

        return true;

    }













}
