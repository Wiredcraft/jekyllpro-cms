'use strict'

const express = require('express')
const router = express.Router()

const repository = require('../controllers/repository')

router.get('/', repository.getRepoContent)
router.post('/', repository.writeRepoFile)
router.delete('/', repository.deleteRepoFile)

router.get('/index', repository.getRepoBranchIndex)

router.get('/updated-collections', repository.getRepoBranchUpdatedCollections)

router.get('/details', repository.getRepoDetails)

router.get('/branch', repository.listBranches)
router.post('/branch', repository.createBranches)

router.get('/schema', repository.getBranchSchema)

router.get('/tree', repository.listBranchTree)

router.get('/hooks', repository.listHooks)
router.post('/hooks', repository.manageHook)

module.exports = router
