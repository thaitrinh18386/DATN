const express = require('express');
const router = express.Router();

const cartController = require('../app/controllers/CartController');

router.post('/info-checkout', isLoggedIn, cartController.infoCheckout);
router.get('/info-checkout', isLoggedIn, cartController.checkout);
router.post('/qrcode', isLoggedIn, cartController.qrcodeCheckout);
router.get('/qrcode', isLoggedIn, cartController.qrcode);
router.post('/info-checkout-paypal', cartController.paypal);
router.get('/info-checkout-paypal', isLoggedIn, cartController.checkoutPaypal);
router.get('/add-cart/:id', cartController.addCart);
router.get('/add/:id', cartController.add);
router.get('/remove/:id', cartController.remove);
router.get('/reduce/:id', cartController.reduceByOne);
router.get('/cancel', cartController.cancel);
router.get('/success', cartController.success);
router.get('/', cartController.index);

module.exports = router;

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/signin');
}
