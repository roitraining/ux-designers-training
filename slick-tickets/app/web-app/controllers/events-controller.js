// Config Variables
const eventsService = process.env.EVENTS_SERVICE

// External Dependencies
const fetch = require('node-fetch')

// Controller Methods
exports.listEvents = function (req, res) {
  fetch(`${eventsService}/events`)
    .then(serviceRes => serviceRes.json())
    .then(json => res.render('list-events', json))
    .catch(err => res.redirect('/events'))
}

exports.listMyEvents = function (req, res) {
  const userId = req.user.id

  fetch(`${eventsService}/my-events/${userId}`)
    .then(serviceRes => serviceRes.json())
    .then(json => res.render('list-events', json))
    .catch(err => res.redirect('/events'))
}

exports.viewEvent = function (req, res) {
  const slug = req.params.slug
  let userId
  if (req.user) userId = req.user.id

  fetch(`${eventsService}/events/${slug}`)
    .then(serviceRes => serviceRes.json())
    .then(event => {
      event.userIsRegistered = event.attendees.includes(userId)
      res.render('view-event', event)
    })
    .catch(err => res.redirect('/events'))
}

exports.printEventTicket = function (req, res) {
  const slug = req.params.slug
  let userId
  if (req.user) userId = req.user.id

  fetch(`${eventsService}/events/${slug}`)
    .then(serviceRes => serviceRes.json())
    .then(event => {
      const userIsRegistered = event.attendees.includes(userId)
      if (userIsRegistered) {
        event.layout = false
        res.render('print-event-ticket', event)
      } else {
        res.redirect('/my-tickets')
      }
    })
    .catch(err => res.redirect('/events'))
}

exports.createEventPage = function (req, res) {
  res.render('create-event')
}

exports.createEvent = function (req, res) {
  const fetchBody = {
    name: req.body.name,
    description: req.body.description,
    slug: req.body.slug
  }

  const fetchOptions = {
    method: 'post',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(fetchBody)
  }

  console.log('fetchOptions: ', fetchOptions)

  fetch(`${eventsService}/events`, fetchOptions)
    .then(serviceRes => serviceRes.json())
    .then(json => res.redirect('/events'))
}

exports.deleteEvent = function (req, res) {
  const slug = req.params.slug
  const fetchOptions = { method: 'delete' }
  fetch(`${eventsService}/events/${slug}`, fetchOptions)
    .then(json => res.redirect('/events'))
    .catch(err => res.redirect('/events'))
}

exports.updateEvent = function (req, res) {
  const slug = req.params.slug

  const fetchBody = {
    name: req.body.name,
    description: req.body.description,
    slug: req.body.slug
  }

  const fetchOptions = {
    method: 'put',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(fetchBody)
  }

  fetch(`${eventsService}/events/${slug}`, fetchOptions)
    .then(json => res.redirect(`/event/${slug}`))
    .catch(err => res.redirect(`/event/${slug}`))
}
