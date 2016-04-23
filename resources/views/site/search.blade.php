@extends('master')

@section('head')


@stop






@section('content')
    @include('partials/banners')

        <div class="container-fluid">
            <div class="row">
            <div class="col-md-6 col-md-offset-3 contentDiv">
                <h3>Users</h3>
                <ul class="list-group searchResults">
                    @if($allUsers)
                        @foreach($allUsers as $oneUser)
                            <li class="list-group-item">
                                <a href="/{{ $oneUser->username }}">{{ $oneUser->firstname . " " . $oneUser->lastname }}</a>
                            </li>
                        @endforeach
                    @else
                        <li class="list-group-item">
                            <p>No users matched that search</p>
                        </li>
                    @endif
                </ul>
            </div>
        </div>

        <div class="row">
            <div class="col-md-6 col-md-offset-3 contentDiv">
                <h3>Teams</h3>
                <ul>

                </ul>
            </div>
        </div>
    </div>
    









@stop

<script>
    @section('scripts')

    $('#searchBar').val('{{ $fullQuery }}');




    @stop
</script>