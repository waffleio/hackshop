var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'NC Open Data Hackshop | Waffle.io' });
});

module.exports = router;
