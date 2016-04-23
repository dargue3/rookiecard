<!DOCTYPE html>
<html>
    <head>
    
        <!-- CREDITS

        "Become Fan" icon by James Keuning, taken from Noun Project

        -->


        <meta charset="UTF-8">

        <meta id="_token" value="{{ csrf_token() }}">
        
        <!-- jquery -->
        <script type="text/javascript" src="https://ajax.googleapis.com/ajax/libs/jquery/2.1.3/jquery.min.js"></script>


        <!-- css -->
        <link href='https://fonts.googleapis.com/css?family=Lobster' rel='stylesheet' type='text/css'>
        <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.5/css/bootstrap.min.css">
        <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.5/css/bootstrap-theme.min.css">
        <link href="//cdnjs.cloudflare.com/ajax/libs/select2/4.0.0/css/select2.min.css" rel="stylesheet">
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/bootstrap-select/1.7.3/css/bootstrap-select.min.css">
        <link rel="stylesheet" href="/css/stylus.css">
        <link rel='stylesheet' href='/css/sweetalert.css'></link>

        <!-- js -->
        <script type="text/javascript" src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.5/js/bootstrap.min.js"></script>
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/select2/4.0.0/js/select2.min.js"></script>
        <script type="text/javascript" src="/js/scripts.js"></script>
        <script type="text/javascript" src="/js/jstz-1.0.4.min.js"></script>
        <script type="text/javascript" src="//cdnjs.cloudflare.com/ajax/libs/bootstrap-select/1.7.3/js/bootstrap-select.min.js"></script>
        <script type="text/javascript" src="/js/sweetalert.min.js"></script>



        <!-- for hiding the navbar -->
        <script src="/js/jquery.bootstrap-autohidingnavbar.js"></script>


        <!-- favicon -->
        <link rel="shortcut icon" href="/favicon.ico" type="image/x-icon">
        <link rel="icon" href="/favicon.ico" type="image/x-icon">





        @yield('head')



    </head>
    <body>

        @include('partials/nav')

        @yield('content')
        
        @include('partials/footer')

        <script>



            $(function () {
            

                @yield('scripts')

                $("nav.navbar-fixed-top").autoHidingNavbar();

            
                //glow logo
                $("#navLogo")
                    .mouseover(function() {
                        var src = "/images/logoHover.png";
                        $(this).attr("src", src);
                    })
                    .mouseout(function() {
                        var src = "/images/logo.png";
                        $(this).attr("src", src);
                    });




                //animate the searchbar icon
                var searchBar  = $('#searchBar');
                var searchIcon = $('#searchIcon');
                searchBar.focus(function() {
                    if(searchIcon.hasClass('left-spinner')) {
                        searchIcon.toggleClass('left-spinner')
                    }
                    searchIcon.toggleClass( "right-spinner").delay(100).toggleClass('rotatedRight');
                });
                searchBar.focusout(function() {
                    if(searchIcon.hasClass('right-spinner')) {
                        searchIcon.toggleClass('right-spinner')
                    }
                    searchIcon.toggleClass( "left-spinner").delay(100).toggleClass('rotatedRight')
                });
 



                //animate the dropdown options menu in nav
                var teamDropdown = $('#teamDropdown');
                var optionsDropdown = $('#optionsDropdown');
                var teamCaret = $('#teamCaret');
                var optionsCaret = $('#optionsCaret');

                teamDropdown.on('show.bs.dropdown', function(e){
                    $(this).find('.dropdown-menu').first().stop(true, true).fadeIn(100);
                    if(teamCaret.hasClass('left-spinner')) {
                        teamCaret.toggleClass('left-spinner')
                    }
                    teamCaret.toggleClass( "right-spinner").delay(100).toggleClass('upsideDown');
                });
                teamDropdown.on('hide.bs.dropdown', function(e){
                    $(this).find('.dropdown-menu').first().stop(true, true).fadeOut(100);
                    if(teamCaret.hasClass('right-spinner')) {
                        teamCaret.toggleClass('right-spinner')
                    }
                    teamCaret.toggleClass( "left-spinner").delay(100).toggleClass('upsideDown')
                });

                optionsDropdown.on('show.bs.dropdown', function(e){
                    $(this).find('.dropdown-menu').first().stop(true, true).fadeIn(100);
                    if(optionsCaret.hasClass('left-spinner')) {
                        optionsCaret.toggleClass('left-spinner')
                    }
                    optionsCaret.toggleClass( "right-spinner").delay(100).toggleClass('upsideDown');
                });
                optionsDropdown.on('hide.bs.dropdown', function(e){
                    $(this).find('.dropdown-menu').first().stop(true, true).fadeOut(100);
                    if(optionsCaret.hasClass('right-spinner')) {
                        optionsCaret.toggleClass('right-spinner')
                    }
                    optionsCaret.toggleClass( "left-spinner").delay(100).toggleClass('upsideDown')
                });

            });
        </script>
    </body>
</html>
