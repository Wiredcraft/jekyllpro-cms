'use strict'

const express = require('express')
const router = express.Router()

const webhook = require('../controllers/webhook')

router.get('/', webhook.pushHook)

module.exports = router
