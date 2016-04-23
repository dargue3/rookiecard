@extends('master')

@section('head')
    <title>{{ $team->teamname }}</title>

    <!-- for calendar -->
    <link rel="stylesheet" href="/bower_components/bootstrap-calendar/css/calendar.css">
    <script src="/bower_components/underscore/underscore-min.js"></script>
    <script src="/bower_components/bootstrap-calendar/js/calendar.js"></script>

    {{-- icon fonts --}}
    <link href="//fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">


    {{-- animate.css --}}
    <link rel='stylesheet' href='/css/animate.css-master/animate.css'></link>

    <!-- for datepickers -->
    <script src="/bower_components/moment/moment.js"></script>
    <script src="/bower_components/eonasdan-bootstrap-datetimepicker/src/js/bootstrap-datetimepicker.js"></script>
    <link rel="stylesheet" href="/bower_components/eonasdan-bootstrap-datetimepicker/build/css/bootstrap-datetimepicker.min.css">


    <!-- for bootstrap-table -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/bootstrap-table/1.9.0/bootstrap-table.min.css">
    <script src="https://cdnjs.cloudflare.com/ajax/libs/bootstrap-table/1.9.0/bootstrap-table.min.js"></script>


    <!-- stat table font -->
    <link href='https://fonts.googleapis.com/css?family=Monda' rel='stylesheet' type='text/css'>



@stop






