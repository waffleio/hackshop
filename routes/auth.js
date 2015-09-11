var express = require('express');
var router = express.Router();
var passport = require('passport');

router.get('/waffle', passport.authenticate('waffle', {scope: '*'}));
router.get('/waffle/callback',
passport.authenticate('waffle', { failureRedirect: '/' }), function(req, res) {
  res.redirect('/');
});

module.exports = router;
