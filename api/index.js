'use strict';

require('babel-register')({
   presets: [ 'es2015' ]
});

require('./server/server.js').start();