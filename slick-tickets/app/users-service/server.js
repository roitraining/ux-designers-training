'use strict'

// Config Variables
require('dotenv').config()
const port = process.env.USERS_PORT

// External Dependencies
const express = require('express')
const server = express()
const bodyParser = require('body-parser')
server.use(bodyParser.json())

// Routes
var routes = require('./routes')
server.use('/', routes)

// Start Server
server.listen(port, () => console.log(`Users Service listening at http://localhost:${port}`))
