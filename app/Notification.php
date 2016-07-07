<?php
namespace App;

use Illuminate\Database\Eloquent\Model;
use App\RC\Notification\NotificationTypes;

class Notification extends Model
{
    use NotificationTypes;

    protected $table = 'rc_notifications';

    protected $fillable = ['id', 'user_id', 'creator_id', 'type', 'meta'];

    /**
     * Convert the type to a string before giving to front-end
     * 
     * @param  int $type 
     * @return string       
     */
    public function getTypeAttribute($type)
    {
        return $this->convertTypeToString($type);
    }


    /**
     * Convert the type to an int before storing in db
     * 
     * @param  int $type 
     * @return void       
     */
    public function setTypeAttribute($type)
    {
        $this->attributes['type'] = $this->convertTypeToInt($type);
    }


}
