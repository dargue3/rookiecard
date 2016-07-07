<?php
namespace App\Repositories;

use Exception;

/**
 * Provides default implementations that are used across all Eloquent repositories by
 * leveraging dynamic function calls. These simply delegate static function calls
 * to the right model
 */
abstract class EloquentRepository implements RepositoryInterface
{

	public function modelPath()
	{
		return $this->modelPath;
	}


	public function create(array $attributes)
	{
		return call_user_func_array("{$this->modelPath}::create", array($attributes));
	}


	public function firstOrNew(array $attributes)
	{
		return call_user_func_array("{$this->modelPath}::firstOrNew", array($attributes));
	}


	public function all()
	{
		return call_user_func("{$this->modelPath}::all");
	}


	public function find($id, array $columns = array('*'))
	{
		return call_user_func_array("{$this->modelPath}::find", array($id, $columns));
	}


	public function findOrFail($id, array $columns = array('*'))
	{
		return call_user_func_array("{$this->modelPath}::findOrFail", array($id, $columns));
	}

	
	public function destroy($id)
	{
		return call_user_func_array("{$this->modelPath}::destroy", array($id));
	}
}