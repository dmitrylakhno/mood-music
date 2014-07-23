// Requirements
var express = require('express'),
    MongoStore = require('connect-mongo')(express),
    flash = require('express-flash'),
    path = require('path'),
    mongoose = require('mongoose'),
    passport = require('passport'),
    expressValidator = require('express-validator');

// Controllers
var homeController = require('./controllers/home'),
    apiController = require('./controllers/api'),
    userController = require('./controllers/user');

// Config
var secrets = require('./config/secrets'),
    passportConf = require('./config/passport');

var hour = 3600000,
    day = (hour * 24),
    week = (day * 7),
    month = (day * 30);

var app = express();

mongoose.connect(secrets.db);
mongoose.connection.on('error', function () {
    console.error('✗ MongoDB Connection Error. Please make sure MongoDB is running.');
});

app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(require('connect-assets')({
    src: 'public',
    helperContext: app.locals
}));
app.use(express.compress());
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.cookieParser());
app.use(express.json());
app.use(express.urlencoded());
app.use(expressValidator());
app.use(express.methodOverride());
app.use(express.session({
    secret: secrets.sessionSecret,
    store: new MongoStore({
        db: mongoose.connection.db,
        auto_reconnect: true
    })
}));
app.use(express.csrf());
app.use(passport.initialize());
app.use(passport.session());
app.use(function (req, res, next) {
    res.locals.user = req.user;
    res.locals.token = req.csrfToken();
    res.locals.secrets = secrets;
    next();
});
app.use(flash());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public'), { maxAge: week }));
app.use(function (req, res) {
    res.status(404);
    res.render('404');
});
app.use(express.errorHandler());

app.get('/', homeController.index);
app.post('/api/tracks', apiController.getLastfm);
app.post('/api/files', apiController.getVkontakte);
app.get('/logout', userController.logout);
app.get('/auth/vkontakte', passport.authenticate('vkontakte', { scope: ['audio'] }));
app.get('/auth/vkontakte/callback', passport.authenticate('vkontakte', { successRedirect: '/', failureRedirect: '/' }));

app.listen(app.get('port'), function () {
    console.log("✔ Express server listening on port %d in %s mode", app.get('port'), app.settings.env);
});
