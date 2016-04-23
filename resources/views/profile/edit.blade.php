@extends('master')

@section('head')
    <link href="//cdnjs.cloudflare.com/ajax/libs/select2/4.0.0/css/select2.min.css" rel="stylesheet" />

    <script src="//cdnjs.cloudflare.com/ajax/libs/select2/4.0.0/js/select2.min.js"></script>

@stop

@section('content')




    <div class="row-fluid">
        <div class="col-xs-12 col-sm-10 col-sm-offset-1 col-md-8 col-lg-6 col-md-offset-2 col-lg-offset-3 contentDiv">
            @include('partials/errorList')
            <div><h2 class="center">Edit your rookiecard</h2></div>

            <hr>
            <h3>About</h3>
            <br>

            {!! Form::open(['url' => "/$user->username/edit", 'enctype' => 'multipart/form-data']) !!}

            <div class="row">
                <div class="col-xs-12 col-sm-6">
                    <div class="form-group">
                        {!! Form::label('proPic', 'Pick a new profile picture:') !!}
                        {!! Form::file('proPic', $attribute = array('id' => "proPic", 'class' => "form-control input-lg",
                                'tabindex' => "0"))  !!}
                    </div>
                </div>
            </div>

            <div class="row">
                <div class="col-xs-12 col-sm-6">
                    <div class="form-group">
                        {!! Form::label('jersey_num', 'Select your jersey number:') !!}
                        {!! Form::select('jersey_num', $jerseyNums, null, $attribute = array('id' => "jersey_num", 'class' => "form-control input-lg",
                                'tabindex' => "1"))  !!}
                    </div>
                </div>
            </div>

            <div class="row">
                <div class="col-xs-12 col-sm-6">
                    <div class="form-group">
                        {!! Form::label('sportsSelect', 'Pick the sports you participate in:') !!}
                        {!! Form::select('sportsSelect[]', $sports, null, $attribute = array('id' => "sports", 'class' => "form-control input-lg",
                                'multiple', 'tabindex' => "2"))  !!}
                    </div>
                </div>
            </div>
            <div class="row">
                <div class="col-xs-12">
                    <div class="form-group">
                        <div id="honorsDiv">Briefly list your athletic honors:<span id="charsRemaining"><span id="chars">0</span>/150 characters</span></div>
                        {!! Form::textarea('honors', $value = null, $attribute = array('id' => "honors", 'class' => "form-control input-lg",
                                'tabindex' => "3", 'maxlength' => '150'))  !!}
                    </div>
                </div>
            </div>
            <br>
            <div class="row">
                <div class="col-xs-12 col-sm-6">{!! Form::submit('Save', array('class' => "btn btn-primary btn-block btn-md", 'tabindex' => "4")) !!}</div>
                <div class="col-xs-12 col-sm-6"><a href="/{!! $user->username !!}" id="cancelButton" class="btn btn-cancel btn-block btn-md" tabindex="5">Discard Changes</a></div>
            </div>
        </div>
    </div>


    <div id="editMetricsDiv" class="row-fluid">
        <div class="col-xs-12 col-sm-10 col-sm-offset-1 col-md-8 col-lg-6 col-md-offset-2 col-lg-offset-3 contentDiv">
            @include('partials/errorList')

            <h3>Metrics</h3>
            <br>
            <p>You can choose up to <b>12</b> metrics that best relate you to your sports. They appear on your rookiecard in the order you specify.</p>

            <br>
            <div class="row">
                <div class="col-xs-12">
                    <div class="form-group">
                        {!! Form::label('metricsSelect', 'Choose the metrics you want to appear on your rookiecard:') !!}
                        {!! Form::select('metricsSelect[]', $metrics, null, $attribute = array('id' => "metrics", 'class' => "form-control input-lg",
                                'multiple', 'tabindex' => "7"))  !!}
                    </div>
                </div>
            </div>
            <br>


            {{-- the following are hidden divs for selecting your metrics --}}


            <div id="heightMetric" class="row hidden">
                <div class="col-xs-1">
                    <div class="form-group">
                        <span title='height' class="glyphicon glyphicon-remove removeIcon"></span>
                    </div>
                </div>
                <div class="col-xs-6">
                    <div class="form-group">
                        {!! Form::label('height', 'Select your height:') !!}
                        {!! Form::select('height', $metricVals['height'], null, $attribute = array('id' => "height", 'class' => "form-control input-lg"))  !!}
                    </div>
                </div>
                <div class="col-xs-5">
                    <div class="form-group">
                        {!! Form::label('heightOrder', 'Position in metrics section:') !!}
                        {!! Form::select('heightOrder', $order, null, $attribute = array('class' => "form-control input-lg"))  !!}
                    </div>
                </div>
                <div></div>
            </div>

            <div id="weightMetric" class="row hidden">
                <div class="col-xs-1">
                    <div class="form-group">
                        <span title='weight' class="glyphicon glyphicon-remove removeIcon"></span>
                    </div>
                </div>
                <div class="col-xs-6">
                    <div class="form-group">
                        {!! Form::label('weight', 'Select your weight (pounds):') !!}
                        {!! Form::select('weight', $metricVals['weight'], null, $attribute = array('id' => "weight", 'class' => "form-control input-lg"))  !!}
                    </div>
                </div>
                <div class="col-xs-5">
                    <div class="form-group">
                        {!! Form::label('weightOrder', 'Position in metrics section:') !!}
                        {!! Form::select('weightOrder', $order, null, $attribute = array('class' => "form-control input-lg"))  !!}
                    </div>
                </div>
            </div>

            <div id="handednessMetric" class="row hidden">
                <div class="col-xs-1">
                    <div class="form-group">
                        <span title='handedness' class="glyphicon glyphicon-remove removeIcon"></span>
                    </div>
                </div>
                <div class="col-xs-6">
                    <div class="form-group">
                        {!! Form::label('handedness', 'Select your handedness:') !!}
                        {!! Form::select('handedness', $metricVals['handedness'], null, $attribute = array('id' => "handedness", 'class' => "form-control input-lg"))  !!}
                    </div>
                </div>
                <div class="col-xs-5">
                    <div class="form-group">
                        {!! Form::label('handednessOrder', 'Position in metrics section:') !!}
                        {!! Form::select('handednessOrder', $order, null, $attribute = array('class' => "form-control input-lg"))  !!}
                    </div>
                </div>
            </div>

            <div id="bench_maxMetric" class="row hidden">
                <div class="col-xs-1">
                    <div class="form-group">
                        <span title='bench_max' class="glyphicon glyphicon-remove removeIcon"></span>
                    </div>
                </div>
                <div class="col-xs-6">
                    <div class="form-group">
                        {!! Form::label('bench_max', 'Select your bench maximum (pounds):') !!}
                        {!! Form::select('bench_max', $metricVals['bench_max'], null, $attribute = array('id' => "bench_max", 'class' => "form-control input-lg"))  !!}
                    </div>
                </div>
                <div class="col-xs-5">
                    <div class="form-group">
                        {!! Form::label('bench_maxOrder', 'Position in metrics section:') !!}
                        {!! Form::select('bench_maxOrder', $order, null, $attribute = array('class' => "form-control input-lg"))  !!}
                    </div>
                </div>
            </div>

            <div id="verticalMetric" class="row hidden">
                <div class="col-xs-1">
                    <div class="form-group">
                        <span title='vertical' class="glyphicon glyphicon-remove removeIcon"></span>
                    </div>
                </div>
                <div class="col-xs-6">
                    <div class="form-group">
                        {!! Form::label('vertical', 'Select your vertical (inches):') !!}
                        {!! Form::select('vertical', $metricVals['vertical'], null, $attribute = array('id' => "vertical", 'class' => "form-control input-lg"))  !!}
                    </div>
                </div>
                <div class="col-xs-5">
                    <div class="form-group">
                        {!! Form::label('verticalOrder', 'Position in metrics section:') !!}
                        {!! Form::select('verticalOrder', $order, null, $attribute = array('class' => "form-control input-lg"))  !!}
                    </div>
                </div>
            </div>

            <div id="broad_jumpMetric" class="row hidden">
                <div class="col-xs-1">
                    <div class="form-group">
                        <span title='broad_jump' class="glyphicon glyphicon-remove removeIcon"></span>
                    </div>
                </div>
                <div class="col-xs-6">
                    <div class="form-group">
                        {!! Form::label('broad_jump', 'Select your furthest standing broad jump:') !!}
                        {!! Form::select('broad_jump', $metricVals['broad_jump'], null, $attribute = array('id' => "broad_jump", 'class' => "form-control input-lg"))  !!}
                    </div>
                </div>
                <div class="col-xs-5">
                    <div class="form-group">
                        {!! Form::label('broad_jumpOrder', 'Position in metrics section:') !!}
                        {!! Form::select('broad_jumpOrder', $order, null, $attribute = array('class' => "form-control input-lg"))  !!}
                    </div>
                </div>
            </div>

            <div id="dash_40_ydMetric" class="row hidden">
                <div class="col-xs-1">
                    <div class="form-group">
                        <span title='dash_40_yd' class="glyphicon glyphicon-remove removeIcon"></span>
                    </div>
                </div>
                <div class="col-xs-6">
                    <div class="form-group">
                        {!! Form::label('dash_40_yd', 'Input your fastest 40 yard dash (seconds):') !!}
                        {!! Form::text('dash_40_yd', null, $attribute = array('id' => "dash_40_yd", 'class' => "form-control input-lg"))  !!}
                    </div>
                </div>
                <div class="col-xs-5">
                    <div class="form-group">
                        {!! Form::label('dash_40_ydOrder', 'Position in metrics section:') !!}
                        {!! Form::select('dash_40_ydOrder', $order, null, $attribute = array('class' => "form-control input-lg"))  !!}
                    </div>
                </div>
            </div>

            <div id="cone_drillMetric" class="row hidden">
                <div class="col-xs-1">
                    <div class="form-group">
                        <span title='cone_drill' class="glyphicon glyphicon-remove removeIcon"></span>
                    </div>
                </div>
                <div class="col-xs-6">
                    <div class="form-group">
                        {!! Form::label('cone_drill', 'Input your fastest 3 Cone Drill (seconds):') !!}
                        {!! Form::text('cone_drill', null, $attribute = array('id' => "cone_drill", 'class' => "form-control input-lg"))  !!}
                    </div>
                </div>
                <div class="col-xs-5">
                    <div class="form-group">
                        {!! Form::label('cone_drillOrder', 'Position in metrics section:') !!}
                        {!! Form::select('cone_drillOrder', $order, null, $attribute = array('class' => "form-control input-lg"))  !!}
                    </div>
                </div>
            </div>


        </div>
    </div>







    <div class="row-fluid">
        <div class="col-xs-12 col-sm-10 col-sm-offset-1 col-md-8 col-lg-6 col-md-offset-2 col-lg-offset-3 contentDiv">
            @include('partials/errorList')

            <h3>Personal Stats</h3>
            <br>

            <div class="row">
                <div class="col-xs-12">
                    <div class="form-group">
                        {!! Form::label('metrics', 'choose the metrics you want to appear on your rookiecard:') !!}
                        {!! Form::select('metrics', $metrics, null, $attribute = array('id' => "metrics", 'class' => "form-control input-lg",
                                'multiple', 'tabindex' => "7"))  !!}
                    </div>
                </div>
            </div>
            <div class="row">
                <div class="col-xs-12">
                    <div class="form-group">
                        <div id="honorsDiv">briefly list your athletic honors:<span id="charsRemaining"><span id="chars">0</span>/200 characters</span></div>
                        {!! Form::textarea('honors', $value = null, $attribute = array('id' => "honors", 'class' => "form-control input-lg",
                                'tabindex' => "8", 'maxlength' => '200'))  !!}
                    </div>
                </div>
            </div>
        </div>
    </div>





