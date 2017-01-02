/*********************************
/* Excalibur.js Grunt Build File
/*********************************/
var path = require('path');
var appveyorBuild = process.env.APPVEYOR_BUILD_NUMBER || '';

if (appveyorBuild) {
   appveyorBuild = '.' + appveyorBuild + '-alpha';
}

/*global module:false*/
module.exports = function (grunt) {

   //
   // Project configuration
   //
   grunt.initConfig({
      pkg: grunt.file.readJSON('package.json'),
      version: '<%= pkg.version %>' + appveyorBuild,
      tscCmd: path.join('node_modules', '.bin', 'tsc'),
      //
      // Clean dists and tests
      //
      clean: ['build/dist', 'src/spec/*.js', 'src/spec/*.map'],

      //
      // Typescript compilation targets
      //
      ts: {

         // Core engine
         core: {
            tsconfig: 'src/engine',
            options: {
               removeComments: false
            }
         },

         // Jasmine specs
         specs: {
            tsconfig: 'src/spec'
         },

         // HTML visual tests
         visual: {
            options: {
               target: 'es5'
            },
            src: ['sandbox/**/*.ts']
         },

         // Jasmine debug specs (for VS Code)
         debug: {
            options: {
               allowJs: true,
               sourceMap: true,
               experimentalDecorators: true
            },
            out: 'TestsSpec.js',
            src: [
               'src/spec/support/phantom-jasmine-invoker.js',
               'src/spec/support/js-imagediff.js',
               'build/dist/excalibur.js',
               'src/spec/*.ts',
               'node_modules/source-map-support/browser-source-map-support.js',
               'src/spec/support/start-tests.js'
            ]
         }
      },

      //
      // Concatenate build files and add banner copyright info
      //
      concat: {

         // excalibur.amd.js
         amd_js: {
            src: ['build/dist/<%= pkg.name %>.amd.js'],
            dest: 'build/dist/<%= pkg.name %>.amd.js',
            options: {
               sourceMap: true,
               process: function (src, filepath) {
                  return src.replace(/__EX_VERSION/g, grunt.template.process('<%= pkg.version %>'));
               }
            }
         },

         // excalibur.js (UMD style)
         dist_js: {
            src: ['src/browser/start.js', 'src/browser/almond.js', 'build/dist/<%= pkg.name %>.amd.js', 'src/browser/end.js'],
            dest: 'build/dist/<%= pkg.name %>.js',
            options: {
               sourceMap: true,
               process: function (src, filepath) {
                  return src.replace(/__EX_VERSION/g, grunt.template.process('<%= pkg.version %>'));
               }
            }
         },

         // Concat banner to AMD declarations file
         amd_dts: {
            src: ['build/dist/<%= pkg.name %>.amd.d.ts'],
            dest: 'build/dist/<%= pkg.name %>.amd.d.ts'
         },

         // Concat public API declarations file
         dist_dts: {
            src: ['src/browser/global.d.ts'],
            dest: 'build/dist/<%= pkg.name %>.d.ts'            
         },

         options: {
            separator: '\n',
            banner: '/*! <%= pkg.title || pkg.name %> - v<%= version %> - ' +
            '<%= grunt.template.today("yyyy-mm-dd") %>\n' +
            '<%= pkg.homepage ? "* " + pkg.homepage + "\\n" : "" %>' +
            '* Copyright (c) <%= grunt.template.today("yyyy") %> Excalibur.js <<%= pkg.author %>>;' +
            ' Licensed <%= pkg.license %>\n' +
            '* @preserve */\n'
         }
      },

      //
      // Minify files
      //
      uglify: {
         options: {
            sourceMap: true,
            preserveComments: 'some'
         },
         main: {
            files: {
               'build/dist/<%= pkg.name %>.min.js': 'build/dist/<%= pkg.name %>.js'
            }
         }
      },

      //
      // Copy dists for visual compilation/testing
      //
      copy: {
         visual: {
            files: [
               { src: './build/dist/<%= pkg.name %>.js', dest: './sandbox/<%= pkg.name %>.js' },
               { src: './build/dist/<%= pkg.name %>.js.map', dest: './sandbox/<%= pkg.name %>.js.map' },
               { src: './build/dist/<%= pkg.name %>.amd.d.ts', dest: './sandbox/<%= pkg.name %>.amd.d.ts' },
               { src: './build/dist/<%= pkg.name %>.d.ts', dest: './sandbox/<%= pkg.name %>.d.ts' }
            ]
         }
      },

      //
      // Shell Commands
      //
      shell: {

         //
         // Package up Nuget (Windows only)
         //
         nuget: {
            command: 'src\\tools\\nuget pack Excalibur.nuspec -version <%= version %> -OutputDirectory ./build/dist',
            options: {
               stdout: true,
               failOnError: true
            }
         },    

         //
         // Clone distribution repository
         //
         gitBuild: {
            command: 'git clone https://github.com/excaliburjs/excalibur-dist build',
            options: {
               stdout: true,
               failOnError: false
            }
         }

      },      

      //
      // Distribution repository build control
      //
      buildcontrol: {
         options: {
            dir: 'build',
            commit: true,
            push: true,
            message: ':shipit: Built excaliburjs/Excalibur@%sourceCommit% on branch %sourceBranch%',
            config: {
               'user.name': 'Travis-CI',
               'user.email': 'travis@excaliburjs.com'
            }
         },

         // continuous integration dists
         dist: {
            options: {
               branch: 'master',
               remote: 'https://github.com/excaliburjs/excalibur-dist',
               login: 'kamranayub',
               token: process.env.GH_DIST_TOKEN,
               fetchProgress: false
            }
         }
      },

      //
      // TS Lint configuration
      //
      tslint: {
         options: {
            configuration: './tslint/tslint.json'
         },
         src: [
            "src/engine/**/*.ts",
            "src/sandbox/**/*.ts",
            "src/spec/**/*.ts",

            // exclusions
            "!src/spec/jasmine.d.ts",
            "!src/spec/require.d.ts",
            "!src/spec/support/js-imagediff.d.ts"
         ]
      },

      //
      // Jasmine configuration
      //
      jasmine: {
         coverage: {
            src: 'build/dist/excalibur.js',
            options: {
               vendor: [
                  'src/spec/support/js-imagediff.js', 
                  'src/spec/Mocks.js', 
                  'src/spec/TestUtils.js'/*, 
                  'src/spec/support/sourcemaps.js'*/
               ],
               specs: 'src/spec/*Spec.js',
               keepRunner: true,
               template: require('grunt-template-jasmine-istanbul'),
               templateOptions: {
                  coverage: './coverage/coverage.json',
                  report: [
                     {
                        type: 'html',
                        options: {
                           dir: './coverage'
                        }
                     },
                     {
                        type: 'lcovonly',
                        options: {
                           dir: './coverage/lcov'
                        }
                     },
                     {
                        type: 'text-summary'
                     }
                  ]
               }
            }
         }
      },

      //
      // Code coverage configuration
      //
      coveralls: {
         main: {
            src: './coverage/lcov/lcov.info',
            options: {
               force: true
            }
         }
      },

      //
      // Package.json version bumper
      //
      bumpup: {
         setters: {
            // Overrides version setter 
            version: function (old, releaseType, options) {
               var version = grunt.file.readJSON('package.json').version;
               var build = process.env.TRAVIS_BUILD_NUMBER || "localbuild";
               var commit = process.env.TRAVIS_COMMIT || "localcommit";
               var alphaVersion = version + '-alpha.' + build + "+" + commit.substring(0, 7);
               return alphaVersion;
            },
         },
         files: ['build/package.json']
      }

   });

   //
   // Load NPM Grunt tasks as dependencies
   //
   grunt.loadNpmTasks('grunt-ts');
   grunt.loadNpmTasks('grunt-shell');
   grunt.loadNpmTasks('grunt-contrib-uglify');
   grunt.loadNpmTasks('grunt-contrib-clean');
   grunt.loadNpmTasks('grunt-contrib-concat');
   grunt.loadNpmTasks('grunt-contrib-copy');
   grunt.loadNpmTasks('grunt-tslint');
   grunt.loadNpmTasks('grunt-contrib-watch');
   grunt.loadNpmTasks('grunt-coveralls');
   grunt.loadNpmTasks('grunt-build-control');
   grunt.loadNpmTasks('grunt-bumpup');
   grunt.loadNpmTasks('grunt-contrib-jasmine');

   //
   // Register available Grunt tasks
   //

   // Default task - compile & test
   grunt.registerTask('default', ['tslint:src', 'compile', 'tests', 'visual']);

   // Core compile only
   grunt.registerTask('compile', ['shell:gitBuild', 'clean', 'ts:core', 'concat', 'uglify', 'copy']);

   // Run tests quickly
   grunt.registerTask('tests', ['ts:specs', 'jasmine']);

   // Debug compile (for VS Code)
   grunt.registerTask('debug', ['compile', 'ts:debug'])   

   // Compile visual tests
   grunt.registerTask('visual', ['ts:visual']);

   // Travis CI task
   grunt.registerTask('travis', ['default', 'coveralls']);

   // Appveyor task
   grunt.registerTask('appveyor', ['default', 'shell:nuget']);

   // CI task to deploy dists
   grunt.registerTask('dists', ['buildcontrol']);   
};