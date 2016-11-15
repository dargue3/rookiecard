<?php
namespace App\RC\Helpers;

use Image;
use Storage;
use Exception;
use Illuminate\Http\UploadedFile;

class UploadsPhotos
{
	/**
	 * Valid upload paths to S3
	 * 
	 * @var array
	 */
	protected $paths = ['team_profile', 'team_backdrop', 'tmp'];


	/**
	 * The uploaded image
	 * 
	 * @var Image
	 */
	protected $image;


	/**
	 * The original uploaded file
	 * 
	 * @var UploadedFile
	 */
	protected $original;


	public function __construct(UploadedFile $image)
	{
		if (! $image->isValid()) {
			throw Exception("Invalid image made it past validation");
		}

		$this->original = $image;
		$this->image = Image::make($image->path());
	}


	/**
	 * Upload the image given in the constructor to Amazon S3
	 * 
	 * @param  string $path Which file in the 'rookiecard' bucket to place in
	 * @return string  		The path to the Amazon S3 bucket where the image is stored
	 */
	public function upload($path)
	{
		$this->validate($path);

		$path = $this->filename($path);

		// this line of code is very atypical of Laravel's beautiful code 
		Storage::put($path, $this->image->encode()->__toString());

		return Storage::url($path);
	}


	/**
	 * Crop the image according to given coordinates
	 * 
	 * @param  array  $crop [topLeftX, topLeftY, bottomRightX, bottomRightY] crop vertices
	 * @return UploadsPhotos
	 */
	public function crop(array $crop = [])
	{
		if (! empty($crop) and isset($this->image)) {
			$height = $crop[3] - $crop[1];
			$width = $crop[2] - $crop[0];
			$this->image->crop($width, $height, $crop[0], $crop[1]);
		}

		return $this;
	}


	/**
	 * Generate a filename for this file before uploading to S3
	 * 
	 * @param string $path  The top-level folder inside S3 to store in
	 * @return string
	 */
	protected function filename($path)
	{
		return $path . '/' . md5(uniqid(rand(), TRUE)) . '.' . $this->original->extension();
	}


	/**
	 * Make sure that the upload path is correct
	 * 
	 * @param  string $path The S3 bucket path
	 * @return void 
	 */
	protected function validate($path)
	{
		if (! in_array($path, $this->paths)) {
			throw Exception ("'$path' is not a valid S3 photo upload path");
		}
	}
}