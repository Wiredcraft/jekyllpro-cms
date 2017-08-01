'use strict';

// replace native Promise with bluebird for better performance
global.Promise = require('bluebird');

require('babel-register')({
  presets: ['es2015']
});

require('./server/server.js').start();
