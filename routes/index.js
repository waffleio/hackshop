var express = require('express');
var router = express.Router();
var _ = require('lodash');

/* GET home page. */
router.get('/', function(req, res, next) {
  var user;
  if(req.user){
    user = _.pick(req.user, ['accessToken', 'avatar', 'username']);
    user.credentials = req.user._json.credentials;
  }
  res.render('index', {
    title: 'New Project | Code for Denver',
    session: user
  });
});

module.exports = router;
