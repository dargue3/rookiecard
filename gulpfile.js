var elixir = require('laravel-elixir');
var gutils = require('gulp-util');
var b = elixir.config.js.browserify;

require('laravel-elixir-stylus');
require('laravel-elixir-vueify');

if(gutils.env._.indexOf('watch') > -1) {
  b.plugins.push({
    name: "browserify-hmr",
    options : {}
  });
}

elixir(function(mix) {

	mix.browserify('routes.js');
  mix.stylus('stylus.styl');
  mix.stylus('variables.styl');

  mix.browserSync({
  	proxy: 'localhost',
    files: [
      elixir.config.appPath + '/**/*.php',
      elixir.config.get('public.css.outputFolder') + '/**/*.css',
      elixir.config.get('public.versioning.buildFolder') + '/rev-manifest.json',
      'resources/views/**/*.php'
    ],
  });

  

});
