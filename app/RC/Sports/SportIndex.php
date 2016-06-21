<?php
namespace App\RC\Sports;

use App\RC\Sports\Sport;
use App\RC\Sports\Basketball;

class SportIndex
{
	/**
	 * Array of supported sports
	 * 
	 * @var array
	 */
	private $sports = [
		'0' 	=> Basketball::class,
	];


	/**
	 * Fetch an instance of the sport given by its ID
	 * 
	 * @param  int $id [description]
	 * @return App\RC\Sports\Sport
	 */
	public static function getSportById($id)
	{
		$sport = (new static)->sports[strval($id)];

		return (new static)->ensureContract(new $sport);
	}


	/**
	 * Uses type-hinting to ensure this sport implements the Sport interface
	 * @return SportInterface
	 */
	public function ensureContract(Sport $sport)
	{
		return $sport;
	}
}