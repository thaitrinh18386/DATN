const Product = require('../models/Product');
const Details = require('../models/Details');
const Comment = require('../models/Comment');
const Order = require('../models/Order');

class ProductsController {
  // [GET] /cars
  index(req, res, next) {
    // Product.find({}).lean()
    //   .then(products =>
    //     res.render('home', {products})
    //     )
    //   .catch(next);
    res.send('alo');
  }

  // [GET] /products/:name
  details(req, res, next) {
    Product.findOne({ name: req.params.name })
      .lean()
      .populate('details')
      .populate('comments')
      .then((detail) => res.render('products/details', {
        detail,
        user: req.user,
        username: req.user ? req.user.username : null
      }))
      .catch(next);
  }

// [GET] /products/:name/comments
comments(req, res, next) {
  const comment = new Comment({
    author: req.user.username,
    comment: req.body.comment,
    createdAt: req.body.createdAt
  })

  // if (req.order.status !== 'Đã Giao Hàng') {
  //   return res.status(403).json('Bạn chưa đặt hàng hoặc đơn hàng của bạn chưa có trạng thái "Đã Giao Hàng"');
  // }

  comment.save((err, result) => {
    if (err) {
      res.status(500).json('Đã xảy ra lỗi!')
    }
    else {
      Product.findOne({ name: req.params.name }, (err, data) => {
        if (err) {
          console.log(err)
          res.status(500).json('Đã xảy ra lỗi!');
        }
        else {
          data.comments.push(comment);
          data.save()
          res.redirect('back')
        }
      })
    }
  })
}

// [DELETE] /products/comments/:id
deleteComments(req, res, next) {
  Comment.deleteOne({ _id: req.params.id })
    .then(() => res.redirect('back'))
    .catch(next);
}

// [GET] /products/cars
cars(req, res, next) {
  var totalPage;
  var page = req.query.page || 1;
  var sort = req.query.sort;
  const PAGE_SIZE = 8;
  if (page) {
    page = parseInt(page);
    if (page < 1) {
      page = 1;
    }
    var skip = (page - 1) * PAGE_SIZE;

    Product.find({ category: 'cars' })
      .sort(sort)
      .skip(skip)
      .limit(PAGE_SIZE)
      .lean()
      .then((cars) => {
        Product.countDocuments({ category: 'cars' }).then((total) => {
          var totalPage = Math.ceil(total / PAGE_SIZE);
          res.render('products/cars', {
            cars,
            totalPage,
            total,
          });
        });
      })
      .catch((err) => {
        res.status(500).json('Lỗi server 2');
      });
  } else {
    Product.find({ category: 'cars' })
      .sort(sort)
      .skip(skip)
      .limit(PAGE_SIZE)
      .lean()
      .then((cars) => {
        res.render('products/cars', { cars });
      })
      .catch((err) => {
        res.status(500).json('Lỗi server 1');
      });
  }
}

// [GET] /products/motos
motos(req, res, next) {
  var totalPage;
  var page = req.query.page || 1;
  var sort = req.query.sort;
  const PAGE_SIZE = 8;
  if (page) {
    page = parseInt(page);
    if (page < 1) {
      page = 1;
    }
    var skip = (page - 1) * PAGE_SIZE;

    Product.find({ category: 'motos' })
      .sort(sort)
      .skip(skip)
      .limit(PAGE_SIZE)
      .lean()
      .then((motos) => {
        Product.countDocuments({ category: 'motos' }).then((total) => {
          var totalPage = Math.ceil(total / PAGE_SIZE);
          res.render('products/motos', {
            motos,
            totalPage,
            total,
          });
        });
      })
      .catch((err) => {
        res.status(500).json('Lỗi server 2');
      });
  } else {
    Product.find({ category: 'motos' })
      .sort(sort)
      .skip(skip)
      .limit(PAGE_SIZE)
      .lean()
      .then((motos) => {
        res.render('products/motos', { motos });
      })
      .catch((err) => {
        res.status(500).json('Lỗi server 1');
      });
  }
}
}

module.exports = new ProductsController();
