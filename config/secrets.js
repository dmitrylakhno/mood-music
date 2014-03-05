module.exports = {
  db: 'mongodb://LOGIN:PASSWORD@SERVER:PORT/COLLECTION',

  localAuth: true,
  sessionSecret: "SUPERSECURESTRINGHERE",

  lastfm: {
    api_key: '',
    secret: ''
  },

  vkontakte: {
    clientID:     '',
    clientSecret: '',
    callbackURL:  'http://YOURSUPERDOMAINSHERE/auth/vkontakte/callback',
  },

};
