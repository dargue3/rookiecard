
@extends('master')

@section('head')
    <script type="text/javascript" src="{{ asset('/js/bday-picker.min.js')}}"></script>
@stop

@section('content')

        <br>
        <br>
        <br>
        <br>
        <div class="row">
            <div class="col-xs-12 col-sm-8 col-md-6 col-sm-offset-2 col-md-offset-3 contentDiv">
                {!! Form::open(['url' => '/register']) !!}
                    <h2>Sign up&nbsp;<small>it's free!</small></h2>
                    <hr>

                    @include('partials/errorList')

                    <div class="row">
                        <div class="col-xs-12 col-sm-6 col-md-6">
                            <div class="form-group">
                                {!! Form::text('firstname', $value = NULL, $attribute = array('id' => "first_name", 'class' => "form-control input-lg",
                                        'placeholder' => "first name",  'tabindex' => "1"))  !!}
                            </div>
                        </div>
                        <div class="col-xs-12 col-sm-6 col-md-6">
                            <div class="form-group">
                                {!! Form::text('lastname', $value = NULL, $attribute = array('id' => "last_name", 'class' => "form-control input-lg",
                                        'placeholder' => "last name",  'tabindex' => "2"))  !!}
                            </div>
                        </div>
                    </div>
                    <div class="form-group">
                        {!! Form::text('username', $value = NULL, $attribute = array('id' => "username", 'class' => "form-control input-lg",
                                        'placeholder' => "username",  'tabindex' => "3", 'style' => 'margin-bottom: 5px;'))  !!}
                        <small style="color: #777777; padding-left:2px;">Your profile will be accessible from rookiecard.com/username</small>
                    </div>
                    <div class="form-group">
                        {!! Form::email('email', $value = NULL, $attribute = array('id' => "email", 'class' => "form-control input-lg",
                                        'placeholder' => "email",  'tabindex' => "4"))  !!}
                    </div>
                    <div class="row">
                        <div class="col-xs-12 col-sm-6 col-md-6">
                            <div class="form-group">
                                {!! Form::password('password', $attribute = array('id' => "password", 'class' => "form-control input-lg",
                                        'placeholder' => "password",  'tabindex' => "5"))  !!}
                            </div>
                        </div>
                        <div class="col-xs-12 col-sm-6 col-md-6">
                            <div class="form-group">
                                {!! Form::password('password_confirmation', $attribute = array('id' => "password_confirmation", 'class' => "form-control input-lg",
                                        'placeholder' => "confirm password",  'tabindex' => "6"))  !!}
                            </div>
                        </div>
                    </div>

                    <div class="form-group">
                        <h4>Birthday</h4>
                        <div class="picker" id="picker1"></div>
                    </div>
                    <br>
                    <div class="form-group">
                        {!! Form::radio('gender', '0') !!}&nbsp;&nbsp;male&nbsp;&nbsp;&nbsp;&nbsp;

                        {!! Form::radio('gender', '1') !!}&nbsp;&nbsp;female
                    </div>
                    <hr>
                    <div class="form-group">
                        <p id="reg_termsAndConditions">By registering, you agree to the <a href="#" data-toggle="modal" data-target="#t_and_c_m">Terms and Conditions</a> set out by this site, including our cookie use.</p>
                    </div>
                    <hr>

                    <div class="row">
                        <div class="col-xs-12 col-md-6 col-md-offset-3">{!! Form::submit('Register', array('class' => "btn btn-primary btn-block btn-lg", 'tabindex' => "7")) !!}</div>
                    </div>
                {!! Form::close() !!}
            </div>
        </div>

        <!-- Modal -->
        <div class="modal modal-vcenter fade" id="t_and_c_m" tabindex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header text-center">
                        <button type="button" class="close" data-dismiss="modal" aria-hidden="true">×</button>
                        <h4 class="modal-title" >Terms and Conditions</h4>
                    </div>
                    <div class="modal-body">
                        <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Similique, itaque, modi, aliquam nostrum at sapiente consequuntur natus odio reiciendis perferendis rem nisi tempore possimus ipsa porro delectus quidem dolorem ad.</p>
                        <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Similique, itaque, modi, aliquam nostrum at sapiente consequuntur natus odio reiciendis perferendis rem nisi tempore possimus ipsa porro delectus quidem dolorem ad.</p>
                        <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Similique, itaque, modi, aliquam nostrum at sapiente consequuntur natus odio reiciendis perferendis rem nisi tempore possimus ipsa porro delectus quidem dolorem ad.</p>
                        <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Similique, itaque, modi, aliquam nostrum at sapiente consequuntur natus odio reiciendis perferendis rem nisi tempore possimus ipsa porro delectus quidem dolorem ad.</p>
                        <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Similique, itaque, modi, aliquam nostrum at sapiente consequuntur natus odio reiciendis perferendis rem nisi tempore possimus ipsa porro delectus quidem dolorem ad.</p>
                        <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Similique, itaque, modi, aliquam nostrum at sapiente consequuntur natus odio reiciendis perferendis rem nisi tempore possimus ipsa porro delectus quidem dolorem ad.</p>
                        <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Similique, itaque, modi, aliquam nostrum at sapiente consequuntur natus odio reiciendis perferendis rem nisi tempore possimus ipsa porro delectus quidem dolorem ad.</p>
                    </div>
                </div><!-- /.modal-content -->
            </div><!-- /.modal-dialog -->
        </div><!-- /.modal -->


@stop
<script>
@section('scripts')


  $("#picker1").birthdaypicker({});

    $('.modal-vcenter').on('show.bs.modal', function(e) {
        centerModals($(this));
    });
    $(window).on('resize', centerModals);


@stop

</script>