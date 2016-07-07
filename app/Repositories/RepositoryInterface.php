<?php
namespace App\Repositories;

/**
 * The standard contract for all repositories
 */
interface RepositoryInterface
{
	public function create(array $attributes);
	public function firstOrNew(array $attributes);
	public function all();
	public function find($id, array $columns);
	public function findOrFail($id, array $columns);
	public function destroy($id);
}