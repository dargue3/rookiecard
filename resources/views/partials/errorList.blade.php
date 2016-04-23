@if ($errors->any())
    <div class="form-errors">
        @foreach($errors->all() as $error)
            <p>{!! strtolower($error) !!}</p>
        @endforeach
    </div>
@endif