@section('content')
    @include('partials/banners')
    <br>
    {{-- wrap in teamApp for Vue.js, wrap in forBlurring for launching a modal with blurry background --}}
    <div class='container-fluid' id="teamApp" data-teamname='{{ $team->teamname }}'>
    <div id='forBlurring'>
    <div class="row">
        <div class="col-xs-6 col-sm-6 col-xs-offset-3 col-md-2 col-md-offset-0">
            <div class="side-bar">
                <ul>
                    <li id='become-fan'>
                        <a>Become a fan</a>
                    </li>
                    <li class='divider'></li>
                    <li id='my-rookiecard'>
                        <a href='/{{ App\User::find(Auth::user()->id)->username }}'>My Rookiecard</a>
                    </li>
                    <li id='my-teams'>
                        <a>My Teams</a>
                    </li>
                    <li class='divider'></li>
                    <li>
                        <a id='leaderboards'>Leaderboards</a>
                    </li>
                    <li class='divider'></li>
                    <li>
                        <a href="/team/create" id='create-a-team'>Create a Team</a>
                    </li>
                </ul>
            </div>          
        </div>

        <div class="col-xs-12 col-sm-10 col-sm-offset-1 col-md-8 col-md-offset-0 well teamWell">

        
            <div class="row">
                <div class="col-xs-6 col-xs-offset-3">
                    <h2 id="name">{{ $team->name }}</h2>
                </div>
            </div>
            <br>
            <br>
            <div class="row">
                <div class="col-xs-12 col-sm-8 col-sm-offset-2 teamTableDiv">
                    <ul class="teamTableUl">
                        <li>
                            <a id="calendarTab" class="aboutTabActive"><i id='teamCalendarIcon' class="material-icons">date_range</i>CALENDAR</a>
                        </li>
                        <li>
                            <a id="statsTab"><i id='teamStatsIcon'  class="material-icons">equalizer</i>STATS</a>
                        </li>
                        <li>
                            <a id="rosterTab" class="aboutTabInactive"><i id='teamRosterIcon'  class="material-icons">group</i>ROSTER</a>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    </div>


    <div class="row">
        <div id="aboutTeamDiv" class="col-xs-12 col-sm-10 col-sm-offset-1 col-md-8 col-md-offset-2 contentDiv">

            <!-- calendar -->
            <div id="calendarDiv" class="activeDiv">
                <div id="calendarNav" class="row">
                    <div class="col-xs-12">
                        <table id="calNav" class="row">
                            <tr class="row">
                                <td id="chevLeft" data-cal-nav="prev">
                                    <img src="/images/chevLeft.png">
                                </td>
                                <td id="calNavHeaderTable">
                                    <!-- h3 tag dynamically set by calendar.js -->
                                    <h3 id="calNavHeader"></h3>
                                </td>
                                <td id="chevRight" data-cal-nav="next">
                                    <img src="/images/chevRight.png">
                                </td>
                                @if($admin)
                                    <td id='addEventIconDiv'>
                                        <a id='addEventTrigger'>
                                            <i id="addEventIcon" class="glyphicon glyphicon-plus"></i>
                                            <span id="addEventText">Add an Event</span>
                                        </a>
                                    </td>
                                @endif
                            </tr>
                        </table>
                    </div>
                </div>
                <br>
                <br>
                <div class="row">
                    <div class="col-xs-12">
                        <div id="calendar"></div>
                    </div>
                </div>
            </div>

                <!-- roster -->
            <div id="rosterDiv" class="hidden">
                <h3>Roster</h3>
                <hr>
                {{-- <div class="row">
                    <div class="col-xs-12 col-sm-6">
                        <h4>Players:</h4>
                        <ul class="list-group searchResults">
                            @if(!empty($players))
                                @foreach($players as $player)
                                    <li class="list-group-item">
                                        <a href="/{{ $player->username }}">{{ $playerData[$player->id]['num'] . " "}}
                                            {{ $player->firstname . " " . $player->lastname }}</a>
                                    </li>
                                @endforeach
                            @else
                                <li class="list-group-item">
                                    <p>No players yet</p>
                                </li>
                            @endif
                        </ul>
                    </div>
                    <div class="col-xs-12 col-sm-6">
                        <h4>Coaches:</h4>
                        <ul class="list-group searchResults">
                            @if(!empty($coaches))
                                @foreach($coaches as $coach)
                                    <li class="list-group-item">
                                        <a href="/{{ $coach->username }}">{{ $coach->firstname . " " . $coach->lastname }}</a>
                                    </li>
                                @endforeach
                            @else
                                <li class="list-group-item">
                                    <p>No coaches yet</p>
                                </li>
                            @endif
                        </ul>
                    </div>
                </div> --}}
            </div>
        </div>

        <!-- ads div -->
        <div class="col-xs-6 col-xs-offset-3 col-md-2 col-md-offset-0 col-lg-2 ads">
            <p>ads ads ads ads ads</p>
            <p>ads ads ads ads ads</p>
        </div>
    </div>

    <div class="row">
        <div class="col-xs-12">
            <br>
        </div>
    </div>


   <!-- start of news feed, dynamically built depending on type of status update -->

    <div id='feedPostRow' class="row">
        {!! Form::open(['url' => "/team/$team->teamname/postFeedPost", 'id' => 'newFeedPost']) !!}
        <div id="feedPostDiv" class="col-xs-12 col-sm-10 col-sm-offset-1 col-md-8 col-md-offset-2">
    
            {!! Form::textarea('postText', null, array('class' => 'form-control', 'rows' => 1, 'maxlength' => 1000,
                                              'placeholder' => 'Write your message to the team, then press enter.', 'id' => 'postText')) !!}
            {!! Form::hidden('tz', null, array('id' => 'timezonePost')) !!}
                
        </div>
        {!! Form::close() !!}
    </div>


    <div class="row">
        <div id='feedNoNews' class='col-xs-12 col-sm-10 col-sm-offset-1 col-md-8 col-md-offset-2 contentDiv hide'>
            <h3>No entries in team news feed yet</h3>
        </div>
    </div>


    <div id='feedDiv' class="row hide">
        <div id="notifyDiv" class="col-xs-12 col-sm-10 col-sm-offset-1 col-md-8 col-md-offset-2 contentDiv ">
            <div class="row">
                <i id="feedAddEventIcon" class="glyphicon glyphicon-plus feedIcon hide"></i>
                <i id="feedDeleteEventIcon" class="glyphicon glyphicon-trash feedIcon hide"></i>
                <i id="feedUpdateEventIcon" class="glyphicon glyphicon-refresh feedIcon hide"></i>
                <i id="feedPostIcon" class="glyphicon glyphicon-user feedIcon hide"></i>
                <i id="feedStatsIcon" class="glyphicon glyphicon-signal feedIcon hide"></i>
                <p id="feedTimestamp" class="statusDate">
                    {{-- timestamp and creator goes here --}}
                </p>
            </div>
            <hr id='feedFirstHR' class="statusHR">
            <div class="row">
                <div class="col-xs-12">
                    <p id="feedString">
                        {{-- count of how many events goes here --}}
                    </p>
                </div>
            </div>
            <div class="row">
                <div class="col-xs-12">
                    <b>
                        <p id="feedTitle">
                            {{-- title goes here --}}
                        </p>
                    </b>
                </div>
            </div>
            <div class="row">
                <div class="col-xs-12">
                    <p id="feedDate">
                        {{-- event date info goes here --}}
                    </p>
                </div>
            </div>
            <div class="row">
                <div class="col-xs-12">
                    <p id="feedRepeats">
                        {{-- repeating info goes here --}}
                    </p>
                </div>
            </div>

            <div id='feedDetailsDiv' class="row hide">
                <div class="col-xs-12">
                    <hr id='feedSecondHR' class="statusHR">
                    <p id="feedDetails">
                        {{-- event details go here --}}
                    </p>
                </div>
            </div>
        </div>
    </div>
    </div> {{-- end of blurring div --}}





    <!-- modal window for adding events -->
    <div class="modal" id="addEventModal" tabindex="-1" role="dialog" aria-hidden="true">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <button type="button" class="close" data-dismiss="modal" aria-hidden="true">×</button>
                    <h3 class="modal-title">Add an Event</h3>
                </div>
                <div class="modal-body">
                    <div class="row">  
                       <div class="col-xs-12">
                            @include('partials/addEvent')
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>




    <!-- modal window for viewing team stats -->
    <div class="modal" id="teamStatsModal" tabindex="-1" role="dialog" aria-hidden="true">
        <!-- the sport becomes a class to determine the width necessary to show all stats -->
        <div class="modal-dialog {{ $team->sport }}">
            <div class="modal-content">
                <div class="modal-header">
                    <button type="button" class="close" data-dismiss="modal" aria-hidden="true">×</button>
                    <h3 class="modal-title">Team Stats</h3>
                </div>
                <div class="modal-body">
                    <div class="container-fluid">
                        
                        {{-- links for switching tabs --}}
                    <div class="row">
                        <div class="col-xs-12 statsTabsDiv">
                            <ul class="statsTableUl">
                                <li>
                                    <a id="recentTab" class="statsTabActive">RECENT</a>
                                </li>
                                <li>
                                    <a id="seasonTab" class="statsTabInactive">SEASON</a>
                                </li>
                            </ul>
                        </div>
                    </div>

                    {{-- begin stat tables --}}
                    <div class="row">
                        <div id='statsTableDiv' class="col-xs-12 stats-table-div">
                            <div id='recentStatsDiv' class="statsDivActive table-responsive">


                                <rc-stats></rc-stats>


                            </div>
                            <div id='seasonStatsDiv' class="statsDivInactive text-center">
                                <p>This is where season stats will go</p>
                            </div>
                        </div>
                    </div>

                    </div>
                    
                </div>
            </div>
        </div>
    </div>


    <!-- modal window for viewing an event from the calendar, dynamically filled with ajax -->
    <div class="modal" id="events-modal">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>
                    <h3 id="editModalTitle" class="modal-title"></h3>
                </div>
                <div id="editEventModalBody" class="modal-body">

                </div>
            </div>
        </div>
    </div>
    </div> {{-- end of teamVueApp div --}}


