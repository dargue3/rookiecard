@extends('master')

@section('head')

<title>{{ $user->username }}</title>

<link href="//fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">

@stop






@section('content')


    <!-- profile picture -->
    <div class="container-fluid">
        <div class="row">
        <div class="col-xs-6 col-sm-6 col-xs-offset-3 col-md-2 col-md-offset-0 col-lg-2">
            <div class="side-bar">
                <ul>
                    <li id='become-fan'>
                        <a>Become a Fan</a>
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
        <div class="col-xs-10 col-sm-10 col-xs-offset-1 col-md-6 col-lg-6 col-md-offset-1"> 
            <img src="{!! $userOptions['proPic'] !!}" class="img-thumbnail proPic" width="320" height="320">
        </div>
    </div>





    <div class="row-fluid">
        <div id="profileDiv" class="col-xs-12 col-sm-10 col-sm-offset-1 col-md-8 col-md-offset-2 contentDiv">
           {{-- @include('partials/banners')--}}

            <div id="profileIcons">

                    @if($owner)
                        <a id="iconTip" data-toggle="tooltip" title="edit your rookiecard" href="/{{ $user->username }}/edit">
                            <i id="editProfileIcon" class="glyphicon glyphicon-pencil"></i>
                        </a>
                    @elseif(!$owner && !$isFan)
                        <a id="iconTip" data-toggle="tooltip" title="become a fan of {!! $user->firstname !!}" href="/{{ $user->username }}/fan">
                            <i><img id="becomeFanIcon" src="/images/addFan.png"></i>
                        </a>
                    @elseif(!$owner && $isFan)
                        <a id="iconTip" data-toggle="tooltip" title="unfan {!! $user->firstname !!}" href="/{{ $user->username }}/unfan">
                            <i><img id="isFanIcon" src="/images/isFan.png"></i>
                        </a>
                    @endif

            </div>
            <div>

                <h2 id="name">
                    @if(isset($userOptions['jersey_num']))
                        <special id="jerseyNumber">{{$userOptions['jersey_num']}}</special>
                        <special id="numberDivider"> |</special>
                    @endif{{$user->firstname . " " . $user->lastname}}

                </h2>
            </div>

            <div class="userAboutTableDiv">
                <ul class="userAboutTableUl">
                    <li>
                        <a class="aboutTabActive"><i id='profileAboutIcon' class="material-icons">face</i>ABOUT</a>
                    </li>
                    <li>
                        <a class="aboutTabInactive"><i id='profileMetricsIcon' class="material-icons">accessibility</i>METRICS</a>
                    </li>

                </ul>
            </div>

            <div id="aboutUserDiv" class="aboutDivActive">
                <table class="table-responsive aboutUserTable">
                    <tr>
                        <td class="aboutUserLabel">AGE<br>
                            <special class="aboutUserTableData">{{ $age }}</special></td>
                        <td class="aboutUserLabel">GENDER<br>
                            <special class="aboutUserTableData">Male</special></td>
                        <td class="aboutUserLabel">LOCATION<br>
                            <special class="aboutUserTableData">03801</special></td>
                        <td class="aboutUserLabel">
                            @if(!empty($userFans))
                                <a id="fans">FANS<br>
                                    <special class="aboutUserTableData">{!! count($userFans) !!}</special></a>
                            @else
                                <span>FANS<br>
                                    <special class="aboutUserTableData">{!! count($userFans) !!}</special></span>
                            @endif
                        </td>


                    </tr>
                </table>
                <br>
                <br>
                <table>
                    <tr>
                        <td id="sportsList">Sports:</td>
                        <td>&nbsp;&nbsp;none yet, fucking go outside!</td>
                    </tr>
                </table>
                <br>
                <br>
                <table>
                    <tr>
                        <td>Team:</td>
                        <td>&nbsp;&nbsp;none yet, find some friends!</td>
                    </tr>
                </table>
                <br>
                <br>
                <table>
                    <tr>
                        <td>Honors:</td>
                        <td>&nbsp;&nbsp;yeah right</td>
                    </tr>
                </table>
            </div>

            <!-- metrics table dynamically built -->

            <div id="userMetricsDiv" class="hidden">
                <table class="table-responsive aboutUserTable">
                    <tr>
                        @foreach($userMetrics as $tag => $val)

                            <td class="aboutUserLabel">{{ $tag }}
                                <br>
                                <special class="aboutUserTableData">{{ $val }}</special>
                            </td>

                            <!-- if you've got 3 in a row, start new table -->
                            @if($counter % 3 == 2)
                                </tr>
                                </table>
                                <br>
                                <table class="table-responsive aboutUserTable">
                                    <tr>
                            @endif
                            <?php $counter++; ?>
                        @endforeach
                    </tr>
                </table>
            </div>

        </div>

        <div class="col-xs-6 col-xs-offset-3 col-md-2 col-md-offset-0 col-lg-2 ads">
            <p>ads ads ads ads ads</p>
            <p>ads ads ads ads ads</p>
            <p>ads ads ads ads ads</p>
            <p>ads ads ads ads ads</p>
            <p>ads ads ads ads ads</p>
        </div>
    </div>

    <div class="row-fluid">
        <div class="col-xs-12 col-sm-10 col-sm-offset-1 col-md-8 col-md-offset-2 bannerDiv">
            @include('partials/banners')
        </div>
    </div>

    <div class="row-fluid">
        <div id="rankedStatsDiv" class="col-xs-12 col-sm-10 col-sm-offset-1 col-md-8 col-md-offset-2 contentDiv">
        <h3>Ranked Stats</h3>
        <hr>

        </div>



        <div class="col-xs-6 col-xs-offset-3 col-md-2 col-md-offset-0 col-lg-2 ads">
            <p>ads ads ads ads ads</p>
        </div>

    </div>

    <div class="row-fluid">
        <div class="col-xs-12 col-sm-10 col-sm-offset-1 col-md-8 col-md-offset-2 contentDiv">
            <h3>Personal Stats</h3>
            <hr>

        </div>



        <div class="col-xs-6 col-xs-offset-3 col-md-2 col-md-offset-0 col-lg-2 ads">
            <p>ads ads ads ads ads</p>
        </div>

    </div>

    <div class="row-fluid">
        <div class="col-xs-12 col-sm-10 col-sm-offset-1 col-md-8 col-md-offset-2 contentDiv"
                style="height:1000px;">
            <h3>Feed</h3>
            <hr>

        </div>



        <div class="col-xs-6 col-xs-offset-3 col-md-2 col-md-offset-0 col-lg-2 ads">
            <p>ads ads ads ads ads</p>
            <p>ads ads ads ads ads</p>
            <p>ads ads ads ads ads</p>
            <p>ads ads ads ads ads</p>
            <p>ads ads ads ads ads</p>
        </div>

    </div>






    <!-- Modal -->
    <div class="modal modal-vcenter fade" id="fansModal" tabindex="-1" role="dialog" aria-hidden="true">
        <div class="modal-dialog modal-sm">
            <div class="modal-content">
                <button type="button" class="close modalClose" data-dismiss="modal" aria-hidden="true">×</button>
                <div class="modal-header">
                    <h4 class="modal-title modalTitle">Fans of {{ $user->firstname . " " . $user->lastname }}</h4>
                </div>
                <div class="modal-body fansModal">
                    <br>
                    <ul>
                        @if(!empty($userFans))
                            @foreach($userFans as $name => $username)
                                <li>
                                    <a href="/{{ $username }}">{{ $name }}</a>
                                </li>
                            @endforeach
                        @endif
                    </ul>
                </div>
            </div>
        </div>
    </div>
    </div>
    

    <script src="/js/vueApp.js"></script>

@stop

<script>


        @section('scripts')

        var aboutTableDiv = $('div.userAboutTableDiv');

        aboutTableDiv.on('click', 'a.aboutTabInactive', switchAboutUserTabs);


        $("#becomeFanIcon")
                .mouseover(function() {
                    var src = "/images/addFanHover.png";
                    $(this).attr("src", src);
                })
                .mouseout(function() {
                    var src = "/images/addFan.png";
                    $(this).attr("src", src);
                });

        $("#isFanIcon")
                .mouseover(function() {
                    var src = "/images/isFanHover.png";
                    $(this).attr("src", src);
                })
                .mouseout(function() {
                    var src = "/images/isFan.png";
                    $(this).attr("src", src);
                });


        var modal = $('.modal-vcenter');

        $('#fans').click(function() {
            modal.modal('show');
        });


        modal.on('show.bs.modal', function(e) {
            centerModals($(this));
        });
        $(window).on('resize', centerModals);



        $('#iconTip').tooltip({
            delay: { show: 600, hide: 0 },
            placement: 'left'
        });



    @stop



</script>