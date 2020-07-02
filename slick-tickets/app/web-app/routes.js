// Config Variables
const passportOptions = {
  successRedirect: '/my-events',
  failureRedirect: '/login',
  failureFlash: true
}

// External Dependencies
const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy

// Config
const express = require('express')
const router = express.Router()
const homeController = require('./controllers/home-controller')
const eventsController = require('./controllers/events-controller')
const usersController = require('./controllers/users-controller')
const middleware = require('./middleware')

// Home Routes
router.get('/', homeController.home)
router.get('/about', homeController.about)
router.get('/contact', homeController.contact)
router.get('/login', homeController.loginPage)
router.post('/register', homeController.register)
router.post('/login', passport.authenticate('local', passportOptions))
router.get('/logout', homeController.logout)

// Event Routes
router.get('/events', eventsController.listEvents)
router.get('/my-events', middleware.isAuthenticated, eventsController.listMyEvents)
router.get('/event/:slug', eventsController.viewEvent)
router.get('/print-ticket/:slug', middleware.isAuthenticated, eventsController.printEventTicket)
router.get('/create-event', middleware.isAuthenticated, middleware.isAdmin, eventsController.createEventPage)
router.post('/events/create', middleware.isAuthenticated, middleware.isAdmin, eventsController.createEvent)
router.get('/events/delete/:slug', middleware.isAuthenticated, middleware.isAdmin, eventsController.deleteEvent)
router.post('/events/update/:slug', middleware.isAuthenticated, middleware.isAdmin, eventsController.updateEvent)

// User Routes
router.get('/user/register/:slug', middleware.isAuthenticated, usersController.registerForEvent)
router.get('/users', middleware.isAuthenticated, middleware.isAdmin, usersController.listUsers)
router.get('/users/promote/:userId', middleware.isAuthenticated, middleware.isAdmin, usersController.promoteUser)
router.get('/users/demote/:userId', middleware.isAuthenticated, middleware.isAdmin, usersController.demoteUser)

// Exports
module.exports = router
