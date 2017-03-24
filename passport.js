var passport = require('passport'),
  WaffleStrategy  = require('passport-waffle.io').Strategy;

module.exports = {
  init: function(app) {
    passport.serializeUser(function(user, done) {
      done(null, user);
    });

    passport.deserializeUser(function(obj, done) {
      done(null, obj);
    });

    passport.use(new WaffleStrategy({
      baseURL: 'https://waffle.io',
      clientID: process.env.HACKSHOP_WAFFLE_CLIENT_ID,
      clientSecret: process.env.HACKSHOP_WAFFLE_CLIENT_SECRET,
      callbackURL: (process.env.HACKSHOP_BASE_URL || 'http://localhost:3000') + '/auth/waffle/callback',
      userAgent: 'hackshop.waffle.io'
    }, function(accessToken, refreshToken, profile, done) {
      profile.accessToken = accessToken;
      process.nextTick(function () {
        return done(null, profile);
      });
    }
    ));

    return passport;
  }
};
