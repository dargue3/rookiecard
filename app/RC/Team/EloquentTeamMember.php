<?php
namespace App\RC\Team;

use App;
use App\User;
use Exception;
use Faker\Factory;
use App\TeamInvite;
use App\TeamMember;
use App\RC\Stat\StatRepository;
use App\RC\Team\TeamRepository;
use Illuminate\Support\Facades\Auth;
use App\RC\Team\Roles\RoleInterface;
use App\Events\TeamInvitedUserToJoin;
use App\Exceptions\TellUserException;
use App\RC\Team\Roles\ManagesTeamRoles;
use App\Repositories\EloquentRepository;
use App\RC\Team\Roles\Admin;
use App\RC\Team\Roles\Player;
use App\RC\Team\Roles\GhostPlayer;
use App\RC\Team\Roles\Coach;
use App\RC\Team\Roles\GhostCoach;
use App\RC\Team\Roles\Fan;
use App\RC\Team\Roles\InvitedPlayer;
use App\RC\Team\Roles\InvitedCoach;
use App\RC\Team\Roles\RequestedToJoin;

class EloquentTeamMember extends EloquentRepository implements TeamMemberRepository
{
	use ManagesTeamRoles;

	/**
	 * The path of this model, to be used in EloquentRepository
	 * 
	 * @var string
	 */
	protected $modelPath = 'App\TeamMember';


	/**
	 * The current instance of a member
	 * 
	 * @var TeamMember
	 */
	public $member;


	/**
	 * Use given member as the subject of this repo's actions
	 * 
	 * @param  TeamMember|int $member 
	 * @return EloquentTeamMember
	 */
	public function using($member)
	{
		// it could already be an instance of TeamMember
		if (is_a($member, TeamMember::class)) {
			$this->member = $member;
		}

		// it could be just their id
		else if (is_integer(intval($member))) {
			$this->member = TeamMember::findOrFail($member);
		}

		else {
			throw new Exception("Use either an instance of TeamMember or a member's id");
		}

		$this->fetchRoles();

		return $this;
	}



	/**
	 * Throw an exception if the repo doesn't know which member to operate on
	 * 
	 * @return void
	 */
	public function checkForMember()
    {
        if (! isset($this->member)) {
            throw new Exception("Make sure to call using() first to tell the repo which member it's using");
        }
    }


    /**
     * Fetch all of the members of a given team including ghosts
     * 
     * @param  int $team_id 
     * @return array          
     */
    public function members($team_id)
    {
        return TeamMember::where('team_id', $team_id)->get();
    }


    /**
     * Fetch all teams that a given user is a part of
     * 
     * @param  int $user_id 
     * @return array  An array of Team instances with roles
     */
    public function teams($user_id)
    {
        $memberOf = TeamMember::where('user_id', $user_id)->get();

        $repo = App::make(TeamRepository::class);

        $teams = [];
        foreach ($memberOf as $member) {
            $this->using($member);
            $teams[] = [
                'team'  => $repo->findOrFail($member->team_id),
                'roles' => [
                    'isMember'        => $this->isMember(),
                    'isFan'           => $this->isFan(),
                    'hasBeenInvited'  => $this->hasBeenInvited(),
                ],
            ];
        }

        return $teams;
    }



    /**
     * Return an instance of TeamMember with these parameters
     * 
     * @param  int $user_id 
     * @param  int $team_id 
     * @return TeamMember|null          
     */
    public function teamMember($user_id, $team_id)
    {
        return TeamMember::member($user_id, $team_id)->first();
    }



    /**
     * Fetch all of the human users on a given team
     * 
     * @param  int $team_id 
     * @return array          
     */
    public function users($team_id)
    {
        return TeamMember::where('team_id', $team_id)->where('user_id', '!=', 0)->get(['user_id']);
    }


    /**
     * Add logged-in user to a given team
     * Used when a team is being created
     * 
     * @param  int $team_id
     * @param  RoleInterface $role
     * @return EloquentTeamMember
     */
    public function addTeamCreator($team_id, RoleInterface $role)
    {
        $this->using(TeamMember::create([
            'user_id'   => Auth::id(),
            'team_id'   => $team_id,
            'meta'      => json_encode($this->getDefaultMetaData())
        ]));

        $this->addRole($role);
        $this->addRole(new Admin);
    }



