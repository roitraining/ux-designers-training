// Config Variables
const onGoogleCloud = process.env.ON_GOOGLE_CLOUD

// External Dependencies
const admin = require('firebase-admin')

// Firebase Config
if (onGoogleCloud) {
  admin.initializeApp({credential: admin.credential.applicationDefault()})
} else {
  const serviceAccount = require(`../../credentials/${process.env.SERVICE_ACCOUNT_FILE}`)
  admin.initializeApp({credential: admin.credential.cert(serviceAccount)})
}

let db = admin.firestore()
let eventsRef = db.collection('events')

// Utility Functions
function getOneEvent (slug, callback) {
  let query = eventsRef.where('slug', '==', slug).get()
    .then(snapshot => {
      if (snapshot.empty) {
        callback({ message: 'No event found.' }, null)
        return
      }

      let extractedEvents = []
      snapshot.forEach(event => {
        let thisEvent = event.data()
        thisEvent.id = event.id
        extractedEvents.push(thisEvent)
      })

      if (extractedEvents.length > 1) {
        callback({ message: 'Multiple events found.' }, null)
        console.log('Multiple events have the same slug.')
        return
      }

      const extractedEvent = extractedEvents[0]
      callback(null, extractedEvent)
    })
}

// Controller Methods
exports.listEvents = function (req, res) {
  let allEventsExtracted = []

  let getEvents = eventsRef.get()
    .then(snapshot => {
      snapshot.forEach(event => {
        allEventsExtracted.push(event.data())
      })
      res.json({events: allEventsExtracted})
    })
    .catch(error => {
      console.log(error)
      res.json(error)
    })
}

exports.listMyEvents = function (req, res) {
  const userId = req.params.userId
  console.log('userId: ', userId)
  let allEventsExtracted = []

  let getEvents = eventsRef.where('attendees', 'array-contains', userId).get()
    .then(snapshot => {
      snapshot.forEach(event => {
        allEventsExtracted.push(event.data())
      })
      console.log('allEventsExtracted: ', allEventsExtracted)
      res.json({events: allEventsExtracted})
    })
    .catch(error => {
      console.log(error)
      res.json(error)
    })
}

exports.getEvent = function (req, res) {
  const slug = req.params.slug
  getOneEvent(slug, function (error, extractedEvent) {
    if (error) {
      res.json({ error: error })
    } else {
      res.json(extractedEvent)
    }
  })
}

exports.createEvent = function (req, res) {
  let eventDetails = req.body
  eventDetails.attendees = []

  let addEventDoc = eventsRef.add(eventDetails)
    .then(event => {
      res.json({
        eventId: event.id,
        message: 'event added added succesfully'
      })
    })
    .catch(error => {
      console.log(error)
      res.json(error)
    })
}

exports.deleteEvent = function (req, res) {
  const slug = req.params.slug
  getOneEvent(slug, function (error, extractedEvent) {
    if (error) {
      res.json( {error: error} )
    } else {
      let deleteEvent = eventsRef.doc(extractedEvent.id).delete()
      .then(() => {
        res.json({ message: `deleted event ${extractedEvent.id}`})
      })
      .catch(err => {
        res.json({ error: err })
      })
    }
  })
}

exports.updateEvent = function (req, res) {
  const slug = req.params.slug
  const updatedEvent = req.body

  getOneEvent(slug, function (error, extractedEvent) {
    if (error) {
      res.json( {error: error} )
    } else {
      const eventId = extractedEvent.id

      eventsRef.doc(eventId).update(updatedEvent)
        .then(event => {
          res.json({ message: `Event updated: ${event.id}`})
        })
        .catch(err => {
          res.json({ error: err })
        })
    }
  })
}

exports.patchEvent = function (req, res) {
  // Currently only registers a user for an event
  const slug = req.params.slug
  const userId = req.body.userId

  getOneEvent(slug, function (error, extractedEvent) {
    if (error) {
      res.json( {error: error} )
    } else {
      const eventId = extractedEvent.id
      const eventUpdate = {
        attendees: admin.firestore.FieldValue.arrayUnion(userId)
      }
      console.log('before update')
      eventsRef.doc(eventId).update(eventUpdate)
        .then(event => {
          console.log('eventId: ', eventId)
          res.json({ id: eventId})
        })
        .catch(err => {
          console.log(err)
          res.json({ error: err })
        })
    }
  })
}
