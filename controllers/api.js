var secrets = require('../config/secrets');
var User = require('../models/User');
var async = require('async');
var request = require('request');
var _ = require('underscore');
var LastFmNode = require('lastfm').LastFmNode;
var vkontakte = require('vkontakte');

exports.getLastfm = function(req, res, next) {

  var result = [];
  
  mood = req.body.mood ? req.body.mood : 'happy';
  limit = req.body.count ? req.body.count : '2';

  var lastfm = new LastFmNode(secrets.lastfm);
  lastfm.request('tag.getTopTracks', {
    tag: mood,
    limit: limit,
    page: '1',
    handlers: {
      success: function(data) {
        data = _.shuffle(data.toptracks.track);
        _.each(data, function(track) {
          track = track.artist.name + ' - ' + track.name;
          result.push(track);
        });
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(result, null, 3));
      },
      error: function(err) {
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({}, null, 3));
      }
    }
  });

};

exports.getVkontakte = function(req, res, next) {
  var token = _.findWhere(req.user.tokens, { kind: 'vkontakte' });
  var vk = vkontakte(token.accessToken);
  var tracks = req.body.tracks ? req.body.tracks : [];
  async.mapLimit(tracks, 2, 
    function(track, callback) {
      vk('audio.search', { q: track, sort: 2, count: 1 }, function (err, audio) {
        if (!err && audio && audio[1]) {
          callback(null, audio[1].url);
        } else {
          callback(null, false);
        }
      });
    },
    function(err, results) {
      var send = _.filter(results, function(r) {return r ? true : false});
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify(send, null, 3));
    }
  );
};
