<?php
namespace App\RC\Team;

use App;
use Exception;
use App\RC\Team\TeamMemberRepository;

class JoinTeam
{
    /**
     * An instance of a team member repository
     * 
     * @var TeamMemberRepository
     */
    protected $member;


    /**
     * The id of the team the logged-in user is interacting with
     * 
     * @var int
     */
    protected $team_id;


    /**
     * How the user is (not) joining this team
     * Supported: accept, decline, request, cancel
     * 
     * @var string
     */
    protected $action;

    public function __construct($action, $team_id)
    {
        $this->member = App::make(TeamMemberRepository::class);
        $this->action = $action;
        $this->team_id = $team_id;
    }


    /**
     * Perform the appropriate function based on their action
     * 
     * @return JoinTeam
     */
    public function handle()
    {
        switch ($this->action) {
            case 'accept':
                $this->userHasAcceptedInvitation();
                break;

            case 'decline':
                $this->userHasDeclinedInvitation();
                break;

            case 'request':
                $this->userHasRequestedToJoin();
                break;

            case 'cancel':
                $this->userHasCanceledRequestToJoin();
                break;

            default:
                throw new Exception("Unsupported action: '$this->action' when trying to join team ($this->team_id)");
                break;
        }
    }
    


	/**
     * Logged-in user accepted an admin's invitation to join their team
     * 
     * @return void
     */
    public function userHasAcceptedInvitation()
    {
        $this->member->acceptInvitation($this->team_id);
    }


    /**
     * Logged-in user declined an admin's invitation to join their team
     * 
     * @return void
     */
    public function userHasDeclinedInvitation()
    {
        $this->member->thanksButNoThanks($this->team_id);
    }



    /**
     * Logged-in user has requested to join this team
     * 
     * @return void
     */
    public function userHasRequestedToJoin()
    {
        $this->member->requestToJoin($this->team_id);
    }



    /**
     * Logged-in user has canceled their request to join this team
     * 
     * @return void
     */
    public function userHasCanceledRequestToJoin()
    {
        $this->member->cancelRequestToJoin($this->team_id);
    }
}