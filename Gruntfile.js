module.exports = function (grunt) {
  'use strict';

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    connect: {
      options: {
        keepalive: true,
        debug: true,
        livereload: true
      },

      server: {
        options: {
          protocol: 'http',
          hostname: 'localhost',
          port: 8000,
          useAvailablePort: true,
          open: true,

          base: ['public']
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-connect');
};