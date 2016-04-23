<?php

namespace App;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class TeamStatBasketball extends Model
{

    use SoftDeletes;

    /**
     * The database table used by the model.
     *
     * @var string
     */
    public $timestamps = false;

    public $primaryKey = null;

    public $incrementing = false;

    protected $dates = ['deleted_at'];

    protected $table = 'rc_team_stats_basketball';

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $guarded = null;


    //convert stats into useable form for view
    public function formatStats($team) {

        $stats = $this->where('team_id', $team->id)->get();

        if($stats) {
            $count = 0;
            foreach($stats as $stat) {

                //pull key and vals from eloquent model results
                $keys = array_keys($stat['attributes']);
                $vals = array_values($stat['attributes']);

                //x is offset to skip stat meta data that user doesn't care about
                for ($x = 3; $x < count($keys) - 3; $x++) {

                    $key = strtoupper($keys[$x]);
                    $val = $vals[$x];

                    $formattedStats[$count][$key] = $val;

                    switch ($key) {
                        //create new stats based on existing ones, example: FG% = FGM / FGA
                        case 'FGA':
                            $key = 'FG%';
                            $val = round(($formattedStats[$count]['FGM'] / $formattedStats[$count]['FGA']) * 100, 1);
                            $formattedStats[$count][$key] = $val;
                            break;

                        case '3PA':
                            $key = '3P%';
                            $val = round(($formattedStats[$count]['3PM'] / $formattedStats[$count]['3PA']) * 100, 1);
                            $formattedStats[$count][$key] = $val;
                            break;

                        case 'FTA':
                            $key = 'FT%';
                            $val = round(($formattedStats[$count]['FTM'] / $formattedStats[$count]['FTA']) * 100, 1);
                            $formattedStats[$count][$key] = $val;
                            break;

                        case 'OREB':
                            $key = 'REB';
                            $val = $formattedStats[$count]['DREB'] + $formattedStats[$count]['OREB'];
                            $formattedStats[$count][$key] = $val;
                            break;
                    }
                }
                $count++;
            }
        }
        else
            $formattedStats = null;

        return $formattedStats;
    }
}
