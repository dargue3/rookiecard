<?php
namespace App;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class TeamMember extends Model
{
    use SoftDeletes;

    protected $table = 'rc_team_members';
    protected $guarded = [];
    protected $dates = ['deleted_at'];


    /**
     * Build query to find all of the members of this team
     * 
     * @param  Builder
     * @param  integer
     * @param  integer
     * @return Builder
     */
    public function scopeMember($query, $user_id, $team_id)
    {
        return $query->where('user_id', $user_id)->where('team_id', $team_id);
    }



    /**
     * Build query to find all of the ghosts on this team
     * 
     * @param  Builder
     * @param  integer
     * @return Builder
     */
    public function scopeGhosts($query, $team_id)
    {
        return $query->where('user_id', 0)->where('team_id', $team_id);
    }



    /**
     * Returns this member's roles
     * 
     * @return Illuminate\Database\Eloquent\Relations\BelongsToMany
     */
    public function roles()
    {
        return $this->belongsToMany('App\TeamRole', 'rc_member_role', 'member_id', 'role_id')->withTimestamps();
    }


}
