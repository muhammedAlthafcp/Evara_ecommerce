const isAuth = function (req, res, next) {
  if (req.session.loggedIn) {
    req.user = req.session.user;
    next();
  } else {
    if (req.xhr) { // Check if it's an AJAX request
      return res.status(401).json({ message: 'Unauthorized' });
    } else {
      res.render("users/page-login-register");
    }
  }
};
module.exports = isAuth;