	/**
     * Instantiate a new (ghost) coach on this team
     * 
     * @param  integer $team_id
     * @param string $firstname
     * @param string $lastname
     * @return EloquentTeamMember
     */
    public function newPlayer($team_id, $firstname = '', $lastname = '')
    {
    	$member = TeamMember::create(['team_id' => $team_id, 'user_id' => 0]);

    	$this->using($member);

        return $this->addGhost(new GhostPlayer, $firstname, $lastname);
    }


    /**
     * Instantiate a new (ghost) coach on this team
     * 
     * @param  integer $team_id
     * @param string $firstname
     * @param string $lastname
     * @return EloquentTeamMember
     */
    public function newCoach($team_id, $firstname = '', $lastname = '')
    {
        $member = TeamMember::create(['team_id' => $team_id, 'user_id' => 0]);

        $this->using($member);

        return $this->addGhost(new GhostCoach, $firstname, $lastname);
    }



    /**
     * Setup and instantiate a new ghost member on this team
     * 
     * @param RoleInterface $role
     * @param string $firstname
     * @param string $lastname
     * @return EloquentTeamMember
     */
    public function addGhost(RoleInterface $role, $firstname, $lastname)
    {
        // if no names included, make one up
        $firstname = $firstname ?: Factory::create()->firstName;
        $lastname = $lastname ?: Factory::create()->lastName;

        $this->addRole($role);

        $this->member->meta = json_encode($this->getDefaultMetaData($firstname, $lastname));
        $this->member->save();

        return $this;
    }



    /**
     * Invites person with given email to replace this ghost user
     * 
     * @param  string $email
     * @return EloquentTeamMember
    */
    public function invite($email)
    {
        if (empty($email)) {
            // there wasn't an email, skip
            return $this;
        }

    	$this->checkForMember();

        if (! $this->isGhost()) {
            throw new Exception('Member must be a ghost');
        }

        $this->addEmailToMetaData($email);

        $user = User::where('email', $email)->first();

        // check if that email is already tied to an account
        if ($user) {
        	$repo = $this->newMember($user->id);

            $role = $this->isPlayer() ? InvitedPlayer::class : InvitedCoach::class; 
            $repo->addRole(new $role, true);

            // send an event saying that this user has been invited
            event(new TeamInvitedUserToJoin($repo->member->team_id, $user->id));

            return $this;
        }

        // user isn't in our database yet, send email inviting them to RC
        TeamInvite::invite($this->member);

        return $this;
    }


    /**
     * Revoke the invitation to join from the owner of this email
     * 
     * @param  string $email 
     * @return EloquentTeamMember        
     */
    public function uninvite($email)
    {
        $user = User::where('email', $email)->first();

        if ($user) {
            // delete the invitation of an active RC account
            $member = TeamMember::where(['user_id' => $user->id, 'team_id' => $this->member->team_id])->first();
            if ($member) {
                $member->delete();
            }
        }
        else {
            // delete the invitation of an invited-to-RC account
            TeamInvite::deleteByEmail($email, $this->member->team_id);
        }
    }


    /**
     * Prepare to add this user as a new member on this team
     * 
     * @param  int $user_id
     * @return EloquentTeamMember 
     */
    public function newMember($user_id)
    {
    	$member = TeamMember::firstOrCreate(['user_id' => $user_id, 'team_id' => $this->member->team_id]);

    	$repo = (new EloquentTeamMember)->using($member);

    	if ($repo->isMember()) {
            $this->member->delete(); // get rid of the ghost that was just made
    		throw new TellUserException("A user with that email is already on the team");
    	}

        if ($repo->hasBeenInvited()) {
            $this->member->delete(); // get rid of the ghost that was just made
            throw new TellUserException("A user with that email has already been invited");
        }

    	return $repo;
    }

    /**
     * Logged-in user is asking admin to join this team
     *   
     * @param int $team_id  
     * @return void
     */
    public function requestToJoin($team_id)
    {
        $member = TeamMember::firstOrCreate(['user_id' => Auth::id(), 'team_id' => $team_id]);

        $this->using($member);

        if ($this->isMember() or $this->hasRequestedToJoin()) {
        	throw new Exception("Logged-in user cannot request to join: '$team_id'");
        }

        return $this->addRole(new RequestedToJoin);
    }



    /**
     * Logged-in user canceled their request to join this team
     *    
     * @param int $team_id 
     * @return void
     */
    public function cancelRequestToJoin($team_id)
    {
    	$member = TeamMember::member(Auth::id(), $team_id)->firstOrFail();

    	$this->using($member);

        if (! $this->hasRequestedToJoin()) {
            throw new Exception("Logged-in user has not requested to join team with id: '$team_id'");
        }

        return $this->removeRole(new RequestedToJoin)->deleteIfTheyHaveNoRoles();
    }




