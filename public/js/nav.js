$(function () {


    


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

    $('#hamburger').on('click', function(){
        $('#searchBar').select();
    });    


    if($(window).width() <= 767) {

      //collapse navbar if on mobile and link is clicked
      $('nav.navbar-fixed-top').on('click', '.nav-link', function(){
          
          $('#navbar-left').collapse('toggle');
          $('#hamburger').focusout();

      });
      $('#navLogo').on('click', function(){
          $('#navbar-left').collapse('toggle');
          $('#hamburger').focusout();
      });
    }


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
        teamCaret.toggleClass( "right-spinner").delay(100).toggleClass('upside-down');
    });
    teamDropdown.on('hide.bs.dropdown', function(e){
        $(this).find('.dropdown-menu').first().stop(true, true).fadeOut(100);
        if(teamCaret.hasClass('right-spinner')) {
            teamCaret.toggleClass('right-spinner')
        }
        teamCaret.toggleClass( "left-spinner").delay(100).toggleClass('upside-down')
    });

    optionsDropdown.on('show.bs.dropdown', function(e){
        $(this).find('.dropdown-menu').first().stop(true, true).fadeIn(100);
        if(optionsCaret.hasClass('left-spinner')) {
            optionsCaret.toggleClass('left-spinner')
        }
        optionsCaret.toggleClass( "right-spinner").delay(100).toggleClass('upside-down');
    });
    optionsDropdown.on('hide.bs.dropdown', function(e){
        $(this).find('.dropdown-menu').first().stop(true, true).fadeOut(100);
        if(optionsCaret.hasClass('right-spinner')) {
            optionsCaret.toggleClass('right-spinner')
        }
        optionsCaret.toggleClass( "left-spinner").delay(100).toggleClass('upside-down')
    });

});