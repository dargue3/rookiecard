<?php
namespace App\RC\Sports;

interface SportInterface
{
	public function statKeys();
	public function alwaysShown();
	public function keysOnlyUsedDuringCreation();
	public function positions();
	public function theyDidNotPlay($stats);
	public function setEmptyValues($stats);
}