'use strict'

const fs = require('fs')
const path = require('path')
const mongoose = require('mongoose')

const config = require('../config')

let models = {}
fs.readdirSync(__dirname)
  .filter(fileName => fileName !== 'index.js')
  .forEach(fileName => {
    const model = require(path.join(__dirname, fileName))
    models[model.modelName] = model
  })

mongoose.connect(`mongodb://${config.dbHost}/${config.db}`, {
  user: config.dbUsername,
  pass: config.dbPassword,
  autoIndex: config.env === 'development'
}).then(() => {
  console.log('Database connection has been established successfully.')
}).catch(err => {
  console.error('Unable to connect to the database:', err)
})

module.exports = models
