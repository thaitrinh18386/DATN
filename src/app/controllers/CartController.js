const Product = require('../models/Product');
const Details = require('../models/Details');
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const dateFormat = require('date-format');
const querystring = require('qs');
const crypto = require('crypto');
const csrf = require('csurf');
var paypal = require('paypal-rest-sdk');
const QRCode = require('qrcode');

class CartController {
  // [GET] /cart
  index(req, res, next) {
    if (!req.session.cart) {
      return res.render('cart', { products: null });
    }
    const cart = new Cart(req.session.cart);
    res.render('cart', {
      products: cart.generateArray(),
      totalPrice: cart.totalPrice,
      totalQty: cart.totalQty,
      formattedPrice: cart.formattedPrice,
      formattedPriceUsd: cart.formattedPriceUsd,
    });
  }

  // [GET] /add-cart/:id
  addCart(req, res, next) {
    const idProduct = req.params.id;
    const cart = new Cart(req.session.cart ? req.session.cart : {});
    Product.findById(idProduct, function (err, product) {
      if (err) {
        return res.json(err);
      }
      cart.add(product, product.id);
      req.session.cart = cart;
      console.log(cart);
      res.redirect('/');
    });
  }

  // [GET] /add/:id
  add(req, res, next) {
    const idProduct = req.params.id;
    const cart = new Cart(req.session.cart ? req.session.cart : {});
    Product.findById(idProduct, function (err, product) {
      if (err) {
        return res.json(err);
      }
      cart.add(product, product.id);
      req.session.cart = cart;
      console.log(cart);
      console.log('===========');
      console.log(cart.generateArray());
      res.redirect('/cart');
    });
  }

  // [GET] /reduce/:id
  reduceByOne(req, res, next) {
    const idProduct = req.params.id;
    const cart = new Cart(req.session.cart ? req.session.cart : {});

    cart.reduceByOne(idProduct);
    req.session.cart = cart;
    // console.log(cart)
    // console.log(cart.items)
    res.redirect('/cart');
  }

  // [GET] /remove/:id
  remove(req, res, next) {
    const idProduct = req.params.id;
    const cart = new Cart(req.session.cart ? req.session.cart : {});

    cart.remove(idProduct);
    req.session.cart = cart;
    console.log(cart);
    res.redirect('/cart');
  }

  // [GET] /qrcode
  qrcode(req, res, next) {
    let page = '';
    const cart = req.session.cart
    const amount = cart.totalPrice
    const bankId = 'BIDV'; // tên ngân hàng
    const accountNumber = '21510002478291'; // số tài khoản
    const accountName = 'TRINH VAN THAI'; // tên tài khoản
    const desc = 'Điền số điện thoại của bạn'; // tên tài khoản
    const uri = `https://img.vietqr.io/image/${bankId}-${accountNumber}-compact2.png?amount=${amount}&addInfo=${desc}&accountName=${accountName}`;
    console.log(uri)
    page = `
      <image class="img-qr" src= " ` + uri + `" style="display: block; margin: 0 auto;" />
      <div class="btn-check" style="display: flex; justify-content: space-around;">
        <a class="btn btn-qr" href="/" role="button" style="
          display: inline-block; 
          text-align: center;
          text-decoration: none;
          color: white;
          width: 200px;
          background-color: #fa6e4f;
          height: 22px;
        ">Quay lại trang chủ!</a>
        <form class="check" action="/cart/qrcode" method="POST" style="display: inline-block;">
          <div class="form-group">
            <input type="hidden" class="form-control">
          </div>
          <button type="submit" data-toggle="modal" data-target="#deleteItem" 
            style="border: none;
            background-color: #fa6e4f;
            color: white;
            width: 230px;
            height: 22px;
            cursor: pointer;" 
          >Xác nhận đã thanh toán</button>
        </form>
      </div>
      <script>
        var doneCheck = document.getElementsByClassName("check")
        for (var i = 0; i < doneCheck.length; i++) {
          doneCheck[i].addEventListener("submit", function (event) {
            let confirm = window.confirm("Bạn chắc chắn đã thanh toán thành công?")
            if (!confirm) {
              event.preventDefault()
            }
          })
        }
      </script>
    `
    return res.send(page);
  }

  // [POST] /cart/qrcode
  qrcodeCheckout(req, res, next) {
    if (!req.session.cart) {
      res.redirect("/cart");
    }
    var cart = new Cart(req.session.cart)
    console.log(req.user)
    var order = new Order({
      user: req.user,
      cart: cart,
      address: 'Đang cập nhật',
      name: req.user.username,
      phone: 'Đang cập nhật',
      status: 'Đang Xử Lý'
    });
    console.log(order)
    order.save(function (err, result) {
      console.log(result)
      console.log(err)
      req.session.cart = null
      res.redirect('/')
    })
  }

