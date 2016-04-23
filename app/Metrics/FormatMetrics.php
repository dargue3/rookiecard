<?php

namespace App\Metrics;

class FormatMetrics
{



    //provides a global array for meta data of user metrics
    //array is formatted: description, num decimal places, units
    public $metricNames = array(
        'height'             => array('HEIGHT', 0, 'feet inches'),
        'weight'             => array('WEIGHT', 0, ' lbs'),
        'handedness'         => array('HANDEDNESS', 0, ''),
        'bench_max'          => array('BENCH MAX', 0, ' lbs'),
        'vertical'           => array('VERTICAL', 1, '"'),
        'broad_jump'         => array('BROAD JUMP', 0, 'feet inches'),
        'dash_40_yd'         => array('40 YD DASH', 2, ' sec'),
        'cone_drill'         => array('3 CONE DRILL', 2, ' sec'),
        'shuttle_run_20'     => array('20 YD SHUTTLE', 2, ' sec'),
        'shuttle_run_60'     => array('60 YD SHUTTLE', 2, ' sec')
    );


    //returns an array of possible values for the metrics (passed to editProfile view)
    public function metricVals()
    {
        $height['none']     = '--';
        $weight['none']     = '--';
        $vertical['none']   = '--';
        $benchMax['none']   = '--';
        $broadJump['none']  = '--';

        //height
        for($x = 54; $x <= 90; $x++) {
            $height[$x] = $this->formatFeetInches($x);
        }
        $metricVals['height'] = $height;

        //weight
        for($x = 65; $x <= 350; $x+=5) {
            $weight[$x] = $x;
        }
        $metricVals['weight'] = $weight;

        //handedness
        $handedness = array('--', 'Right', 'Left', 'Ambidextrous');
        $metricVals['handedness'] = $handedness;

        //bench max
        for($x = 35; $x <= 500; $x+=5) {
            $benchMax[$x] = $x;
        }
        $metricVals['bench_max'] = $benchMax;

        //vertical
        for($x = 15; $x <= 50; $x++) {
            $vertical[$x] = $x;
        }
        $metricVals['vertical'] = $vertical;

        //broad jump
        for($x = 48; $x <= 147; $x++) {
            $broadJump[$x] = $this->formatFeetInches($x);
        }
        $metricVals['broad_jump'] = $broadJump;






        return $metricVals;

    }





    //returns formatted version of metric data
    //nameOrValue is for specifying if you're returning the name of metric or formatted value
    //for name: $nameOrValue = 0, otherwise for value: $nameOrValue = 1
    public function formatMetricData($metrics)
    {
        $results = array();

        foreach($metrics as $key => $value) {

            $name       = $this->metricNames[$key][0];
            $precision  = $this->metricNames[$key][1];
            $units      = $this->metricNames[$key][2];


            //sort which metric if it needs special formatting
            switch ($key) {
                //cases with no special formatting
                case 'vertical':
                case 'weight':
                case 'dash_40_yd':
                case 'bench_max':
                case 'cone_drill':
                case 'shuttle_run_20':
                case 'shuttle_run_60':
                    $results[$name] = round($value, $precision) . $units;
                    break;

                //cases needing special formatting

                //for cases like 5'9"
                case 'height':
                case 'broad_jump':
                    $results[$name] = $this->formatFeetInches($value);
                    break;

                case 'handedness':
                    $results[$name] = $this->getHandedness($value);
                    break;

            }
        }
        return $results;
    }

    //turns $value inches into x'y" string
    public function formatFeetInches($value)
    {

        $numFeet = floor($value / 12);

        $numInches = $value - ($numFeet * 12);

        if ($numInches >= 0)
            $results = $numFeet . "' " . $numInches . '"';
        else
            $results = $numFeet . "'";

        return $results;
    }



    //returns 'Right', 'Left', or 'Ambidextrous' depending on input
    public function getHandedness($handedness)
    {

        if ($handedness == 1)
            $result = 'Right';
        elseif ($handedness == 2)
            $result = 'Left';
        else
            $result = 'Ambidextrous';

        return $result;

    }
}