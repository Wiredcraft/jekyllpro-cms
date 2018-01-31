'use strict'

const express = require('express')
const router = express.Router()

const user = require('../controllers/user')

router.get('/', user.getUserInfo)
router.get('/orgs', user.listUserOrgs)
router.get('/repos', user.listUserRepos)

module.exports = router
