const passport = require('passport');
const Product = require('../models/Product');
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const LocalStrategy = require('passport-local').Strategy;
const User = require('../models/User');
const csrf = require('csurf');
const { session } = require('passport');

class SiteController {
  // [GET] /home
  index(req, res, next) {
    Promise.all([
      Product.find({ category: 'cars' }).limit(8).lean(),
      Product.find({ category: 'motos' }).limit(8).lean(),
    ])
      .then(([cars, motos]) => {
        res.render('home', { cars, motos });
      })
      .catch(next);
  }

  // [GET] /search
  search(req, res, next) {
    var sort = req.query.sort;
    if (!req.query.q) {
      return res.json([]);
    }
    var sortQuery = {};
    if (sort === 'price') {
      sortQuery = { price: 1 };
    } else if (sort === '-price') {
      sortQuery = { [-price]: -1 };
    } else if (sort === 'createdAt') {
      sortQuery = { createdAt: 1 };
    } else if (sort === '-createdAt') {
      sortQuery = { [-createdAt]: -1 };
    } else {
      sortQuery = {};
    }
    Product.find({ name: { $regex: req.query.q, $options: 'i' } })
      .lean()
      .sort(sortQuery)
      //hàm regex trả về những giá trị phù hợp với "từ khóa" tìm kiếm
      .then((products) => {
        if (products.length === 0) {
          return res.render('search-fail');
        }
        return res.render('search', { products });
      })
      .catch(next);
  }

  // [GET] /signin
  signin(req, res, next) {
    const messages = req.flash('error');
    res.render('signin', {
      // csrfToken: req.csrfToken(),
      messages: messages,
      hasErrors: messages.length > 0,
    });
  }

  //[POST]/signup
  signinwith = (req, res, next) => {
    let successRedirect = '/';
    if (req.body.username === 'admin') {
      successRedirect = '/admin';
    }
    passport.authenticate('local.signin', {
      successReturnToOrRedirect: successRedirect,
      failureRedirect: '/signin',
      failureFlash: true,
    })(req, res, next);
  };

  // [GET] /signup
  signup(req, res, next) {
    const messages = req.flash('error');
    res.render('signup', {
      // csrfToken: req.csrfToken(),
      messages: messages,
      hasErrors: messages.length > 0,
    });
  }

  //[POST]/signup
  signupwith = (req, res, next) => {
    passport.authenticate('local.signup', {
      successReturnToOrRedirect: '/signin',
      failureRedirect: '/signup',
      failureFlash: true,
      // session: false
    })(req, res, next);
    console.log(req.body);
  };

  //[GET] /profile
  profile(req, res, next) {
    Order.find({ user: req.user }).lean()
      .exec(function (err, orders) {
        if (err) {
          return res.status(500).json('Đã xảy ra lỗi!')
        }
        var cart;
        orders.forEach(function (order) {
          cart = new Cart(order.cart);
          order.items = cart.generateArray()
        })
        res.render('profile', { orders })
      })
  }

  //[POST] /profile/:id
  profileUpdate(req, res, next) {
    Order.updateOne({ _id: req.params.id }, {status: req.body.status})
      .then(() => res.redirect('/profile'))
      .catch(next)
  }

  //[GET] /signout
  signout(req, res, next) {
    req.logout(function (err) {
      if (err) {
        return err;
      }
      res.redirect('/');
    });
  }
}

module.exports = new SiteController();
