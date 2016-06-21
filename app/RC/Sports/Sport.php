<?php
namespace App\RC\Sports;

interface Sport
{
	public function positions();
	public function playerStatKeys();
	public function teamStatKeys();
}