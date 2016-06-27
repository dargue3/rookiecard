<?php
namespace App\Events\Contracts;

interface CreatesNewsFeedEntries
{
	public function data();
	public function owner();
	public function type();
}