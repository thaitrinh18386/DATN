const path = require('path');
const express = require('express');
const morgan = require('morgan');
const methodOverride = require('method-override');
const { engine } = require('express-handlebars');
const session = require('express-session');
const passport = require('passport');
const flash = require('connect-flash');
const MongoStore = require('connect-mongo');
const paypal = require('paypal-rest-sdk');
const moment = require('moment');
const multer = require('multer');
// const fileUpload = require('express-fileupload');
const { body, validationResult } = require('express-validator');
const app = express();
const port = 3000;

const route = require('./routes');
const db = require('./config/db');
const { default: mongoose } = require('mongoose');

//Connect to database
db.connect();
require('./config/passport');

app.use(morgan('combined'));
app.use(
  express.urlencoded({
    extended: true,
  }),
);
app.use(express.json());
app.use(
  session({
    secret: 'mysuppersecret',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: 'mongodb://localhost:27017/DATN' }),
    cookie: { maxAge: 180 * 60 * 1000 },
  }),
);
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
app.use(methodOverride('_method'));

app.use(express.static(path.join(__dirname, 'public')));

//Express fileUpload Middleware
// app.use(fileUpload());

app.use(function (req, res, next) {
  res.locals.signin = req.isAuthenticated();
  res.locals.session = req.session;
  next();
});

paypal.configure({
  mode: 'sandbox', //sandbox or live
  client_id:
    'ATLDuy9r3MJOF4QV1wNJhs4w027I08Yo3_3LplwN11Q1BFHZINFSkrl188jcytyWbwXrO_J2apVtJTps',
  client_secret:
    'EBAFO1C0F4w9oz7u_vJ6cbYLDyqhTWRSKiwtAU0q28KAdLr7HdyGiIkeba1LNVa1zAjwx4tq9i1mQSiY',
});

// Template engine
app.engine(
  'hbs',
  engine({
    extname: '.hbs',
    helpers: {
      sum: (a, b) => a + b,
      done: a => {
        return a == 'Đã Giao Hàng';
      },
      processing: a => {
        return a == 'Đang Xử Lý';
      },
      loading: a => {
        return a == 'Đang Giao Hàng';
      },
      discount: (a, b) => {
        return a - (a * b) / 100;
      },
      admin: (a, b) => {
        return a === b;
      },
      formatDate: date => {
        return moment(date).format("HH:mm, DD/MM/YYYY");
      },
      json: function(context) {
        return JSON.stringify(context);
      }
    },
  }),
);
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'resources', 'views'));

app.locals.errors = null;

// Route init
route(app);

app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});
