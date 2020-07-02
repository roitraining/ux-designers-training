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
let usersRef = db.collection('users')

// Controller Methods
exports.listUsers = function (req, res) {
  let allUsersExtracted = []
  let getAllUsers = usersRef.get()
    .then(snapshot => {
      snapshot.forEach(user => {
        let extractedUser = user.data()
        delete extractedUser.password
        extractedUser.id = user.id
        allUsersExtracted.push(extractedUser)
      })
      res.json({users: allUsersExtracted})
    })
    .catch(error => {
      console.log(error)
      res.json(error)
    })
}

exports.registerUser = function (req, res) {
  const userId = req.params.userId
  const eventId = req.body.eventId

  console.log('userId: ', userId)
  console.log('eventId: ', eventId)

  let updateUser = usersRef.doc(userId).update({
    events: admin.firestore.FieldValue.arrayUnion(eventId)
  })
    .then(ref => {
      res.json({ message: `successfully updated user ${ref.id}` })
    })
    .catch(err => {
      console.log(err)
      res.json({ error: err })
    })
}

exports.promoteUser = function (req, res) {
  const userId = req.params.userId
  let userRef = usersRef.doc(userId)
  let updateUser = userRef.update({ isAdmin: true })
    .then(ref => {
      res.json({ message: `successfully updated user ${ref.id}` })
    })
    .catch(err => {
      console.log(err)
      res.json({ error: err })
    })
}

exports.demoteUser = function (req, res) {
  const userId = req.params.userId
  let userRef = usersRef.doc(userId)
  let updateUser = userRef.update({ isAdmin: false })
    .then(ref => {
      res.json({ message: `successfully updated user ${ref.id}` })
    })
    .catch(err => {
      console.log(err)
      res.json({ error: err })
    })
}
