// Config
var express = require('express')
var router = express.Router()
var controller = require('./controller')

// Routes
router.get('/events', controller.listEvents)
router.get('/events/:slug', controller.getEvent)
router.get('/my-events/:userId', controller.listMyEvents)
router.post('/events', controller.createEvent)
router.delete('/events/:slug', controller.deleteEvent)
router.put('/events/:slug', controller.updateEvent)
router.patch('/events/:slug', controller.patchEvent)

// Exports
module.exports = router
