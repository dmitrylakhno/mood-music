var _ = require('underscore');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var OAuthStrategy = require('passport-oauth').OAuthStrategy;
var OAuth2Strategy = require('passport-oauth').OAuth2Strategy;
var VkontakteStrategy = require('passport-vkontakte').Strategy;
var User = require('../models/User');
var secrets = require('./secrets');

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  });
});

passport.use(new VkontakteStrategy(secrets.vkontakte, function(accessToken, refreshToken, profile, done) {
  if (profile.id) {
    User.findOne({ vkontakte: profile.id }, function(err, existingUser) {
      if (existingUser) {
        existingUser.tokens = { kind: 'vkontakte', accessToken: accessToken };
        existingUser.save(function(err) {
          done(err, existingUser);
        });
      } else {
        var user = new User();
        user.email = profile.username + "@vk.com";
        user.vkontakte = profile.id;
        user.tokens = { kind: 'vkontakte', accessToken: accessToken };
        user.profile.name = profile.displayName;
        user.profile.picture = profile._json.photo;
        user.save(function(err) {
          done(err, user);
        });
      }
    });
  }
}));

exports.isAuthenticated = function(req, res, next) {
  if (req.isAuthenticated()) return next();
  res.redirect('/login');
};

exports.isAuthorized = function(req, res, next) {
  var provider = req.path.split('/').slice(-1)[0];
  if (_.findWhere(req.user.tokens, { kind: provider })) next();
  else res.redirect('/auth/' + provider);
};
