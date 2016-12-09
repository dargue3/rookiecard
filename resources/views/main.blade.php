<!DOCTYPE html>
<html>
<head>
	<title>rookiecard</title>

	<meta charset="UTF-8">
    <meta id="_token" value="{{ csrf_token() }}">

	<!-- jquery is required for bootstrap, keep above -->
	<script type="text/javascript" src="/js/jquery.min.js"></script>

	<!-- fonts -->
	<link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
    <link href='https://fonts.googleapis.com/css?family=Fira+Sans:400,500,700,300,400italic' rel='stylesheet' type='text/css'>
    <link href="https://fonts.googleapis.com/css?family=Monda:400,700" rel="stylesheet">

    <!-- css -->
    <link rel="stylesheet" href="/css/bootstrap.min.css">
    <link rel="stylesheet" href="/css/bootstrap-theme.min.css">
    <link rel="stylesheet" href="/css/bootstrap-select.min.css">
    <link rel="stylesheet" href="/css/dropzone.css">
    <link rel="stylesheet" href="/css/croppie.css">
    <link rel="stylesheet" href="/css/bootstrap-switch.css">
    <link rel="stylesheet" href="/bower_components/bootstrap-calendar/css/calendar.css">
    <link rel="stylesheet" href="/css/animate.css-master/animate.css"></link>
    <link rel="stylesheet" href="/bower_components/eonasdan-bootstrap-datetimepicker/build/css/bootstrap-datetimepicker.min.css">
    <link rel="stylesheet" href="/css/rc_styles.css">
    <link rel="stylesheet" href="/css/variables.css">
    
    
    <!-- js -->
    <script src="/js/bootstrap.min.js"></script>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <script src="/js/jstz-1.0.4.min.js"></script>
    <script src="/js/bootstrap-switch.js"></script>
    <script src="/js/bootstrap-select.min.js"></script> 
    <script src="/js/pace.js"></script>
    <script src="/js/dropzone.js"></script>
    <script src="/js/croppie.js"></script>
    <script src="/bower_components/moment/moment.js"></script>
    <script src="/bower_components/eonasdan-bootstrap-datetimepicker/src/js/bootstrap-datetimepicker.js"></script>
    <script src="/bower_components/underscore/underscore-min.js"></script>
    <script src="/bower_components/bootstrap-calendar/js/calendar.js"></script>
    <script src="https://maps.googleapis.com/maps/api/js?key=AIzaSyB1owCjwNQ_oRU2mDULAPLDj5oEdu-xj9c&libraries=places"></script>

    <!-- favicon -->
    <link rel="shortcut icon" href="/favicon.ico" type="image/x-icon">
    <link rel="icon" href="/favicon.ico" type="image/x-icon">


</head>
<body>


<!-- vuejs is mounted here -->
<div id="app" auth-id="{{ $auth->id }}">
    <app></app>
</div>


<script src='/js/app.js'></script>


    {{-- store timezone in session variables --}}
    @if (! $timezone || ! $locale)
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






