
    <div id="addEventDiv" class="col-xs-12 contentDiv" style="box-shadow:none">
    {!! Form::open(['url' => "/team/$team->teamname/postNewEvent", 'id' => 'addEventForm']) !!}
    {!! Form::hidden('tz', null, array('id' => 'timezone')) !!}

    <div class="row">
        <div class="form-group form-group-lg">
            <div class="col-xs-12 col-sm-6">
                <label for="eventName">Title</label>
                {!! Form::text('eventName', null, array('class' => 'form-control input-lg',
                                                    'placeholder' => '@ Georgia Tech')) !!}
            </div>
            <div class="col-xs-12 col-sm-6">
                <label for="eventClass">Type</label>
                <select id="eventClass" class="selectpicker form-control show-tick"
                        name="eventClass" data-style="btn-select btn-lg">
                    <option value='1' class="gameClass">Game</option>
                    <option value='0' class="practiceClass">Practice</option>
                    <option value='2' class="otherClass">Other</option>
                </select>
            </div>
        </div>
    </div>
    <br>
    <div class="row">
        <div class='col-xs-12 col-sm-6'>
            <div class="form-group">
                <label for="from">Starts at...</label>
                <div class='input-group date' id="fromDecoy">
                    {!! Form::text('fromDecoy', null, array('class' => 'form-control')) !!}
                    <span class="input-group-addon">
                        <span class="glyphicon glyphicon-calendar"></span>
                    </span>
                </div>
                <div class="hide">
                    {!! Form::text('from', null, array('id' => 'from')) !!}
                </div>
            </div>
        </div>
        <div class='col-xs-12 col-sm-6'>
            <div class="form-group">
                <label for="to">Ends at...</label>
                <div class='input-group date' id="toDecoy">
                    {!! Form::text('toDecoy', null, array('class' => 'form-control')) !!}
                    <span class="input-group-addon">
                        <span class="glyphicon glyphicon-calendar"></span>
                    </span>
                </div>
                <div class="hide">
                    {!! Form::text('to', null, array('id' => 'to')) !!}
                </div>
            </div>
        </div>
    </div>
    <br>
    <div class="row">
        <div class="col-xs-12">
            <div class="form-group">
                {!! Form::checkbox('repeat', 1, 0, array('id' => 'repeatCheckbox')) !!}
                    {{-- <special id="addEventRepeats">&nbsp;&nbsp;This event repeats...</special> --}}
            </div>

        </div>
    </div>
    <div id="repeatDaysDiv" class="row" style="display:none;">
        <div class="form-group">
            <div class="col-xs-12 col-sm-6">
                <label for="repeatDays">Every...</label>
                <select name="repeatDays[]" class="selectpicker form-control show-tick" data-style="btn-select btn-lg"
                        data-selected-text-format="count>2" title="" multiple>
                    <option>Sunday</option>
                    <option>Monday</option>
                    <option>Tuesday</option>
                    <option>Wednesday</option>
                    <option>Thursday</option>
                    <option>Friday</option>
                    <option>Saturday</option>
                </select>
            </div>
            <div class="col-xs-12 col-sm-6">
                <label for="until">Until...</label>
                <div class='input-group date' id="untilDecoy">
                    {!! Form::text('untilDecoy', null, array('class' => 'form-control')) !!}
                    <span class="input-group-addon">
                                            <span class="glyphicon glyphicon-calendar"></span>
                                        </span>
                </div>
            </div>
            <div class="hide">
                {!! Form::text('until', null,  array('id' => 'until')) !!}
            </div>
            <br>
        </div>
    </div>
    <br>
    <div id="eventDetailsDiv" class="row">
        <div class="col-xs-12">
            <label for="eventClass">Extra details about this event</label>
            {!! Form::textarea('details', null, array('class' => 'form-control', 'rows' => 3, 'maxlength' => 1000,
                                                'placeholder' => 'Remember your water bottle!')) !!}
        </div>
    </div>
    <br>
    <hr>
    <br>
    <br>

    <div class="row">
        <div class="col-xs-12 col-sm-4 col-sm-offset-2">
            {!! Form::submit('Save Event', array('class' => "btn btn-primary btn-block btn-md", 'tabindex' => "4")) !!}
        </div>
        <div class="col-xs-12 col-sm-4">
            <a data-dismiss="modal" id="cancelButton" class="btn btn-cancel btn-block btn-md" tabindex="5">
                Discard Event
            </a>
        </div>
    </div>
    {!! Form::close() !!}
</div>
   

