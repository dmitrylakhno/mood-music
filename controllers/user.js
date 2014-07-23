var passport = require('passport'),
    _ = require('underscore'),
    User = require('../models/User');

exports.getLogin = function (req, res) {
    if (req.user) {
        return res.redirect('/');
    }
    res.render('account/login', {
        title: 'Login'
    });
};

exports.postLogin = function (req, res, next) {
    req.assert('email', 'Email is not valid').isEmail();
    req.assert('password', 'Password cannot be blank').notEmpty();

    var errors = req.validationErrors();

    if (errors) {
        req.flash('errors', errors);
        return res.redirect('/login');
    }

    passport.authenticate('local', function (err, user, info) {
        if (err) { return next(err); }

        if (!user) {
            req.flash('errors', { msg: info.message });
            return res.redirect('/login');
        }
        req.logIn(user, function (err) {
            if (err) { return next(err); }
            req.flash('success', { msg: 'Success! You are logged in.' });
            return res.redirect('/');
        });
    })(req, res, next);
};

exports.logout = function (req, res) {
    req.logout();
    res.redirect('/');
};

exports.getSignup = function (req, res) {
    if (req.user) { return res.redirect('/'); }
    res.render('account/signup', {
        title: 'Create Account'
    });
};

exports.postSignup = function (req, res, next) {
    req.assert('email', 'Email is not valid').isEmail();
    req.assert('password', 'Password must be at least 4 characters long').len(4);
    req.assert('confirmPassword', 'Passwords do not match').equals(req.body.password);

    var errors = req.validationErrors();

    if (errors) {
        req.flash('errors', errors);
        return res.redirect('/signup');
    }

    var user = new User({
        email: req.body.email,
        password: req.body.password
    });

    user.save(function (err) {
        if (err) {
            if (err.code === 11000) {
                req.flash('errors', { msg: 'User with that email already exists.' });
            }
            return res.redirect('/signup');
        }
        req.logIn(user, function (err) {
            if (err) { return next(err); }
            res.redirect('/');
        });
    });
};

exports.getAccount = function (req, res) {
    res.render('account/profile', {
        title: 'Account Management'
    });
};

exports.postUpdateProfile = function (req, res, next) {
    User.findById(req.user.id, function (err, user) {
        if (err) { return next(err); }

        user.email = req.body.email || '';
        user.profile.name = req.body.name || '';
        user.profile.gender = req.body.gender || '';
        user.profile.location = req.body.location || '';
        user.profile.website = req.body.website || '';

        user.save(function (err) {
            if (err) { return next(err); }

            req.flash('success', { msg: 'Profile information updated.' });
            res.redirect('/account');
        });
    });
};

exports.postUpdatePassword = function (req, res, next) {
    req.assert('password', 'Password must be at least 4 characters long').len(4);
    req.assert('confirmPassword', 'Passwords do not match').equals(req.body.password);

    var errors = req.validationErrors();

    if (errors) {
        req.flash('errors', errors);
        return res.redirect('/account');
    }

    User.findById(req.user.id, function (err, user) {
        if (err) { return next(err); }

        user.password = req.body.password;
        user.save(function (err) {
            if (err) { return next(err); }
            req.flash('success', { msg: 'Password has been changed.' });
            res.redirect('/account');
        });
    });
};

exports.postDeleteAccount = function (req, res, next) {
    User.remove({ _id: req.user.id }, function (err) {
        if (err) { return next(err); }

        req.logout();
        res.redirect('/');
    });
};

exports.getOauthUnlink = function (req, res, next) {
    var provider = req.params.provider;
    User.findById(req.user.id, function (err, user) {
        if (err) { return next(err); }

        user[provider] = undefined;
        user.tokens = _.reject(user.tokens, function (token) {
            return token.kind === provider;
        });

        user.save(function (err) {
            if (err) { return next(err); }

            req.flash('info', { msg: provider + ' account has been unlinked.' });
            res.redirect('/account');
        });
    });
};
