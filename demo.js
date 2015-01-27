var gum = require('getusermedia');
var ams = require('attachmediastream');
var addClass = require('amp-add-class');
var removeClass = require('amp-remove-class');
var domready = require('domready');
var raf = require('raf');
var debounce = require('amp-debounce');
var floodVideo = require('./flood-video');

domready(function () {
    gum({ video: true, audio: false }, function (err, stream) {
        var wrapper1 = document.querySelector('.wrapper-1');
        var video1 = wrapper1.querySelector('video');

        var wrapper2 = document.querySelector('.wrapper-2');
        var video2 = wrapper2.querySelector('video');

        ams(stream, video1);
        ams(stream, video2);

        window.floodController = floodVideo(wrapper1, video1, {
            minVisibleHeight: 0.5,
            minVisibleWidth: 0.5
        });

        window.floodController2 = floodVideo(wrapper2, video2, {
            minVisibleHeight: 0.5,
            minVisibleWidth: 0.5
        });

        document.querySelector('[name=minVisibleHeight]').addEventListener('input', function(e) {
            floodController.configure({
                minVisibleHeight: e.target.valueAsNumber
            });
            floodController2.configure({
                minVisibleHeight: e.target.valueAsNumber
            });
        }, false);

        document.querySelector('[name=minVisibleWidth]').addEventListener('input', function(e) {
            floodController.configure({
                minVisibleWidth: e.target.valueAsNumber
            });
            floodController2.configure({
                minVisibleWidth: e.target.valueAsNumber
            });
        }, false);
    });
});