  // [GET] /info-checkout
  checkout(req, res, next) {
    const cart = new Cart(req.session.cart);
    res.render('info-checkout', {
      products: cart.generateArray(),
      totalPrice: cart.totalPrice,
      totalQty: cart.totalQty,
      formattedPrice: cart.formattedPrice,
    });
  }

  // [POST] /cart
  infoCheckout(req, res, next) {
    if (!req.session.cart) {
      res.redirect("/cart");
    }
    var cart = new Cart(req.session.cart)
    console.log(req.user)
    var order = new Order({
      user: req.user,
      cart: cart,
      address: req.body.address,
      name: req.body.name,
      phone: req.body.phone,
      status: 'Đang Xử Lý'
    });
    order.save(function (err, result) {
      req.session.cart = null
      res.redirect('/')
    })
  }

  // [GET] /info-checkout-paypal
  checkoutPaypal(req, res, next) {
    const cart = new Cart(req.session.cart);
    res.render('info-checkout-paypal', {
      products: cart.generateArray(),
      totalPrice: cart.totalPrice,
      totalQty: cart.totalQty,
      formattedPrice: cart.formattedPrice,
    });
  }

  // [POST] /cart
  paypal(req, res, next) {
    var cart = new Cart(req.session.cart)
    console.log(req.user)
    var order = new Order({
      user: req.user,
      cart: cart,
      address: req.body.address,
      name: req.body.name,
      phone: req.body.phone,
      status: 'Đang Xử Lý'
    });
    order.save(function (err, result) {
      req.session.cart = null
    })

    const totalPrice = cart.totalPrice;
    const formattedPriceUsd = cart.formattedPriceUsd;
    let arr = cart.generateArray();
    let items = [];
    let itemsTotalPrice = 0;
    arr.forEach(({ item, qty }) => {
      let toNumber = item.price;
      const toUsd = (toNumber / 23500).toFixed(2);
      function getRandomInt(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1)) + min;
      }

      let randomInt = getRandomInt(1, 1000);
      items.push({
        name: item.name,
        sku: randomInt.toString(),
        price: toUsd,
        currency: 'USD',
        quantity: qty,
      });
    });
    for (let i = 0; i < items.length; i++) {
      itemsTotalPrice +=
        parseFloat(items[i].price).toFixed(2) * items[i].quantity;
      console.log(itemsTotalPrice);
    }
    itemsTotalPrice = itemsTotalPrice.toFixed(2);
    req.session.itemsTotalPrice = itemsTotalPrice;
    console.log(itemsTotalPrice);
    console.log(formattedPriceUsd);
    console.log(items);
    var create_payment_json = {
      intent: 'sale',
      payer: {
        payment_method: 'paypal',
      },
      redirect_urls: {
        return_url: 'http://localhost:3000/cart/success',
        cancel_url: 'http://localhost:3000/cart/cancel',
      },
      transactions: [
        {
          item_list: {
            items: items,
          },
          amount: {
            currency: 'USD',
            total: itemsTotalPrice.toString(),
          },
          description: 'Thanh toán đơn hàng của bạn.',
        },
      ],
    };
    console.log(create_payment_json.transactions);
    paypal.payment.create(create_payment_json, function (error, payment) {
      if (error) {
        throw error;
      } else {
        for (let i = 0; i < payment.links.length; i++) {
          if (payment.links[i].rel === 'approval_url') {
            res.redirect(payment.links[i].href);
          }
        }
      }
    });
  }

  cancel(req, res, next) {
    res.render('cancel');
  }

  success(req, res, next) {
    const itemsTotalPrice = req.session.itemsTotalPrice;
    console.log(itemsTotalPrice);
    console.log('===============');
    const payerID = req.query.PayerID;
    var execute_payment_json = {
      payer_id: payerID,
      transactions: [
        {
          amount: {
            currency: 'USD',
            total: itemsTotalPrice.toString(),
          },
        },
      ],
    };

    var paymentId = req.query.paymentId;

    paypal.payment.execute(
      paymentId,
      execute_payment_json,
      function (error, payment) {
        if (error) {
          console.log(error.response);
          throw error;
        } else {
          console.log('Get Payment Response');
          console.log(JSON.stringify(payment));
          console.log('======================');
          req.session.destroy();
          res.render('success');
        }
      },
    );
  }
}

module.exports = new CartController();
