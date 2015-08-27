var express = require('express');
var router = express.Router();
var _ = require('lodash');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', {
  	title: 'NC Open Data Hackshop | Waffle.io',
  	session: _.pick(req.user, ['accessToken', 'avatar', 'username'])
  });
});

module.exports = router;
