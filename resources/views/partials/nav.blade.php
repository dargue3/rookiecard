@if(Auth::check())
    <nav class="navbar navbar-default navbar-fixed-top" role="navigation">
        <div class="container">

            {{-- logo and hamburger --}}
            <div class="navbar-header">
                <button id='hamburger' type="button" class="navbar-toggle" data-toggle="collapse" data-target="#navbar-left">
                    <span class="sr-only">Toggle navigation</span>
                    <span class="icon-bar"></span>
                    <span class="icon-bar"></span>
                    <span class="icon-bar"></span>
                </button>
                <a v-link="{name: 'home'}"><img id="navLogo" src="/images/logo.png" class="navbar-brand navbar-brand-centered"></a>
            </div>

            
            <div class="collapse navbar-collapse text-center" id="navbar-left">

                {{-- search bar --}}
                <ul class="nav navbar-nav">
                    <div id='navSearchDiv' >
                        <i class="glyphicon glyphicon-search" id="searchIcon"></i>

                        {!! Form::open(['url' => '/search', 'method' => 'GET']) !!}
                        {!! Form::input('search', 'q', null,  $attribute = array('id' => "searchBar",
                        'class' => "form-control navbar-form search-form", 'placeholder' => "Search players and teams...",
                         'tabindex' => "1", 'required' => "", 'role' => 'search', 'autocomplete' => 'off')) !!}
                        {!! Form::close() !!}
                    </div>
                </ul>

                {{-- nav links --}}
                <ul class="nav navbar-nav navbar-right">
                    <li><a v-link="{name: 'user', params: {username: 'dargue3'}}">Profile</a></li>
                    <li id='teamDropdown' class="dropdown">
                        <a class="dropdown-toggle" data-toggle="dropdown">
                            <span id="teamsNotifications" class="badge badge-danger"></span>&nbsp;Teams <span id='teamCaret' class="caret"></span></a>
                        <ul class="dropdown-menu dropdown-menu-left" role="menu">
                            <li><a v-link="{name: 'team', params: {teamname: 'gtfootball15'}}">GT Basketball 2016</a></li>
                            <li><a href="#">Rec Ultimate Frisbee</a></li>
                            <li class="divider"></li>
                            <li><a href="/logout">Create a team</a></li>
                        </ul>
                    </li>
                    <li id='optionsDropdown' class="dropdown">
                        <a href="#" id="navOptions" class="dropdown-toggle" data-toggle="dropdown">Options <span id='optionsCaret' class="caret"></span></a>
                        <ul class="dropdown-menu" role="menu">
                            <li><a href="#">Account Settings</a></li>
                            <li><a href="#">Submit Feedback</a></li>
                            <li class="divider"></li>
                            <li><a href="/logout">Log out</a></li>
                        </ul>
                    </li>
                </ul>
            </div>
        </div>
    </nav>



@else()
    <nav class="navbar navbar-default navbar-fixed-top" role="navigation">
        <div class="container">
            <div class="navbar-header">
                <a href="/"><img id="navLogo" src="/images/logo.png" class="navbar-brand navbar-brand-centered"></a>
            </div>
        </div>
    </nav>
@endif
