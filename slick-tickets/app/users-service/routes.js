// Config
var express = require('express')
var router = express.Router()
var controller = require('./controller')

// Routes
router.get('/users', controller.listUsers)
router.patch('/users/register/:userId', controller.registerUser)
router.get('/users/promote/:userId', controller.promoteUser)
router.get('/users/demote/:userId', controller.demoteUser)

// Exports
module.exports = router
