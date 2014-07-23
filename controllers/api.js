var secrets = require('../config/secrets'),
    User = require('../models/User'),
    async = require('async'),
    request = require('request'),
    _ = require('underscore'),
    LastFmNode = require('lastfm').LastFmNode,
    vkontakte = require('vkontakte');

exports.getLastfm = function (req, res, next) {

    var result = [],
        mood = req.body.mood || 'happy',
        limit = req.body.count || '2',
        lastfm = new LastFmNode(secrets.lastfm);

    lastfm.request('tag.getTopTracks', {
        tag: mood,
        limit: limit,
        page: '1',
        handlers: {
            success: function (data) {
                data = _.shuffle(data.toptracks.track);
                _.each(data, function (track) {
                    track = track.artist.name + ' - ' + track.name;
                    result.push(track);
                });
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify(result, null, 3));
            },
            error: function (err) {
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({}, null, 3));
            }
        }
    });

};

exports.getVkontakte = function (req, res, next) {

    var token = _.findWhere(req.user.tokens, { kind: 'vkontakte' }),
        vk = vkontakte(token.accessToken),
        tracks = req.body.tracks || [];

    async.mapLimit(tracks, 2,
        function (track, callback) {
            vk('audio.search', { q: track, sort: 2, count: 1 }, function (err, audio) {
                if (!err && audio && audio[1]) {
                    callback(null, audio[1].url);
                } else {
                    callback(null, false);
                }
            });
        },
        function (err, results) {
            var send = _.filter(results, function (r) { return r ? true : false; });
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(send, null, 3));
        }
    );
};
