const passport = require('passport');
const User = require('../app/models/User');
const LocalStrategy = require('passport-local').Strategy;
const { body, validationResult } = require('express-validator');

passport.serializeUser(function (user, done) {
  done(null, user._id);
});

passport.deserializeUser(function (id, done) {
  User.findById({
    _id: id,
  })
    .then(function (user) {
      done(null, user);
    })
    .catch(function (err) {
      console.log(err);
    });
});

passport.use(
  'local.signup',
  new LocalStrategy(
    {
      usernameField: 'username',
      passwordField: 'password',
      passReqToCallback: true,
    },
    function (req, username, password, done) {
      User.findOne({ username: username }, function (err, user) {
        if (err) {
          return done(err);
        }
        if (user) {
          console.log('==============================');
          console.log(user);
          return done(null, false, {
            message: 'Tên đăng nhập này đã được sử dụng!',
          });
        }
        const newUser = new User();
        newUser.username = username;
        newUser.password = newUser.encryptPassword(password);
        newUser.save(function (err, result) {
          if (err) {
            return done(err);
          }
          return done(null, newUser);
        });
      }).clone();
    },
  ),
);

passport.use(
  'local.signin',
  new LocalStrategy(
    {
      usernameField: 'username',
      passwordField: 'password',
      passReqToCallback: true,
    },
    function (req, username, password, done) {
      User.findOne({ username: username }, function (err, user) {
        if (err) {
          return done(err);
        }
        if (!user) {
          return done(null, false, {
            message: 'Tên đăng nhập này không tồn tại!',
          });
        }
        if (!user.validPassword(password)) {
          return done(null, false, { message: 'Mật khẩu không đúng!' });
        }
        return done(null, user);
      }).clone();
    },
  ),
);