<script src="/js/teamVueApp.js"></script>
<script src="/js/textarea-autoresize.js"></script>







@stop

<script>
    @section('scripts')


    //initialize calendar variables
    var options = {
        events_source: '/team/{!! $team->teamname !!}/getEvents', //get events with ajax
        modal: '#events-modal',
        start_week: '{!! $week !!}',

        onAfterEventsLoad: function(events)
        {
            if(!events)
            {
                return;
            }
            var list = $('#eventlist');
            list.html('');
            $.each(events, function(key, val)
            {
                $(document.createElement('li'))
                        .html('<a href="' + val.url + '">' + val.title + '</a>')
                        .appendTo(list);
            });
        },


        //after calendar loads, set the current month in the <h3> tag
        onAfterViewLoad: function(view)
        {
            var month = this.getTitle();
            $('#calNavHeader').text(month);
        },

        //after the modal is closed, do a quick refresh in case new data
        onAfterModalHidden: function() {

            calendar.view();

        },

        classes: {
            months: {
                general: 'label'
            }
        }
    };

    //instantiate calendar
    var calendar = $('#calendar').calendar(options);


    $('td[data-cal-nav]').click(function() {

       calendar.navigate($(this).data('cal-nav'));

    });


    //build news feed from ajax GET
    tz = jstz.determine().name();
    var feed;
    var feedUrl = "{{ url("/team/{$team->teamname}/getFeed") }}?tz=" + tz;
    $.ajax({
        type: 'GET',
        url: feedUrl,
        dataType: 'json',
        success: function(data) {
            //create news feed
            fillNewsFeed(data.result)

        },
        error: function() {
            feed = null;
        }

    });
    //get the new notification count for this user
    $.ajax({
        type: 'GET',
        url: '/team/<?php echo $team->teamname;?>/countNotifications',
        dataType: 'json',
        success: function(data) {
            var notifyCount = data.result;
            if(notifyCount == 0)
                $('#teamsNotifications').text('');
            else if(notifyCount > 0)
                $('#teamsNotifications').text(notifyCount);
        },
        error: function() {
        }

    });


    //create date string
    var todayDate = new Date();
    var year  = todayDate.getYear();
    var month = todayDate.getMonth();
    var day   = todayDate.getDate();

    //default to tomorrow's date at 18:00 - 20:00
    var fromDate  = new Date(1900 + year, month, day + 1, 18, 0, 0, 0);
    var toDate    = new Date(1900 + year, month, day + 1, 20, 0, 0, 0);
    var untilDate = new Date(1900 + year, month, day + 8, 20, 0, 0, 0);

    //datepickers for adding events
    var fromPicker  = $('#fromDecoy');
    var toPicker    = $('#toDecoy');
    var untilPicker = $('#untilDecoy');
    fromPicker.datetimepicker({
        toolbarPlacement: 'top',
        stepping: 5,
        sideBySide: true,
        allowInputToggle: true,
        defaultDate: fromDate,
        format: 'MMM. D \'YY h:mm a'

    }).on('dp.change', function(e) {
        //initialize 'end date' to two hours after 'start date'
        toPicker.data('DateTimePicker').minDate(e.date);
        toPicker.data('DateTimePicker').date(e.date.add(2, 'hours'));

    });



    toPicker.datetimepicker({
        toolbarPlacement: 'top',
        stepping: 5,
        sideBySide: true,
        allowInputToggle: true,
        defaultDate: toDate,
        format: 'MMM. D \'YY h:mm a'

    }).on('dp.change', function(e) {
        //make the 'repeat days' minDate at least the ending date
        //set minimum date to the 'end date'
        untilPicker.data('DateTimePicker').minDate(e.date);

        //set default date to a week after end date
        untilPicker.data('DateTimePicker').date(e.date.add(7, 'days'));
    });

    untilPicker.datetimepicker({
        toolbarPlacement: 'top',
        stepping: 5,
        allowInputToggle: true,
        defaultDate: untilDate,
        format: 'MMM. D \'YY'
    });





    //for controlling tabs on this page
    var teamTableDiv = $('div.teamTableDiv');
    teamTableDiv.on('click', 'a.aboutTabInactive', function() {

        //pass in what tab was clicked, switch tabs
        switchTeamTableTabs($(this));
    });

    $('#statsTab').on('click', function() {
        //launch teamStats modal
        $('#teamStatsModal').modal('show');
    });

    //switch stats tabs
    var statsTabsDiv = $('div.statsTabsDiv');
    statsTabsDiv.on('click', 'a.statsTabInactive', function() {
        switchStatsTableTabs();
    });





    //for hovering over the chevrons
    $("#chevLeft")
            .mouseover(function() {
                var src = "/images/chevLeftHover.png";
                $(this).children().attr("src", src);
            })
            .mouseout(function() {
                var src = "/images/chevLeft.png";
                $(this).children().attr("src", src);
            });

    $("#chevRight")
            .mouseover(function() {
                var src = "/images/chevRightHover.png";
                $(this).children().attr("src", src);
            })
            .mouseout(function() {
                var src = "/images/chevRight.png";
                $(this).children().attr("src", src);
            });


    $('#iconTip').tooltip({
        delay: { show: 600, hide: 0 },
        placement: 'left'
    });





    var addEventModal = $('#addEventModal');
    var addEventDiv = $('#addEventDiv');




    var repeatDiv = $('#repeatDaysDiv');
    //if checkbox is not checked, hide message box
    $('#repeatCheckbox').click(function() {

        var divHeight;


        if ($(this).is(':checked')) {

            repeatDiv.show();
            divHeight = addEventDiv.outerHeight() + 10;
            repeatDiv.hide();

            addEventModal.find('.modal-body').animate({height: divHeight}, 200);
            repeatDiv.slideDown(200);
        }
        else {
            divHeight = addEventDiv.outerHeight() + 10 - repeatDiv.height();
            addEventModal.find('.modal-body').animate({height: divHeight}, 200);
            repeatDiv.slideUp(200);

        }

    });

    var cancelHit = 0;
    $('#cancelButton').click(function() {
        //they hit the 'discard event' button
        cancelHit = 1;
        addEventModal.modal('hide');
    });

    addEventModal.on('hidden.bs.modal', function() {
        //if they hit discard, throw out all the data, otherwise save it
        if(cancelHit) {
            addEventDiv.find('input:text').val('');
            addEventDiv.find('textarea').val('');
            addEventDiv.find('.selectpicker').selectpicker('deselectAll').selectpicker('refresh');
            addEventDiv.find('input:checkbox').attr('checked', false);
            repeatDiv.hide();
            fromPicker.data('DateTimePicker').date(fromDate);
            toPicker.data('DateTimePicker').date(toDate);
            cancelHit = 0;
        }
    });

    $('#addEventForm').on('submit', function(e) {

        var form = $(this);
        var url = form.prop('action');
        $('#timezone').val(tz);

        //store full moment strings, not just small formats
        var newDate = fromPicker.data('DateTimePicker').date()._d;
        $('#from').val(newDate);
        newDate = toPicker.data('DateTimePicker').date()._d;
        $('#to').val(newDate);
        newDate = untilPicker.data('DateTimePicker').date()._d;
        $('#until').val(newDate);

        $.ajax({
            type: 'POST',
            url: url,
            data: form.serialize(),
            success: function() {
                //close modal, delete form data
                cancelHit = 1;
                addEventModal.modal('hide');
                calendar.view();
            }

        });

        e.preventDefault();
    });

    var postText = $('#postText');
    var newFeedPost = $('#newFeedPost');

    postText.on('keypress', function(e){
        if(e.which == 13) {
            newFeedPost.submit();
            postText.val('');
        }
    });

    var newPostCount = 0;
    newFeedPost.on('submit', function(e) {
        var form = $(this);
        var postUrl = form.prop('action');
        $('#timezonePost').val(tz);

        $.ajax({
            type: 'POST',
            url: postUrl,
            dataType: 'json',
            data: form.serialize(),
            success: function(data) {
                //get new data, animate new post showing up on feed
                animateNewFeedPost(data.result, newPostCount);
                newPostCount++;
                postText.val('');
            }

        });
        e.preventDefault();
    });


    //for animating things with animate.css
    animations();


    $('#addEventTrigger').on('click', function() {
        $('#addEventModal').modal('show');
    });

    //
    $('#postText').textareaAutoSize();

    



    








    @stop
</script>
