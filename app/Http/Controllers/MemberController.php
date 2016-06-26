<?php

namespace App\Http\Controllers;

use App\Team;
use App\Http\Requests;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Illuminate\Contracts\Validation\Validator;


class MemberController extends Controller
{

    /**
     * Assign controller middleware
     */
    public function __construct()
    {
        $this->middleware('auth');
        $this->middleware('admin');
    }



    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        //
    }

    /**
     * Show the form for creating a new resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  Team  $team
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request, Team $team)
    {
        //do a little bit of validation first
        $rules = [
            'user.meta.ghost.email'     => 'email',
            'user.meta.ghost.name'      => 'required|max:100',
            'user.role'                 => 'required|numeric'
        ];

        $validator = Validator::make($request->all(), $rules);

        if ($validator->fails()) {
            return ['ok' => false, 'errors' => $validator->errors()];
        }

        return $team->newMember($request);
    }

    /**
     * Display the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function show($id)
    {
        //
    }



    /**
     * Show the form for editing the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function edit($id)
    {
        //
    }



    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  Team  $team
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, Team $team, $id)
    {
        if (Auth::user()->cannot('edit-member', [$team, $id])) {
            return ['ok' => false, 'error' => 'Unauthorized request'];
        }

        return $team->editMember($request);
    }



    /**
     * Remove the specified resource from storage.
     *
     * @param  Team $team
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy(Team $team, $id)
    {
        if (Auth::user()->cannot('edit-member', [$team, $id])) {
            return ['ok' => false, 'error' => 'Unauthorized request'];
        }
        
        return $team->deleteMember($request);
    }
}
