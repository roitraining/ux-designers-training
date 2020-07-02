// Config Variables
const usersService = process.env.USERS_SERVICE
const eventsService = process.env.EVENTS_SERVICE

// External Dependencies
const fetch = require('node-fetch')

// Controller Methods
exports.registerForEvent = function (req, res) {
  const slug = req.params.slug
  const userId = req.user.id

  let fetchBody = {
    userId: userId
  }

  let fetchOptions = {
    method: 'patch',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(fetchBody)
  }

  fetch(`${eventsService}/events/${slug}`, fetchOptions)
    .then(serviceRes => serviceRes.json())
    .then(event => {
      console.log('event: ', event)
      const fetchBody = {
        eventId: event.id
      }

      const fetchOptions = {
        method: 'patch',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fetchBody)
      }

      const fetchUrl = `${usersService}/users/register/${userId}`

      console.log('fetchUrl: ', fetchUrl)
      console.log('fetchOptions: ', fetchOptions)
      fetch(fetchUrl, fetchOptions)
        .then(() => {
          res.redirect('/my-events')
        })
        .catch(err => res.redirect(`/event/${slug}`))

    })
    .catch(err => res.redirect(`/event/${slug}`))
}

exports.listUsers = function (req, res) {
  fetch(`${usersService}/users`)
  .then(serviceRes => serviceRes.json())
  .then(json => res.render('list-users', json))
}

exports.promoteUser = function (req, res) {
  const userId = req.params.userId
  fetch(`${usersService}/users/promote/${userId}`)
  .then(() => res.redirect('/users'))
}

exports.demoteUser = function (req, res) {
  const userId = req.params.userId
  fetch(`${usersService}/users/demote/${userId}`)
  .then(() => res.redirect('/users'))
}
