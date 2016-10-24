<?php
namespace App\RC\Sports;

trait SportHelpers
{
	/**
     * Return the stat keys for this sport
     * 
     * @return array
     */
    public function statKeys()
    {
    	return $this->statKeys;
    }


    /**
     * Return the keys that are always shown in the stat table
     * 
     * @return array
     */
    public function alwaysShown()
    {
    	return $this->alwaysShown;
    }


    /**
     * Return the keys that are only included when storing new stats
     * 
     * @return array
     */
    public function keysOnlyUsedDuringCreation()
    {
    	return $this->keysOnlyUsedDuringCreation;
    }


    /**
     * Return the positions for this sport
     * 
     * @return array 
     */
    public function positions()
    {
    	return $this->positions;
    }
}