<?php

use App\RC\Helpers\UploadsPhotos;
use Illuminate\Http\UploadedFile;

class UploadsPhotosTest extends TestCase
{
	/**
	 * The path to where the testing image was stored
	 * 
	 * @var string
	 */
	public $pathAsReferencedFromFrontEnd;


	/**
	 * The true path to the file including filename
	 * 
	 * @var string
	 */
	public $truePathToFile;


	/**
	 * The name of the testing image
	 * 
	 * @var string
	 */
	public $filename;


	public function setUp()
	{
		parent::setUp();
	}


	public function tearDown()
	{
		if (file_exists($this->truePathToFile)) {
			// delete the file that may have been temporarily placed here
			unlink($this->truePathToFile);
		}
		
		parent::tearDown();
	}


	/**
	 * Place a file in the /storage/app/public/tmp directory
	 * Simulates as if a file was uploaded there before cropping and saving
	 * 
	 * @return string
	 */
	public function mockExistingTmpFile()
	{
		$faker = (new Faker\Factory)->create();
		
		// move the testing image from storage/testing to storage/app/public/tmp
		$realPath = storage_path('testing');
		$fakePath = storage_path('app/public/tmp/');
		$this->filename = $faker->file($realPath, $fakePath, false);

		$this->truePathToFile = $fakePath . $this->filename;
		$this->pathAsReferencedFromFrontEnd = '/storage/tmp/' . $this->filename;
	}


	/**
	 * Create a dummy UploadedFile instance as if it came from a Request
	 * 
	 * @param  boolean $valid  Whether to mark the file as valid
	 * @return UploadedFile         
	 */
	public function mockUploadedFile($valid = true)
	{
		$this->mockExistingTmpFile();

		return new UploadedFile($this->truePathToFile,'test.jpeg','image/jpeg', 27249274, null, $valid);
	}


    /** @test */
    public function it_creates_an_Image_class_out_of_the_file_path()
    {
    	$this->mockExistingTmpFile();

    	$uploader = new UploadsPhotos($this->pathAsReferencedFromFrontEnd);

    	$this->assertTrue(is_a($uploader->image, Intervention\Image\Image::class));
    }


    /** @test */
    public function it_creates_an_image_out_of_an_UploadedFile_instance()
    {
    	$image = $this->mockUploadedFile();

    	$uploader = new UploadsPhotos($image);

    	$this->assertTrue(is_a($uploader->image, Intervention\Image\Image::class));
    }


    /** @test */
    public function it_throws_an_exception_if_the_UploadedFile_instance_is_invalid()
    {
    	$image = $this->mockUploadedFile(false);

    	$this->assertFalse($image->isValid());

    	$this->setExpectedException('Exception');

    	$uploader = new UploadsPhotos($image);
    }


    /** @test */
    public function it_throws_an_exception_if_the_path_wasnt_a_string()
    {
    	$this->setExpectedException('Exception');

    	$uploader = new UploadsPhotos(1234);
    }


    /** @test */
    public function it_throws_an_exception_if_the_path_was_not_to_the_storage_directory()
    {
    	$this->setExpectedException('Exception');

    	$uploader = new UploadsPhotos('/public/images/test.jpg');
    }


    /** @test */
    public function it_knows_which_s3_bucket_to_use_given_by_the_filesystems_config_file()
    {
    	$this->mockExistingTmpFile();

    	$uploader = new UploadsPhotos($this->pathAsReferencedFromFrontEnd);

    	$this->assertTrue(isset($uploader->bucket));
    }


    /** @test */
    public function it_uploads_a_given_uploaded_file_to_tmp_local_storage_and_returns_the_url()
    {
    	$image = $this->mockUploadedFile();

    	$uploader = new UploadsPhotos($image);

    	$url = $uploader->uploadToLocal();

    	$this->assertTrue(Storage::disk('local')->exists("/tmp/$this->filename"));
    	$this->assertTrue(strpos($url, 'storage/tmp/') >= 0); // file gets renamed, but contains /storage/tmp path

    	// delete the file that was just moved
    	$filename = explode('/storage/tmp/', $url)[1];
    	Storage::disk('local')->delete("/tmp/$filename");
    }


    /** @test */
    public function it_uploads_a_given_uploaded_file_to_amazon_s3_storage()
    {
    	$image = $this->mockUploadedFile();

    	$uploader = new UploadsPhotos($image);

    	Storage::shouldReceive('put')->once()->shouldReceive('url')->once();

    	$uploader->uploadToS3('team_profile');
    }


    /** @test */
    public function it_throws_an_exception_if_trying_to_upload_to_an_unknown_folder_off_bucket_root_in_s3()
    {
    	$image = $this->mockUploadedFile();

    	$uploader = new UploadsPhotos($image);

    	$this->setExpectedException('Exception');

    	$uploader->uploadToS3('cats');
    }


    /** @test */
    public function it_uploads_a_given_local_file_to_s3_and_deletes_the_local_copy()
    {
    	$this->mockExistingTmpFile();

    	$uploader = new UploadsPhotos($this->pathAsReferencedFromFrontEnd);

    	// for deleting local storage
    	Storage::shouldReceive('disk->exists')->once()->andReturn(true);
    	Storage::shouldReceive('disk->delete')->once();

    	// for putting in S3
    	Storage::shouldReceive('put')->once();
    	Storage::shouldReceive('url')->once();

    	$uploader->moveFromLocalToS3('team_profile');
    }


    /** @test */
    public function it_deletes_an_existing_file_out_of_s3()
    {
    	$existing = 'https://s3.amazonaws.com/rookiecard/team_profile/18018aa7b2e953fe0f4b80b04472dcfe.png';
    	$this->mockExistingTmpFile();

    	$uploader = new UploadsPhotos($this->pathAsReferencedFromFrontEnd);

    	Storage::shouldReceive('exists')->andReturn(true)->shouldReceive('delete');

    	$uploader->deleteOriginal($existing);
    }


    /** @test */
    public function it_throws_an_exception_if_the_path_to_be_deleted_is_not_a_valid_s3_url()
    {
    	$existing = 'team_profile/18018aa7b2e953fe0f4b80b04472dcfe.png';
    	$this->mockExistingTmpFile();

    	$this->setExpectedException('Exception');

    	$uploader = (new UploadsPhotos($this->pathAsReferencedFromFrontEnd))->deleteOriginal($existing);
    }


    /** @test */
    public function it_crops_an_image_to_the_given_vertices()
    {
    	$this->mockExistingTmpFile();
    	$crops = [0, 0, 150, 300];

    	Image::shouldReceive('make->crop')->with(150, 300, 0, 0);  // in constructor

    	// note: crops slightly reordered to match Image API
    	// see UploadsPhotos->crop() for more info about crop vertices

    	$uploader = (new UploadsPhotos($this->pathAsReferencedFromFrontEnd))->crop($crops);
    }
}