const isAdmin = (req, res, next) => {
    if ( req.session.admin) {
      console.log(req.session.admin);
      
      next();
    } else {
        res.redirect('/Users/page-login-register');
    }
  };

  module.exports = isAdmin