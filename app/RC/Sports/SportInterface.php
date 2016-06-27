<?php
namespace App\RC\Sports;

interface SportInterface
{
	public function positions();
	public function playerStatKeys();
	public function teamStatKeys();
}