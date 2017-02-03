import config from '../config'
import express from './express'
import mongoose from 'mongoose'
import chalk from 'chalk'

// Bootstrap db connection
const connectDB = function (cb) {
  var db = mongoose.connect(config.db.uri, config.db.options, function (err) {
    if (err) {
      console.error(chalk.red('Could not connect to MongoDB!'))
      console.log(err)
    } else {
      // Enabling mongoose debug mode if required
      mongoose.set('debug', config.db.debug)

      // Call callback FN
      if (cb) cb(db)
    }
  })
}

const init = function init (callback) {
  connectDB(function (db) {
    // Initialize express
    var app = express.init(db)
    if (callback) callback(app, db, config)
  })
}

module.exports.start = function start (callback) {
  init(function (app, db, config) {
    app.listen(config.port, config.host, function () {
      // Create server URL
      var server = (process.env.NODE_ENV === 'secure' ? 'https://' : 'http://') + config.host + ':' + config.port
      // Logging initialization
      console.log('--')
      console.log(chalk.green(config.app.title))
      console.log()
      console.log(chalk.green('Environment:     ' + process.env.NODE_ENV))
      console.log(chalk.green('Server:          ' + server))
      console.log(chalk.green('Database:        ' + config.db.uri))

      if (callback) callback(app, config)
    })
  })
}
