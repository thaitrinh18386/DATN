const Product = require('../models/Product');
const User = require('../models/User');
const Order = require('../models/Order');
const Details = require('../models/Details');
const Cart = require('../models/Cart');
const { body, validationResult } = require('express-validator');
const fs = require('fs-extra');
const path = require('path');
const moment = require('moment');
const { format } = require('date-fns');

class AdminController {
  // [GET] /admin
  index(req, res, next) {
    // res.render('admin/home', { layout: 'admin' });
    const totalProduct = new Promise((resolve, reject) => {
      Product.find({}).lean()
        .then((products) => resolve(products.length))
        .catch(next)
    })
    const totalUser = new Promise((resolve, reject) => {
      User.find({}).lean()
        .then((users) => resolve(users.length))
        .catch(next)
    })
    const totalOrder = new Promise((resolve, reject) => {
      Order.find({}).lean()
        .then((orders) => resolve(orders.length))
        .catch(next)
    })
    Promise.all([totalProduct, totalUser, totalOrder])
      .then((total) => {
        res.render('admin/home',
          {
            totalProduct: total[0],
            totalUser: total[1],
            totalOrder: total[2],
            layout: 'admin'
          })
      })
  }
  //[GET] /admin/create
  create(req, res, next) {
    res.render('admin/create-product', { layout: 'admin' });
  }
  //[POST] /admin/store
  store(req, res, next) {
    console.log(req.files);
    const products = new Product(req.body);
    products.images = req.files.map(file => path.basename(file.path));
    products.save((err, result) => {
      console.log(result);
      if (err) {
        console.log(err);
      } else {
        const detail = new Details(req.body);
        detail.save((err, details) => {
          Product.findOne({ _id: result._id }, (err, data) => {
            if (err) {
              console.log(err);
            } else {
              data.details = details._id;
              data.save();
              res.redirect('/admin/list-product');
            }
          });
        });
      }
    });
  }

  //[GET] /admin/list-product
  listProduct(req, res, next) {
    Product.find({})
      .lean()
      .then((products) =>
        res.render('admin/list-product', { products, layout: 'admin' }),
      )
      .catch(next);
  }
  // [GET] /admin/:id/edit
  edit(req, res, next) {
    Product.findById(req.params.id)
      .lean()
      .populate('details')
      .then((products) => {
        res.render('admin/edit-product', { products, layout: 'admin' });
        // console.log(products)
      })
      .catch(next);
  }

  // [PUT] /admin:id
  update(req, res, next) {
    Product.findById(req.params.id)
      .lean()
      .populate('details')
      .then((products) => {
        // console.log(products)
        Product.updateOne({ _id: products._id }, req.body).then();
        Details.updateOne({ _id: products.details }, req.body)
          .then(() => res.redirect('/admin/list-product'), { layout: 'admin' })
          .catch(next);
      })
      .catch(next);
  }
  //[DELETE] /admin:id
  delete(req, res, next) {
    Product.deleteOne({ _id: req.params.id })
      .then(() => res.redirect('back'))
      .catch(next);
  }

  //[GET] /admin/list-user
  listUser(req, res, next) {
    User.find({})
      .lean()
      .then((users) =>
        res.render('admin/list-user', { users, layout: 'admin' }),
      )
      .catch(next);
  }

  //[DELETE] 
  deleteUser(req, res, next) {
    User.deleteOne({ _id: req.params.id })
      .then(() => res.redirect('back'))
      .catch(next);
  }

  //[GET] /admin/list-order
  listOrder(req, res, next) {
    Order.find({})
      .lean()
      .then((orders) =>
        res.render('admin/list-order', { orders, layout: 'admin' }),
      )
      .catch(next);
  }

  // [GET] /admin/:id/edit
  editOrder(req, res, next) {
    Order.findById(req.params.id)
      .lean()
      .then((orders) => {
        res.render('admin/edit-order', { orders, layout: 'admin' });
      })
      .catch(next);
  }

  updateOrder(req, res, next) {
    Order.updateOne({ _id: req.params.id }, req.body)
      .then(() => res.redirect('/admin/list-order'))
      .catch(next)
  }

  //[DELETE] /admin/list-order:id
  deleteOrder(req, res, next) {
    Order.deleteOne({ _id: req.params.id })
      .then(() => res.redirect('back'))
      .catch(next);
  }

  // [GET] /admin/revenue-statistics

  revenueStatistics(req, res, next) {
    Order.find({ status: 'Đã Giao Hàng' }).lean()
      .then(data => {
        const totalPriceByDate = new Map();
        const totalProfitByDate = new Map();
        var profit = 0;
        var updatedAtFormatted;

        data.forEach(function (order, i) {
          var totalPrice = 0;
          var totalCost = 0;

          var cart = new Cart(order.cart);
          order.items = cart.generateArray();

          order.items.forEach(function (item) {
            var price = item.item.price * item.qty;
            var cost = item.item.cost * item.qty;

            totalPrice += price;
            totalCost += cost;
          });

          updatedAtFormatted = format(order.updatedAt, 'yyyy-MM-dd');

          // Nếu đã có tổng giá trị của ngày này, thì cộng thêm totalPrice của order vào tổng giá trị đó
          if (totalPriceByDate.has(updatedAtFormatted)) {
            totalPriceByDate.set(updatedAtFormatted, totalPriceByDate.get(updatedAtFormatted) + totalPrice);
          } else {
            totalPriceByDate.set(updatedAtFormatted, totalPrice);
          }

          if (totalProfitByDate.has(updatedAtFormatted)) {
            totalProfitByDate.set(updatedAtFormatted, totalProfitByDate.get(updatedAtFormatted) + (totalPrice - totalCost));
          } else {
            totalProfitByDate.set(updatedAtFormatted, totalPrice - totalCost);
          }
        });

        const updatedAtFormattedArr = Array.from(totalPriceByDate.keys());
        const profitArr = Array.from(totalProfitByDate.values());
        const priceArr = Array.from(totalPriceByDate.values());
        console.log(updatedAtFormattedArr)

        res.render('admin/revenue-statistics', {
          data: {
            price: priceArr,
            profit: profitArr,
            updatedAtFormatted: updatedAtFormattedArr
          },
          layout: 'admin'
        });
      })
      .catch(next)
  }


}
module.exports = new AdminController();
