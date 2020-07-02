// External Dependencies
const bcrypt = require('bcrypt')
const admin = require('firebase-admin')
const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy

// Firebase Config
const db = admin.firestore()
let usersRef = db.collection('users')

module.exports = function (passport) {
  passport.use(new LocalStrategy(
    { usernameField: 'email' },
    function(username, password, done) {
      let queryRef = usersRef.where('email', '==', username).get()
        .then(snapshot => {
          if (snapshot.empty) {
            return done(null, false, { message: 'No account with that email address.' })
          }

          let users = []
          snapshot.forEach(doc => {
            let innerUser = doc.data()
            innerUser.id = doc.id
            users.push(innerUser)
          })
          if (users.length > 1) console.log('Multiple users have the same email address.')
          let user = users[0]

          bcrypt.compare(password, user.password)
            .then(function(result) {
              const passwordIsAccurate = result
              if (!passwordIsAccurate) return done(null, false, { message: 'Incorrect password.' })
              delete user.password
              return done(null, user)
            })
            .catch(function(err) {
              return done(null, false, { message: 'There was an error logging in.' })
            })
        })
        .catch(function(err) {
          return done(null, false, { message: 'There was an error logging in.' })
        })
    }
  ))

  passport.serializeUser(function(user, done) {
    done(null, user.id)
  })

  passport.deserializeUser(function(id, done) {
    let getUser = usersRef.doc(id).get()
      .then(user => {
        if (!user.exists) {
          let err = { message: 'No user found' }
          done(err, null)
        } else {
          let extractedUser = user.data()
          extractedUser.id = user.id
          done(null, extractedUser)
        }
      })
      .catch(err => {
        done(err, null)
      })
  })
}
