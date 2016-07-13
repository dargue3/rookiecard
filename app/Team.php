<?php
namespace App;

use App\Stat;
use App\Event;
use App\NewsFeed;
use App\TeamRole;
use App\TeamMember;
use App\Notification;
use App\RC\Sports\Sport;
use Illuminate\Http\Request;
use App\RC\Team\TeamRepository;
use Illuminate\Support\Facades\Auth;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Team extends Model
{
    use SoftDeletes;

    protected $table = 'rc_teams';
    protected $dates = ['deleted_at'];
    protected $guarded = [];


    public function scopeName($query, $teamname)
    {
        return $query->where('teamname', $teamname);
    }


    /**
     * The key to use for route model binding
     * 
     * @return string
     */
    public function getRouteKeyName()
    {
        return 'teamname';
    }


    /**
     * Convert the sport to a string before giving to front-end
     * 
     * @param  int $sport 
     * @return string       
     */
    public function getSportAttribute($sport)
    {
        return Sport::convertSportToString($sport);
    }


    /**
     * Convert the sport to an int before storing in db
     * 
     * @param  string $sport 
     * @return void       
     */
    public function setSportAttribute($sport)
    {
        $this->attributes['sport'] = Sport::convertSportToInt($sport);
    }



    /**
     * Fetch the bare minimum data about this team
     * 
     * @return array
     */
    public function brief()
    {
        return [
            'id'        => $this->id,
            'teamname'  => $this->teamname,
            'name'      => $this->name,
            'sport'     => $this->sport
        ];
    }



    // admin wants to upload a new profile picture
    public function uploadPic(Request $request) {

        // make sure there's a picture
        if($request->hasFile('pic')) {

            $pic = $request->file('pic');

            // check that it's a valid image
            if(!$pic->isValid())
                return ['ok' => false, 'error' => 'Invalid picture'];

            // deny if over 10MB
            if($pic->getSize() > 10485760)
                return ['ok' => false, 'error' => 'Maximum image size is 10MB'];
        }
        else
            return ['ok' => false];


        // build up a filename such as 2842.jpeg
        $filename = $this->id . '.' . $pic->getClientOriginalExtension();

        // save images in the path specified in .env file
        $filepath = base_path() . env('TEAM_PROFILE_PICS');

        // move the file to that path, save as filename
        $pic->move($filepath, $filename);

        // save the picture's location in database
        $this->pic = env('TEAM_PROFILE_PICS') . $filename;
        $this->save();

        return ['ok' => true];
    }







}
