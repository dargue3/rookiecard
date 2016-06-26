<?php
namespace App\Repositories;

/**
 * Provides default implementations that are used across all repositories by
 * leveraging dynamic function calls. These simply delegate static function calls
 * to the right Eloquent model
 */
abstract class EloquentRepository implements RepositoryInterface
{
	/**
	 * A class path to choose which Model class to call
	 * 
	 * @var string
	 */
	protected $modelClassPath;


	public function __construct()
	{
		// ensure the modelClassPath attribute is set
		if (! isset($this->modelClassPath)) {
			throw new Exception(get_class($this) . ' must have a $modelClassPath');
		}
	}


	public function create(array $attributes)
	{
		return call_user_func_array("{$this->modelClassPath}::create", array($attributes));
	}


	public function all()
	{
		return call_user_func("{$this->modelClassPath}::all");
	}


	public function find($id)
	{
		return call_user_func_array("{$this->modelClassPath}::find", array($id));
	}


	public function findOrFail($id)
	{
		return call_user_func_array("{$this->modelClassPath}::findOrFail", array($id));
	}

	
	public function delete($id)
	{
		return call_user_func_array("{$this->modelClassPath}::delete", array($id));
	}
}