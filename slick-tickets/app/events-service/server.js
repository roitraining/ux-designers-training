'use strict'

// Config Variables
require('dotenv').config()
const port = process.env.EVENTS_PORT

// External Dependencies
const express = require('express')
const server = express()
const bodyParser = require('body-parser')
server.use(bodyParser.json())

// Routes
var routes = require('./routes')
server.use('/', routes)

// Start Server
server.listen(port, () => console.log(`Events Service listening well at http://localhost:${port}`))
