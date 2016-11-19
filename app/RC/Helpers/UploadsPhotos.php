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
	protected $paths;


	/**
	 * The uploaded image converted to Intervention\Image class
	 * 
	 * @var Image
	 */
	public $image;


	/**
	 * The original uploaded file
	 * 
	 * @var UploadedFile
	 */
	public $original;


	/**
	 * The bucket in S3 currently being used
	 * 
	 * @var string
	 */
	public $bucket;


	/**
	 * Instantiate class
	 * 
	 * @param [UploadedFile | string] $image Either an uploaded file or a link to S3
	 */
	public function __construct($image = null)
	{
		if (! $image) {
			return;
		}

		$this->loadImage($image);
	}


	/**
	 * Load the image into this class
	 * 
	 * @param  [UploadedFile | string] $image 
	 * @return void        
	 */
	public function loadImage($image)
	{
		if (is_a($image, UploadedFile::class)) {
			if (! $image->isValid()) {
				throw new Exception("Invalid image made it past validation");
			}

			// image was uploaded in the request
			$this->image = Image::make($image->path());
		}

		else if (is_string($image)) {
			// image was a reference to a location in local storage
			// separate '/storage/' from 'tmp/jvnjoiwehc90234hcoiwh12o.jpeg'
			$kaboom = explode("/storage/", $image);
			if (count($kaboom) != 2) {
				throw new Exception("Badly formed local path: $image");
			}

			$image = $kaboom[1];
			$this->image = Image::make(Storage::disk('local')->get($image));
		}

		else {
			throw new Exception("Input is neither string nor an instance of UploadedFile");
		}

		$this->original = $image;
		$this->bucket = config('filesystems.disks.s3.bucket');
		$this->paths = config('filesystems.disks.s3.folders');

		return $this;
	}


	/**
	 * Upload the image given in the constructor to Amazon S3
	 * 
	 * @param  string $path Which file in the bucket to place in
	 * @return string  		The path to the Amazon S3 bucket where the image is stored
	 */
	public function uploadToS3($path)
	{
		$this->checkForImage();

		$this->validate($path);

		$path = $this->filename($path . '/');

		Storage::put($path, $this->imageContents());

		return Storage::url($path);
	}


	/**
	 * Save the image given in the constructor to local storage on the server
	 * 
	 * Note: need to create symlink between /storage/app and /public/storage on server
	 * See: https://laravel.com/docs/5.3/filesystem#the-public-disk
	 * 
	 * @return string  	The path where the image is stored
	 */
	public function uploadToLocal()
	{
		$this->checkForImage();

		$path = $this->filename('tmp/');

		Storage::disk('local')->put($path, $this->imageContents());

		return Storage::disk('local')->url($path);
	}


	/**
	 * Save the image to S3 and delete local temporary copy
	 * 
	 * @param string $path  Path to upload to in S3
	 * @return string  		Full URL of image stored in S3 
	 */
	public function moveFromLocalToS3($path)
	{
		$this->checkForImage();

		if (Storage::disk('local')->exists($this->original)) {
			Storage::disk('local')->delete($this->original);
		}

		return $this->uploadToS3($path);
	}


	/**
	 * Delete the currently saved photo
	 * 
	 * @param  string $path  The path in S3 where the photo is stored
	 * @return UploadsPhotos      
	 */
	public function deleteOriginal($path)
	{
		// separate 'https://s3.amazonaws.com/{bucket}/' from 'team_profile/18018aa7b2e953fe0f4b80b04472dcfe.png'
		$kaboom = explode("/$this->bucket/", $path);
		if (count($kaboom) != 2) {
			throw new Exception("Badly formed S3 path: $path");
		}

		$path = $kaboom[1];

		if (Storage::exists($path)) {
			Storage::delete($path);
		}
		
		return $this;
	}


	/**
	 * Crop the image according to given coordinates
	 * 
	 * @param  array  $crop [topLeftX, topLeftY, bottomRightX, bottomRightY] crop vertices
	 * @return UploadsPhotos
	 */
	public function crop(array $crop = [])
	{
		$this->checkForImage();

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
	protected function filename($path = '')
	{
		$this->checkForImage();

		return $path . md5(uniqid(rand(), true)) . '.' . $this->extension();
	}


	/**
	 * Get the extension of the original image
	 * 
	 * @return string
	 */
	protected function extension()
	{
		$this->checkForImage();

		if (is_a($this->original, UploadedFile::class)) {
			return $this->original->extension();
		}

		// otherwise just chop the string up by periods and use the last chunk
		$kaboom = explode('.', $this->original);
	
		return $kaboom[count($kaboom) - 1];
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
			throw new Exception ("'$path' is not a valid S3 photo upload path");
		}
	}


	/**
	 * Turn the Image class into file contents to put()
	 * Made a dedicated method for this because look how ugly that call is!
	 * 
	 * @return string
	 */
	public function imageContents()
	{
		$this->checkForImage();

		return $this->image->encode()->__toString();
	}


	/**
	 * Throw an exception if image has not been passed to UploadsPhotos yet
	 * 
	 * @return void 
	 */
	protected function checkForImage()
	{
		if (! $this->image) {
			throw new Exception("Was not seeded with an image yet");
		}
	}
}