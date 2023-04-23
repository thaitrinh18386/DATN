const express = require('express');
const router = express.Router();
// const csrf = require('csurf');
// const csrfProtection = csrf();
// const passport = require('passport');

// router.use(csrfProtection);

const siteController = require('../app/controllers/SiteController');

router.post('/signin', siteController.signinwith);
router.get('/signin', siteController.signin);
router.post('/signup', siteController.signupwith);
router.get('/signup', siteController.signup);
router.post('/profile/:id', isLoggedIn, siteController.profileUpdate);
router.get('/profile', isLoggedIn, siteController.profile);
router.get('/signout', isLoggedIn, siteController.signout);
router.get('/search', siteController.search);
// router.use('/', notLoggedIn, function (req, res, next) {
//   next();
// });
router.get('/', siteController.index);

module.exports = router;

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/signin');
}

// function notLoggedIn(req, res, next) {
//   if (!req.isAuthenticated()) {
//     return next();
//   }
//   res.redirect('/')
// }
