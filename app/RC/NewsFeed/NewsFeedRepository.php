<?php
namespace App\RC\NewsFeed;

interface NewsFeedRepository
{
	public function add($owner_id, $type, array $data);
}