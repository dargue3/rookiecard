<?php
namespace App\RC\Team;

use App\RC\Team\Roles\RoleInterface;

interface TeamMemberRepository
{
	public function using($member);
	public function checkForMember();
	public function newPlayer($team_id, $firstname = '', $lastname = '');
	public function newCoach($team_id, $firstname = '', $lastname = '');
	public function addGhost(RoleInterface $role, $firstname, $lastname);
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
	public function getDefaultMetaData($firstname = '', $lastname = '');
	public function editMember($id, array $data, $role, $admin);
	public function deleteMember($member_id);
	public function deleteGhost();
}