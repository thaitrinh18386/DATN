const express = require('express');
const router = express.Router();

const Order = require('../app/models/Order');
const productsController = require('../app/controllers/ProductsController');

router.get('/cars', productsController.cars);
router.get('/motos', productsController.motos);
router.delete('/comments/:id', isAdmin, productsController.deleteComments);
router.post('/:name/comments', productsController.comments);
router.get('/:name', productsController.details);
router.get('/', productsController.index);

module.exports = router;

function isAdmin(req, res, next) {
  if (req.user.username === 'admin') {
    return next();
  }
  res.redirect('/');
}
// Middleware kiểm tra trạng thái của đơn hàng
function checkOrderStatus(req, res, next) {
  Order.findOne({ user: req.user._id, status: 'Đã Giao Hàng' }, (err, order) => {
    if (err) {
      return res.status(500).json('Đã xảy ra lỗi!');
    }
    if (!order) {
      return res.status(403).json('Bạn chưa đặt hàng hoặc đơn hàng của bạn chưa có trạng thái "Đã Giao Hàng"');
    }
    req.order = order;
    next();
  });
}