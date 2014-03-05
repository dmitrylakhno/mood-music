$(document).ready(function() {

    var tracks = [];
    var _tracks = [];
    var playlist = [];

    var _csrf = $('#form').serializeArray()[1].value;

    var it = 0;
    var itf = 0;
    var a = audiojs.createAll({
        trackEnded: function() {
            if (itf < tracks.length) {
                getFiles([tracks[itf]], true, true, _csrf)
                itf = itf + 1;
            }
            it = it + 1;
            if (it > playlist.length) {
                it = 0;
            }
            audio.load(playlist[it]);
            audio.play();
        }
    });
    var audio = a[0];

    $('#audiojs_wrapper0').hide();

    var getTracks = function(mood, count, async, global) {
        var result = false;
        if (!mood || !count || !_csrf) { return result; }
        $.ajax({
            url: '/api/tracks',
            type: "POST",
            data: {mood: mood, count: count, _csrf: _csrf},
            dataType : "json",
            async: async,
            success: function(track) {
                if (track && track.length >= 1) {
                    result = track;
                    if (global) {
                        _tracks = track;
                    }
                }
            }
        });
        return result;
    };

    var getFiles = function(tracknames, async, global) {
        var result = false;
        if (!tracknames || !_csrf) { return result; }
        $.ajax({
            url: '/api/files',
            type: "POST",
            data: {tracks: tracknames, _csrf: _csrf},
            dataType : "json",
            async: false,
            success: function(files) {
                if (files && files.length >= 1) {
                    result = files;
                    if (global) {
                        playlist = _.union(playlist, files);                     
                    }
                }
            },
            error: function() {
                if (global) {
                    itf = itf + 1;
                    getFiles([tracks[itf]], true, true, _csrf);
                }
            }
        });
        return result;
    }

    var getMood = function() {
        $('#getmood').html('<i class="fa fa-refresh"></i>');
        var formData = $('#form').serializeArray();
        tracks = getTracks(formData[0].value, 2, false, false);
        playlist = getFiles(tracks, false, false);
        if (playlist) {
            $('#getmood').html('<i class="fa fa-music"></i>');
            audio.load(playlist[0]);
            audio.play();
            getTracks(formData[0].value, 50, true, true);
        }
    }


    $('#audiojs_wrapper0').hide();

    $("#getmood").click(function () {
        getMood();
    });

    $(window).keydown(function(event){
        if (event.keyCode == 13) {
            return false;
        }
    });

    $(document).bind('ajaxSuccess', function() {
        tracks = _.difference(_tracks, tracks);
    });

});
