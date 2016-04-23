@extends('master')


@section('content')

    <div class="container-fluid">
        <br><br><br>
        <div class="col-xs-12 col-sm-8 col-md-6 col-sm-offset-2 col-md-offset-3 contentDiv wrapper">

            

            {!! Form::open(['url' => '/login']) !!}
            <h2 class="form-signin-heading text-center">Login</h2>
            <hr>

            @include('partials/errorList')

            <div class="form-group">
                {!! Form::email('email', $value = NULL, $attribute = array('id' => "email", 'class' => "form-control",
                                  'placeholder' => "email",  'tabindex' => "1", 'autofocus', 'required'))  !!}
            </div>
            <div class="form-group">
                {!! Form::password('password', $attribute = array('id' => "password", 'class' => "form-control",
                                    'placeholder' => "password",  'tabindex' => "2", 'required'))  !!}
            </div>

            <div class="form-group">
                {!! Form::checkbox('remember', $value = '1', $attribute = array('id' => "remember", 'tabindex' => "3", 'checked'))  !!}
                     &nbsp;remember me
            </div>
            <div class="row">
                <div class="col-sm-6 col-sm-offset-3">
                    {!! Form::submit('Sign In', array('class' => "btn btn-lg btn-primary btn-block", 'tabindex' => "4")) !!}
                </div>
            </div>
            {!! Form::close() !!}
            <br>
            <div class="row">
                <div class="col-xs-12 text-center">
                    <a href="/register">or click here to register</a>
                </div>
            </div>
        </div>

    </div>
    


@stop

