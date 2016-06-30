<?php
namespace App\RC\Team;

use App\RC\Team\Roles\RoleInterface;

interface TeamMemberRepository
{
	public function using($member);
	public function checkForMember();
	public function newPlayer($team_id, $name = '');
	public function newCoach($team_id, $name = '');
	public function addGhost(RoleInterface $role, $name);
	public function invite($email);
	public function newMember($user_id);
	public function requestToJoin($team_id);
	public function cancelRequestToJoin($team_id);
	public function acceptInvitation($team_id);
	public function replaceGhostWithUser();
	public function replaceUserWithGhost();
	public function thanksButNoThanks($team_id);
	public function findGhostByEmail($email);
	public function addEmailToMetaData($email);
	public function attachMetaData(array $data);
	public function getDefaultMetaData($name = '');
	public function editMember(array $data, $role, $admin);
	public function deleteMember($member_id);
	public function deleteGhost();
}