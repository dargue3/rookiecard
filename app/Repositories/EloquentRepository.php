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
	/**
	 * A path to choose which Model class to call
	 * 
	 * @var string
	 */
	protected $modelPath;


	public function __construct()
	{
		// ensure the modelPath attribute is set
		if (! isset($this->modelPath)) {
			throw new Exception(get_class($this) . ' must have a $modelPath');
		}
	}


	public function create(array $attributes)
	{
		return call_user_func_array("{$this->modelPath}::create", array($attributes));
	}


	public function all()
	{
		return call_user_func("{$this->modelPath}::all");
	}


	public function find($id)
	{
		return call_user_func_array("{$this->modelPath}::find", array($id));
	}


	public function findOrFail($id)
	{
		return call_user_func_array("{$this->modelPath}::findOrFail", array($id));
	}

	
	public function delete($id)
	{
		return call_user_func_array("{$this->modelPath}::delete", array($id));
	}
}