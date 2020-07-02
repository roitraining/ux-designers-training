'use strict'

// Config Variables
require('dotenv').config()
const port = process.env.WEB_PORT
const sessionSecret = process.env.SESSION_SECRET
const onGoogleCloud = process.env.ON_GOOGLE_CLOUD

// External Dependencies
const express = require('express')
const flash = require('connect-flash')
const session = require('express-session')
const bodyParser = require('body-parser')
const expressHandlebars  = require('express-handlebars')
const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy
const firestore = require('firebase-admin')

// Config
if (onGoogleCloud) {
  firestore.initializeApp({credential: firestore.credential.applicationDefault()})
} else {
  const serviceAccount = require(`../../credentials/${process.env.SERVICE_ACCOUNT_FILE}`)
  firestore.initializeApp({credential: firestore.credential.cert(serviceAccount)})
}

const server = express()
server.use(express.static('public'))
server.use(bodyParser.urlencoded({ extended: false }))
server.engine('handlebars', expressHandlebars())
server.set('view engine', 'handlebars')
server.use(session({ secret: sessionSecret, resave: false, saveUninitialized: true }))
server.use(flash())
server.use(passport.initialize())
server.use(passport.session())
require('./passport')(passport)

// Custom Middleware
const middleware = require('./middleware')
server.use(middleware.addUserToViews)

// Routes
const routes = require('./routes')
server.use('/', routes)

// Start Server
server.listen(port, () => console.log(`Web App listening at http://localhost:${port}`))
