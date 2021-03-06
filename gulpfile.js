var elixir = require('laravel-elixir');
require('elixir-tinypng');
var env = require('./env.json');
var gulplette = require('./tasks/main.js');

var hooks = {
  hook: function(hook, mix, args) {
    if(gulplette.hasOwnProperty('hook_'+hook)) {
      gulplette['hook_'+hook](mix, args);
    }
  }
};

/*
 |--------------------------------------------------------------------------
 | Elixir Asset Management
 |--------------------------------------------------------------------------
 |
 | Elixir provides a clean, fluent API for defining some basic Gulp tasks
 | for your Laravel application. By default, we are compiling the Sass
 | file for our application, as well as publishing vendor resources.
 |
 */

elixir(function(mix) {
    hooks.hook('start', mix, {});

    // Javascript compilation
    mix.browserify('main.js');

    // Sass compliation
    mix.sass('main.scss');

    // Image optimization
    if(env.tinyPngApiKey) {
      mix.tinypng({
        key:env.tinyPngApiKey,
        sigFile:'.tinypng-sigs',
        log:true,
        summarize:true
      });

      // Copy all non compressible images to build
      mix.copy('img/*.!(png|jpg)', 'build/img');
    } else {
      mix.copy('img/*', 'build/img');
    }

    // Copy Bootstrap and Font Awesome fonts
    mix.copy('node_modules/bootstrap-sass/assets/fonts/bootstrap', 'build/fonts');
    mix.copy('node_modules/font-awesome/fonts', 'build/fonts');

    hooks.hook('after_copy', mix, {});

    // Begin BrowserSync - Elixir will only run this task on `watch`
    mix.browserSync({
      proxy: env.bsProxy,
      files: [
        '**/*.php',
        'build/css/*.css',
        'build/**/!(*.css)'
      ],
      watchOptions: {
        usePolling: false,
        interval: 2000
      }
    });

    hooks.hook('end', mix, {});
});
