// Config Variables
const saltRounds = 10

// External Dependencies
const bcrypt = require('bcrypt')
const admin = require('firebase-admin')
const passport = require('passport')

// Firebase Config
const db = admin.firestore()

// Controller Methods
exports.home = function (req, res) {
  // res.render('home')
  res.redirect('/events')
}

exports.about = function (req, res) {
  res.render('about')
}

exports.contact = function (req, res) {
  res.render('contact')
}

exports.loginPage = function (req, res) {
  res.render('login')
}

exports.register = function (req, res) {
  // consider flash notification for failures

  const name = req.body.name
  const email = req.body.email
  const password = req.body.password
  const events = []

  if (!email || !password) {
    req.redirect('/login')
    return
  }

  bcrypt.hash(password, saltRounds)
    .then(function(hashedPassword) {
      let addUser = db.collection('users').add({
        name: name,
        email: email,
        password: hashedPassword,
        events: []
      })
      .then(function(){
        res.redirect('/login')
      })
      .catch((err) => {
        console.log('Firestore Error: ', err)
        res.redirect('/login')
      })
    })
    .catch((err) => {
      console.log('Bcrypt Error: ', err)
      res.redirect('/login')
    })

}

exports.logout = function(req, res) {
  req.logout()
  res.redirect('/')
}