    /**
     * Logged-in user is accepting an invitation to join this team
     * 
     * @param int $team_id
     * @return EloquentTeamMember       
     */
    public function acceptInvitation($team_id)
    {
        $member = TeamMember::member(Auth::id(), $team_id)->firstOrFail();

        $this->using($member);

        if ($this->isMember() or ! $this->hasBeenInvited()) {
        	throw new Exception("Logged-in user ($this->member->user_id) has not been invited to join team ($team_id)");
        }

        return $this->replaceGhostWithUser();
    }


    /**
     * An admin is accepting a user's request to join their team
     * 
     * @param  int $team_id   
     * @param  int $member_id 
     * @return EloquentTeamMember            
     */
    public function allowMemberToJoin($member_id, $team_id)
    {
        $this->using($member_id);

        if ($this->isMember() or ! $this->hasRequestedToJoin()) {
            throw new Exception("user ($member_id) has not requested to join team ($team_id)");
        }

        return $this->addRole(new Player, true);
    }



    /**
     * Convert a ghost member instance into a user-controlled member
     * 
     * @param int $ghost_id     The member_id of the ghost being replaced
     * @return EloquentTeamMember
     */
    public function replaceGhostWithUser($ghost_id = null)
    {   
        if ($this->hasRole(new InvitedPlayer)) {
            $this->addRole(new Player, true);
        }
        else if ($this->hasRole(new InvitedCoach)) {
            $this->addRole(new Coach, true);
        }

        if ($ghost_id != null) {
            $ghost = $this->find($ghost_id);
        }
        else {
            $ghost = $this->findGhostByEmail(Auth::user()->email);
        }

        if ($ghost && $ghost->team_id == $this->member->team_id) {
            // attach ghost's relevent meta data to user
            $meta = json_decode($ghost->meta);
            unset($meta->firstname);
            unset($meta->lastname);
            unset($meta->email);
            $this->member->meta = json_encode($meta);

            // any stats that belonged to the ghost now belong to this user
            App::make(StatRepository::class)->switchOwners($ghost, $this->member); 

            $ghost->delete();
        }

        // if they're not replacing a ghost, give them default meta data
        else {
            $this->attachMetaData($this->getDefaultMetaData());
        }

        $this->member->save();

        return $this;
    }


    /**
     * Turn this user-controlled member instance into a ghost member
     * 
     * 
     * @return EloquentTeamMember
     */
    public function replaceUserWithGhost()
    {
        $oldMember = $this->member;

        if ($this->hasRole(new Player)) {
            $this->addRole(new GhostPlayer, true);
        }
        else if ($this->hasRole(new Coach)) {
            $this->addRole(new GhostCoach, true);
        }

        $user = User::findOrFail($oldMember->user_id);
        $meta = json_decode($oldMember->meta);

        // attach default meta data then overwrite with user's old data
        $meta = array_merge((array) $meta, ['firstname' => $user->firstname, 'lastname' => $user->lastname, 'email' => '']);
        $this->attachMetaData($meta);
        $this->member->user_id = 0;
        $this->member->save();

        // any stats that belonged to the ghost now belong to this user
        App::make(StatRepository::class)->switchOwners($oldMember, $this->member); 

        return $this;
    }


    /**
     * Logged-in user is declining the invitation to join this team
     * 
     * @param int $team_id
     * @return EloquentTeamMember
     */
    public function thanksButNoThanks($team_id)
    {
        $member = TeamMember::member(Auth::id(), $team_id)->firstOrFail();

        $this->using($member);

        if (! $this->hasBeenInvited()) {
        	throw new Exception("Logged-in user hasn't been invited to join this team");
        }

        return $this->removeInviteRoles()->deleteIfTheyHaveNoRoles();
    }


    /**
     * Toggle the fan status of this user
     * 
     * @param  int $team_id
     * @return App\TeamMember
     */
    public function toggleFan($team_id)
    {
    	$member = TeamMember::firstOrCreate(['user_id' => Auth::id(), 'team_id' => $team_id]);

    	$this->using($member);

    	if ($this->isMember()) {
    		throw new Exception("Logged-in user cannot become a fan because they're already a member");
    	}

        return $this->toggleRole(new Fan)->deleteIfTheyHaveNoRoles(); 
    }




