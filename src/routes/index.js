const productsRouter = require('./products');
const adminRouter = require('./admin');
const siteRouter = require('./site');
const cartRouter = require('./cart');

function route(app) {
  app.use('/cart', cartRouter);
  app.use('/admin', adminRouter);
  app.use('/products', productsRouter);
  app.use('/', siteRouter);
}

module.exports = route;
