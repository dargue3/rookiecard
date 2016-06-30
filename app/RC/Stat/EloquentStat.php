<?php
namespace App\RC\Stat;

use App\Stat;
use App\Repositories\EloquentRepository;

class EloquentStat extends EloquentRepository implements StatRepository
{
	/**
	 * The path of this model, to be used in EloquentRepository
	 * 
	 * @var string
	 */
	protected $modelPath = 'App\Stat';


	/**
	 * Fetch a given team's stats
	 * 
	 * @param  int $team_id
	 * @return Collection 
	 */
	public function getTeamStats($team_id)
	{
		return Stat::where('team_id', $team_id)->get();
	}


	/**
	 * Delete any stat entries associated with a given event
	 * 
	 * @param  int $team_id 
	 * @param  int $event_id 
	 * @return void           
	 */
	public function deleteByEvent($team_id, $event_id)
	{
		Stat::where('team_id', $team_id)->where('event_id', $event_id)->delete();
	}



	/**
	 * Delete any stat entries associated with a given member on a given team
	 * 
	 * @param  int $member_id 
	 * @param  int $team_id 
	 * @return void           
	 */
	public function deleteByMember($team_id, $event_id)
	{
		Stat::where('team_id', $team_id)->where('member_id', $member_id)->delete();
	}



	/**
     * Swaps stat ownership from one member instance to another
     * 
     * @param  TeamMember $current
     * @param  TeamMember $new
     * @return void           
     */
    public function switchOwners($current, $new)
    {
        if ($current->team_id != $new->team_id) {
            throw new Exception("These members aren't on the same team");
        }

        $stats = Stat::teamMember($current->team_id, $current->id)->get();

        foreach ($stats as $stat) {        
            $stat->member_id = $new->id;
            $stat->owner_id = $new->user_id;
            $stat->save();
        }
    }
}