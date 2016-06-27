<?php
namespace App\RC\Sports;

use Exception;

class Sport
{
	protected $sports = [
		'0' => Basketball::class,
	];

	/**
	 * Fetch an instance of the desired sport by its id
	 * 
	 * @param  int $id 
	 * @return Sport
	 */
	public static function find($id)
	{
		$self = new static;

		if (! isset($self->sports[strval($id)])) {
			throw new Exception("No sports with the id '$id' are currently supported");
		}

		$sport = $self->sports[strval($id)];

		return $self->ensureContract(new $sport);
	}


	/**
	 * Leverage type-hinting to ensure this sport implements the Sport interface
	 * 
	 * @return SportInterface
	 */
	private function ensureContract(SportInterface $sport)
	{
		return $sport;
	}
}