@stop
<script>

    @section('scripts')

    var sportsSelect  = $('#sports').select2({
        allowClear: false
        });



    var maxLength = 150;
    $('#honors').keyup(function() {
        var length = $(this).val().length;
        $('#chars').text(length);
    });


    var metricsSelect = $('#metrics').select2({
        maximumSelectionLength: 12
    });
    //for showing new metrics divs when they are selected in select2
    var metrics = $('div#editMetricsDiv ul.select2-selection__rendered');
    var selectedMetrics;
    var count = 1;
    var newMetric = '';


    //look for selection event trigger
    metricsSelect.on('select2:select',function(e) {
        var value = e.params.data.id;
        var selector = $('div#' + value + 'Metric');

        selector.find('select').last().val(count);
        count++;
        if(count > 12) count = 12;


        if (selector.hasClass('hidden'))
            selector.toggleClass('hidden').hide().delay(150).slideDown(200);
        else if(selector.hasClass('exited'))
            selector.toggleClass('exited').hide().delay(150).slideDown(200);

        selectedMetrics = $(this).select2('val');

    });
    //look for selection event trigger
    metricsSelect.on('select2:unselect',function(e) {
        var value = e.params.data.id;
        var selector = $('div#' + value + 'Metric');

        //prevent from opening list when deleting selection


        selector.slideUp(200).toggleClass('exited');

        selectedMetrics = $(this).select2('val');

        count--;
        if(count < 0) count = 0;


    });


    //when the user clicks an X, hide that div, remove from list
    var anySpan = $('div#editMetricsDiv');
    var parentDiv = '';
    var arrIndex = '';
    var currentData = '';
    anySpan.on('click', 'span.glyphicon', function() {
        parentDiv = $(this).attr('title');
        var selector = $('#' + parentDiv + 'Metric');

        //slide up and give 'exited' class which is just an identifier for if it comes back
        selector.slideUp(200).toggleClass('exited');
        selector.find('select').first().val(0);

        //remove that metric from the list
        selectedMetrics = jQuery.grep(selectedMetrics, function(value) {
            return value != parentDiv;
        });

        //update select2 with new vals list
        $('#metrics').select2('val', selectedMetrics);

        count--;
        if(count < 0) count = 0;
    });







    @stop

</script>