/*********************************
/* Excalibur.js Grunt Build File
/*********************************/
var path = require('path');

/*global module:false*/
module.exports = function (grunt) {

   //
   // Project configuration
   //
   grunt.initConfig({
      pkg: grunt.file.readJSON('package.json'),
      version: process.env.APPVEYOR_BUILD_VERSION || '<%= pkg.version %>',
      tscCmd: path.join('node_modules', '.bin', 'tsc'),
      jasmineCmd: path.join('node_modules', '.bin', 'jasmine'),
      jasmineConfig: path.join('src', 'spec', 'support', 'jasmine.json'),
      istanbulCmd: path.join('node_modules', '.bin', 'istanbul'),
      jasmineJs: path.join('node_modules', 'jasmine', 'bin', 'jasmine.js'),
      
      //
      // Concatenate build files
      // Add banner to files
      //
      concat: {
         main: {
            src: ['dist/<%= pkg.name %>-<%= version %>.js', 'src/engine/Exports.js'],
            dest: 'dist/<%= pkg.name %>-<%= version %>.js'
         },
         minified: {
            src: ['dist/<%= pkg.name %>-<%= version %>.min.js', 'src/engine/Exports.js'],
            dest: 'dist/<%= pkg.name %>-<%= version %>.min.js'
         },
         options: {
            separator: '\n;\n',
            banner: '/*! <%= pkg.title || pkg.name %> - v<%= version %> - ' +
                    '<%= grunt.template.today("yyyy-mm-dd") %>\n' +
                    '<%= pkg.homepage ? "* " + pkg.homepage + "\\n" : "" %>' +
                    '* Copyright (c) <%= grunt.template.today("yyyy") %> Excalibur.js <<%= pkg.author %>>;' +
                    ' Licensed <%= pkg.license %>*/\n'
         }
      },

      //
      // Minify files
      //
      minified: {
         files: {
            src: 'dist/<%= pkg.name %>-<%= version %>.js',
            dest: 'dist/<%= pkg.name %>-<%= version %>'
         },
         options: {
            sourcemap: false,
            allinone: true,
            dest_filename: '.min.js'
         }
      },

      //
      // Watch files
      //
      watch: {
         scripts: {
            files: ['src/engine/*.ts', 'src/engine/*/*.ts', 'src/spec/*.ts'],
            tasks: ['tslint:src', 'shell:specs', 'jasmine_node'],
            options: {
               interrupt: true
            }
         }
      },

      //
      // Shell Commands
      //
      shell: {

         //
         // Execute TypeScript compiler against Excalibur core
         //
         tsc: {
            command: '<%= tscCmd %> --sourcemap --declaration "./src/engine/Engine.ts" --out "./dist/<%= pkg.name %>-<%= version %>.js"',               
            options: {
               stdout: true,
               failOnError: true
            }
         },

         

         //
         // Package up Nuget (Windows only)
         //
         nuget: {
            command: 'src\\tools\\nuget pack Excalibur.nuspec -version <%= version %> -OutputDirectory ./dist',
            options: {
               stdout: true
            }
         },
         
         //
         // TypeScript Compile Jasmine specs
         //
         specs: {
            command: function () {
            	var files = grunt.file.expand("./src/spec/*.ts");

            	return '<%= tscCmd %> ' + files.join(' ') + ' --out ./src/spec/TestsSpec.js'
            },
            options: {
               stdout: true,
               failOnError: true
            }
         },
         
         //
         // Jasmine NPM command
         //
         tests: {
             command: '<%= jasmineCmd %> JASMINE_CONFIG_PATH=<%= jasmineConfig %>',
             options: {
                 stdout: true,
                 failOnError: true
             }
         },
         
         //
         // Istanbul command that generates code coverage
         //
         istanbul: {
             command: '<%= istanbulCmd %> cover <%= jasmineJs %> JASMINE_CONFIG_PATH=<%= jasmineConfig %>',
             options: {
                 stdout: true,
                 failOnError: true
             }
         },

         //
         // TypeScript Compile sample game
         //
         sample: {
            command: '<%= tscCmd %> ./sandbox/web/src/game.ts',
            options: {
               stdout: true,
               failOnError: true
            }
         },
         
         //
         // Compile visual tests
         //
         visual: {
             command: function() {
                 var files = grunt.file.expand("./sandbox/web/tests/**/*.ts");
                 return '<%= tscCmd %> ' + files.join(' ');
             },
             options: {
               stdout: true,
               failOnError: true
            }            
         }

      },

      //
      // Copy Files for sample game
      //
      copy: {
         main: {
            files: [
               {src: './dist/<%= pkg.name %>-<%= version %>.js', dest: './dist/<%= pkg.name %>.js'},
               {src: './dist/<%= pkg.name %>-<%= version %>.js', dest: './sandbox/web/<%= pkg.name %>.js'},
               {src: './dist/<%= pkg.name %>-<%= version %>.min.js', dest: './dist/<%= pkg.name %>.min.js'},
               {src: './dist/<%= pkg.name %>-<%= version %>.d.ts', dest: './dist/<%= pkg.name %>.d.ts'}
            ]
         }
      },

      //
      // TS Lint configuration
      //
      tslint: {
         options: {
            formatter: 'prose',
            rulesDirectory: './tslint/rules/',
            configuration: grunt.file.readJSON('./tslint/tslint.json')            
         },
         src: [
            "src/engine/*.ts",
            "src/engine/Actions/*.ts",
            "src/engine/Collision/*.ts",
            "src/engine/Drawing/*.ts",
            "src/engine/Input/*.ts",
            "src/engine/Interfaces/*.ts",
            "src/engine/PostProcessing/*.ts",
            "src/engine/Traits/*.ts",
            "src/engine/Util/*.ts",
            "src/sandbox/web/*.ts",
            "src/spec/*.ts",
            
            // exclusions
            "!src/spec/jasmine.d.ts",
            "!src/spec/require.d.ts"
         ]
      },
      
      coveralls: {
         main: {
            src: './coverage/lcov.info',
            options: {
               force: true
            }
         }
      }
   });

   //
   // Load NPM Grunt tasks as dependencies
   //
   grunt.loadNpmTasks('grunt-shell');
   grunt.loadNpmTasks('grunt-minified');
   grunt.loadNpmTasks('grunt-contrib-concat');
   grunt.loadNpmTasks('grunt-contrib-copy');
   grunt.loadNpmTasks('grunt-tslint');
   grunt.loadNpmTasks('grunt-contrib-watch');
   grunt.loadNpmTasks('grunt-coveralls');
   
   //
   // Register available Grunt tasks
   //

   // Run tests quickly
   grunt.registerTask('tests', ['shell:specs', 'shell:tests']);

   // Compile sample game
   grunt.registerTask('sample', ['shell:sample']);
   
   // Compile visual tests
   grunt.registerTask('visual', ['shell:visual']);
   
   grunt.registerTask('compile', ['shell:tsc', 'minified', 'concat', 'copy', 'shell:nuget'])

   grunt.registerTask('server', [])

   // Travis task - for Travis CI
   grunt.registerTask('travis', 'default');
   
   // Default task - compile, test, build dists
   grunt.registerTask('default', ['tslint:src', 'shell:specs', 'shell:istanbul', 'coveralls', 'shell:tsc', 'minified', 'concat', 'copy', 'sample', 'visual', 'shell:nuget']);

};