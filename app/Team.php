<?php
namespace App;

use App\Stat;
use Exception;
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
     * Convert the age to a string before giving to front-end
     * 
     * @param  int $age 
     * @return string       
     */
    public function getAgeAttribute($age)
    {
        switch ($age) {
            case 0:
                return '12-and-under';
            case 1:
                return '13-18';
            case 2:
                return 'college';
            case 3:
                return 'adult';
            default:
                throw new Exception("Invalid age integer $age");
        }
    }


    /**
     * Convert the age to an int before storing in db
     * 
     * @param  string $age 
     * @return void       
     */
    public function setAgeAttribute($age)
    {
        switch ($age) {
            case '12-and-under':
                $this->attributes['age'] = 0;
                break;
            case '13-18':
                $this->attributes['age'] = 1;
                break;
            case 'college':
                $this->attributes['age'] = 2;
                break;
            case 'adult':
                $this->attributes['age'] = 3;
                break;
            default:
                throw new Exception("Invalid age string $age");
                break;
        }
    }

    /**
     * Convert the gender to a string before giving to front-end
     * 
     * @param  int $gender 
     * @return string       
     */
    public function getGenderAttribute($gender)
    {
        switch ($gender) {
            case 0:
                return 'male';
            case 1:
                return 'female';
            case 2:
                return 'coed';
            default:
                throw new Exception("Invalid gender integer $gender");
        }
    }


    /**
     * Convert the gender to an int before storing in db
     * 
     * @param  string $gender 
     * @return void       
     */
    public function setGenderAttribute($gender)
    {
        switch ($gender) {
            case 'male':
                $this->attributes['gender'] = 0;
                break;
            case 'female':
                $this->attributes['gender'] = 1;
                break;
            case 'coed':
                $this->attributes['gender'] = 2;
                break;
            default:
                throw new Exception("Invalid gender string $gender");
                break;
        }
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

}
