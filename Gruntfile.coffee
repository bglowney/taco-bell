module.exports = (grunt) ->
  config =
    pkg: grunt.file.readJSON 'package.json'
    clean: ['src/*.js','test/server/*.js','test/client/*.js','index.js','test/static/TestApp.bundled.js']
    ts:
      default:
        src: ['src/**/*.ts','test/**/*.ts','index.ts','TestApp.ts']
        options:
          module: 'commonjs'
          sourceMap: false
          target: 'es6'
    browserify:
      test:
        files:
          'test/static/TestApp.bundled.js': ['test/client/TestApp.js']
    execute:
      server:
        src: ['test/server/server.js']
        options:
          cwd: 'test/static'
          args: []
    mochaTest:
      default:
        src: 'test/end-to-end/end-to-end.js'

  grunt.initConfig config

  grunt.loadNpmTasks 'grunt-contrib-clean'
  grunt.loadNpmTasks 'grunt-ts'
  grunt.loadNpmTasks 'grunt-browserify'
  grunt.loadNpmTasks 'grunt-execute'
  grunt.loadNpmTasks 'grunt-mocha-test'

  grunt.registerTask 'default', ['ts','browserify']
  grunt.registerTask 'server', ['execute:server']
  grunt.registerTask 'test', ['mochaTest:default']