    /**
     * Return the ghost on this team that matches a given email
     * 
     * @param  string $email
     * @return EloquentTeamMember|null       
     */
    public function findGhostByEmail($email)
    {
    	$this->checkForMember();

        $ghosts = TeamMember::ghosts($this->member->team_id)->get();

        foreach ($ghosts as $ghost) {
            $meta = json_decode($ghost->meta);

            // does this ghost's meta data contain the user's email?
            if (isset($meta->email) && $meta->email == $email) {
                return $ghost;
            }
        }

        // there isn't one
        return null;
    }


    /**
     * Add this email to the ghost's member data
     * 
     * @param string $email
     * @return  TeamMember
     */
    public function addEmailToMetaData($email)
    {
        $meta = json_decode($this->member->meta);

        $meta->email = $email;    

        $this->member->meta = json_encode($meta);
        $this->member->save();

        return $this;
    }




    /**
     * Attaches given array as meta data onto this member
     * 
     * @param  array $data
     * @return EloquentTeamMember       
     */
    public function attachMetaData(array $data, $overwrite = true)
    {
        if ($overwrite) {
            $meta = [];
        }
        else {
            $meta = (array) json_decode($this->member->meta);
        }

    	foreach ($data as $key => $value) {
            $meta[$key] = $value;
        }

        $this->member->meta = json_encode($meta);
        $this->member->save();

        return $this;
    }



    /**
     * Set this member's default meta data according to their role
     * 
     * @param  string $firstname
     * @param  string $lastname
     * @return EloquentTeamMember
     */
    public function getDefaultMetaData($firstname = '', $lastname = '')
    {
        if ($this->member and $this->isGhost()) {
            return [
                'firstname' => $firstname,
                'lastname'  => $lastname,
                'email' => '',
                'positions' => [],
                'num'       => '',
            ];
        }

        return [
            'positions' => [],
            'num'       => '',
        ];
    }



    /**
     * If an email is newly included, invite that user
     * If an email is deleted, un-invite that user
     * 
     * @param  array $newData 
     * @return           
     */
    public function checkEmailSettings($newData)
    {
        $oldData = (array) json_decode($this->member->meta);

        $oldEmail = isset($oldData['email']) ? $oldData['email'] : null;
        $newEmail = isset($newData['email']) ? $newData['email'] : null;

        if ((! $oldEmail and ! $newEmail) or ($oldEmail == $newEmail)) {
            // nothing to see here
            return;
        }

        if ($oldEmail) {
            $this->uninvite($oldEmail);
        }
        if ($newEmail) {
            $this->invite($newEmail);
        }

        return $this;
    }


    /**
     * Make this member's data match the arguments
     * 
     * @param int $id           The id of the member being edited
     * @param  array $data      Array of meta data to be attached
     * @param string $role      Text version of this member's saved role
     * @param  boolean $admin   Their new admin status
     * @return EloquentTeamMember
     */
    public function editMember($id, array $data, $role, $admin)
    {
    	$this->using($id);

        $this->checkEmailSettings($data);

        $this->attachMetaData($data);

        $this->setMemberRole($role);
    
        return $this->setRole(new Admin, $admin);
    }




    /**
     * Delete this member
     * 
     * If the member is a user, turn this member into a ghost version of them.
     * If the member is a ghost, completely delete this entry and all associated data.
     * 
     * @param int $member_id
     * @return EloquentTeamMember
     */
    public function deleteMember($member_id)
    {
    	$this->using($member_id);

        if ($this->hasRequestedToJoin()) {
            $this->removeRole(new RequestedToJoin)->deleteIfTheyHaveNoRoles();
            return $this;
        }

        if ($this->isFan()) {
            $this->member->delete();
            return $this;
        }

        if (! $this->isMember()) {
            throw new Exception(`This user (${$this->member->user_id}) is not a member of this team (${$this->member->team_id})`);
        }

        if ($this->isGhost()) {
            return $this->deleteGhost();
        }

        return $this->replaceUserWithGhost();
    }



    /**
     * Delete this instance and all associated data
     * 
     * @return EloquentTeamMember
     */
    public function deleteGhost() {

        // delete any stats
        App::make(StatRepository::class)->deleteByMember($this->member->team_id, $this->member->id);

        // delete any outstanding invitations this is placeholding
        $meta = json_decode($this->member->meta);
        if (isset($meta->email)) {
            $this->uninvite($meta->email);
        }

        $this->member->delete();

        return $this;
    }
}