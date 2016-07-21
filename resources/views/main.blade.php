<!DOCTYPE html>
<html>
<head>
	<title>rookiecard</title>

    <!-- CREDITS:
        'become fan' icon based on design by James Keuning, taken from thenounproject.com  

     -->


	<meta charset="UTF-8">

    <meta id="_token" value="{{ csrf_token() }}">

	{{-- jquery is required for bootstrap, keep above --}}
	<script type="text/javascript" src="/js/jquery.min.js"></script>

	{{-- fonts --}}
	<link href='https://fonts.googleapis.com/css?family=Lobster' rel='stylesheet' type='text/css'>
	<link href="//fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
    <link href='https://fonts.googleapis.com/css?family=Monda' rel='stylesheet' type='text/css'>

    <!-- css -->
    <link rel="stylesheet" href="/css/bootstrap.min.css">
    <link rel="stylesheet" href="/css/bootstrap-theme.min.css">
    <link rel="stylesheet" href="/css/bootstrap-select.min.css">
    <link rel="stylesheet" href="/css/dropzone.css">
    <link rel='stylesheet' href='/css/sweetalert.css'>
    <link rel='stylesheet' href='/css/bootstrap-switch.css'>
    <link rel="stylesheet" href="/bower_components/bootstrap-calendar/css/calendar.css">
    <link rel='stylesheet' href='/css/animate.css-master/animate.css'></link>
    <link rel="stylesheet" href="/bower_components/eonasdan-bootstrap-datetimepicker/build/css/bootstrap-datetimepicker.min.css">
    <link rel="stylesheet" href="/css/stylus.css">
    <link rel="stylesheet" href="/css/variables.css">
    
    
    <!-- js -->
    <script src="/js/bootstrap.min.js"></script>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <script src="/js/sweetalert.min.js"></script>
    <script src="/js/jstz-1.0.4.min.js"></script>
    <script src="/js/bootstrap-switch.js"></script>
    <script src="/js/bootstrap-select.min.js"></script> 
    <script src='/js/nav.js'></script>
    <script src='/js/pace.js'></script>
    <script src='/js/dropzone.js'></script>
    <script src="/bower_components/moment/moment.js"></script>
    <script src="/bower_components/eonasdan-bootstrap-datetimepicker/src/js/bootstrap-datetimepicker.js"></script>
    <script src="/bower_components/underscore/underscore-min.js"></script>
    <script src="/bower_components/bootstrap-calendar/js/calendar.js"></script>
    <script src="https://maps.googleapis.com/maps/api/js?key=AIzaSyCf4vUwd6gaSpnY7JugcUz0bQyML893Q3k&libraries=places"></script>

    <!-- favicon -->
    <link rel="shortcut icon" href="/favicon.ico" type="image/x-icon">
    <link rel="icon" href="/favicon.ico" type="image/x-icon">


</head>
<body>


<!-- vuejs is mounted here -->
<div id="app" data-user-id="{{ Auth::user()->id }}">
    <app></app>
</div>


<script src='/js/routes.js'></script>


    {{-- store timezone in session variables --}}
    @if (!Session::has('timezone') || !Session::has('locale'))
        <script>
            $(function () {
                var tz = jstz.determine();
                var locale = navigator.language;
                var data = {};
                if (typeof (tz) !== 'undefined') {
                    data.timezone = tz.name();
                }
                if (locale) {
                    data.locale = navigator.language;
                }
                if (!$.isEmptyObject(data)) {
                    $.ajax({
                        type: "POST",
                        url: "{{ url('/api/v1/settings/auth') }}",
                        beforeSend: function (request) {
                            request.setRequestHeader("X-CSRF-TOKEN", "{{ csrf_token() }}");
                        },
                        data: $.param(data),
                    });
                }
            });
        </script>
    @endif


</body>
</html>






