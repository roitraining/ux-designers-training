exports.addUserToViews = function (req, res, next) {
  res.locals.user = req.user
  next()
}

exports.isAuthenticated = function (req, res, next) {
  if (!req.user) {
    res.redirect('/login')
    return
  }
  next()
}

exports.isAdmin = function (req, res, next) {
  if (req.user && req.user.isAdmin) {
    next()
  } else {
    res.redirect('/')
  }
}
