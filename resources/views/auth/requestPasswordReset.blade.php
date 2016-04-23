@extends('master')

@section('content')


    <div class="col-xs-12 col-sm-8 col-md-6 col-sm-offset-2 col-md-offset-3 form-signin wrapper">

        @include('partials/banners')

        {!! Form::open(['url' => '/resetPass']) !!}
        <h2 class="form-signin-heading">request password reset</h2>
        <hr>

        @include('partials/errorList')

        <div class="form-group">
            {!! Form::email('email', $value = NULL, $attribute = array('id' => "email", 'class' => "form-control",
                              'placeholder' => "email",  'tabindex' => "1", 'autofocus' => "", 'required' => ""))  !!}
        </div>

        {!! Form::submit('send reset email', array('class' => "btn btn-lg btn-primary btn-block", 'tabindex' => "2")) !!}

        {!! Form::close() !!}
        <br>
        <a href="/login">or click here to login!</a>
    </div>


@stop