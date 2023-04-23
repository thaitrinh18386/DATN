const express = require('express');
const router = express.Router();
const adminController = require('../app/controllers/AdminController');
const multer = require('multer');
const path = require('path');
const mkdirp = require('mkdirp');
const fs = require('fs-extra');
const resizeImg = require('resize-img');

//upload multiple files
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../public/imgs'));
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 1024 * 1024 * 10 },
  fileFilter: function (req, file, cb) {
    if (file.mimetype !== 'image/png' && file.mimetype !== 'image/jpg' && file.mimetype !== 'image/jpeg') {
      return cb(new Error('Only .png, .jpg and .jpeg files are allowed'));
    }
    cb(null, true);
  },
}).array('images', 4);

router.get('/revenue-statistics', isLoggedIn, isAdmin, adminController.revenueStatistics);
router.delete('/list-order/:id', isLoggedIn, isAdmin, adminController.deleteOrder);
router.put('/list-order/:id', isLoggedIn, isAdmin, adminController.updateOrder);
router.get('/:id/edit-order', isLoggedIn, isAdmin, adminController.editOrder);
router.get('/list-order', isLoggedIn, isAdmin, adminController.listOrder);
router.delete('/list-user/:id', isLoggedIn, isAdmin, adminController.deleteUser);
router.get('/list-user', isLoggedIn, isAdmin, adminController.listUser);
router.get('/create-product', isLoggedIn, isAdmin, adminController.create);
router.post('/store', upload, adminController.store);
router.get('/list-product', isLoggedIn, isAdmin, adminController.listProduct);
router.get('/:id/edit', isLoggedIn, isAdmin, adminController.edit);
router.put('/:id', isLoggedIn, isAdmin, adminController.update);
router.delete('/:id', isLoggedIn, isAdmin, adminController.delete);
router.get('/', isLoggedIn, isAdmin, adminController.index);

module.exports = router;

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/signin');
}

function isAdmin(req, res, next) {
  if (req.user.username === 'admin') {
    return next();
  }
  res.redirect('/');
}
