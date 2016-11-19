<?php

namespace App\Console\Commands;

use Storage;
use Carbon\Carbon;
use Illuminate\Console\Command;

class EmptyTmpLocalStorage extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'rookiecard:empty-storage';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Clear out old data in storage/app/public/tmp directory';

    /**
     * Create a new command instance.
     *
     * @return void
     */
    public function __construct()
    {
        parent::__construct();
    }

    /**
     * Execute the console command.
     *
     * @return mixed
     */
    public function handle()
    {
        $cutoff = new Carbon('12 hours ago');

        foreach (Storage::disk('local')->allFiles('tmp/') as $file) {
            if (Carbon::createFromTimestamp(Storage::disk('local')->getTimestamp($file)) < $cutoff) {
                Storage::disk('local')->delete($file);
            }
        }
    }
}
