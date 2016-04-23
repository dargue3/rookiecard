@if(session('good'))
    <div class="alert alert-warning">
        <a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a>
        {{ Session::get('good') }}
    </div>
@endif
@if(session('bad'))
    <div class="alert alert-danger">
        <a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a>
        {{ Session::get('bad') }}
    </div>
@endif