const Product = require('./Product');
module.exports = function Cart(oldCart) {
  this.items = oldCart.items || {};
  this.totalQty = oldCart.totalQty || 0;
  this.totalPrice = oldCart.totalPrice || 0;
  this.formattedPrice = oldCart.formattedPrice || 0;
  this.formattedPriceUsd = oldCart.formattedPriceUsd || 0;

  this.add = (item, id) => {
    var storeItem = this.items[id];
    if (!storeItem) {
      storeItem = this.items[id] = { item: item, qty: 0, price: 0 };
    }
    storeItem.qty++;
    storeItem.price = (storeItem.item.price * storeItem.qty).toLocaleString();
    this.totalQty++;
    let formattedPrice = (this.totalPrice += storeItem.item.price);
    this.formattedPrice = this.totalPrice.toLocaleString();
    console.log(this.totalPrice);
    let formattedPriceUsd = (this.totalPrice / 23500).toFixed(2);
    console.log(formattedPriceUsd);
    this.formattedPriceUsd = formattedPriceUsd;
    console.log(this.formattedPriceUsd);
    Product.findByIdAndUpdate(id, { $inc: { quantity: -1 } }, function (err, product) {
      if (err) {
        console.log(err);
      } else {
        console.log('Product quantity updated.');
      }
    });
  };

  this.reduceByOne = function (id) {
    this.items[id].qty--;
    let price = parseFloat(this.items[id].price);
    if (Number.isInteger(price)) {
      price = price * 1000;
    } else {
      price = price * 1000000;
    }
    price -= this.items[id].item.price;
    this.items[id].price = price.toLocaleString();
    this.totalQty--;
    this.totalPrice -= this.items[id].item.price;
    this.formattedPrice = this.totalPrice.toLocaleString();
    let formattedPriceUsd = (this.totalPrice / 23500).toFixed(2);
    console.log(formattedPriceUsd);
    this.formattedPriceUsd = formattedPriceUsd;
    console.log(this.formattedPriceUsd);
    if (this.items[id].qty <= 0) {
      delete this.items[id];
    }
    Product.findByIdAndUpdate(id, { $inc: { quantity: +1 } }, function (err, product) {
      if (err) {
        console.log(err);
        
      } else {
        console.log('Product quantity updated.');
      }
    });
  };

  this.remove = function (id) {
    this.totalQty -= this.items[id].qty;
    let price = parseFloat(this.items[id].price);
    if (Number.isInteger(price)) {
      price = price * 1000;
    } else {
      price = price * 1000000;
    }
    console.log(price);
    console.log(this.totalPrice);
    this.totalPrice -= price;
    this.formattedPrice = this.totalPrice.toLocaleString();
    let formattedPriceUsd = (this.totalPrice / 23500).toFixed(2);
    this.formattedPriceUsd = formattedPriceUsd;
    console.log(this.formattedPriceUsd);
    delete this.items[id];
  };

  this.generateArray = function () {
    const arr = [];
    for (const id in this.items) {
      arr.push(this.items[id]);
    }
    return arr;
  };
};
