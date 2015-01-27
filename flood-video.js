/* jshint eqnull:true */

require('./flood-video.css');
var raf = require('raf');
var addClass = require('amp-add-class');
var removeClass = require('amp-remove-class');
var debounce = require('amp-debounce');

/*
var controller = floodVideo(wrapper, video, {...});
controller.forceFlood();
controller.configure({ ... });
controller.stop();
*/

/* options:
 *   - minVisibleHeight: 0...1
 *   - minVisibleWidth: 0...1
 */

function aspectRatio(dims) {
    return dims.width / dims.height;
}

module.exports = function floodVideo(wrapper, video, options) {
    options = options || {};
    var maxWidth = 100;
    var maxHeight = 100;

    var configure = function (options) {
        options = options || {};
        if (options.minVisibleHeight != null) {
            if (options.minVisibleHeight === 0) {
                maxHeight = 'none';
            } else {
                maxHeight = 100/(options.minVisibleHeight);
            }
        }
        if (options.minVisibleWidth != null) {
            if (options.minVisibleWidth === 0) {
                maxWidth = 'none';
            } else {
                maxWidth = 100/(options.minVisibleWidth);
            }
        }
        flood();
    };
    
    var wrapperInitialStyle = {};
    var initialSetup = function () {
        raf(function () {
            wrapperInitialStyle.overflow = wrapper.style.overflow;
            wrapperInitialStyle.position = wrapper.style.position;

            var wrapperStyle = window.getComputedStyle(wrapper);
            if (wrapperStyle.position === 'static') {
                wrapper.style.position = 'relative';
            }
            wrapper.style.overflow = 'hidden';

            addClass(video, ['flood-video']);
        });

        video.addEventListener('loadedmetadata', flood, false);
        window.addEventListener('resize', floodDebounced, false);
    };

    var flood = function () {
        raf(function () {
            var wrapperSize = wrapper.getBoundingClientRect();
            var videoSize = {
                height: video.videoHeight || 1,
                width: video.videoWidth || 1
            };

            if (aspectRatio(videoSize) > aspectRatio(wrapperSize)) {
                video.style.maxWidth = maxWidth + '%';
                video.style.maxHeight = 'none';
                removeClass(video, ['flood-video--fit-width']);
                addClass(video, ['flood-video--fit-height']);
            } else {
                video.style.maxWidth = 'none';
                video.style.maxHeight = maxHeight + '%';
                removeClass(video, ['flood-video--fit-height']);
                addClass(video, ['flood-video--fit-width']);
            }
        });
    };

    var floodDebounced = debounce(flood, 50);

    var stop = function () {
        video.removeEventListener('loadedmetadata', flood, false);
        window.removeEventListener('resize', floodDebounced, false);
        removeClass(video, ['flood-video', 'flood-video--fit-width', 'flood-video--fit-height']);
        wrapper.style.position = wrapperInitialStyle.position;
        wrapper.style.overflow = wrapperInitialStyle.overflow;
    };

    // Go!
    if (!wrapper || !video) {
        throw new TypeError("floodVideo: wrapper and video elements are required");
    }

    configure(options);
    initialSetup();
    flood();

    return {
        configure: configure,
        forceFlood: flood,
        stop: stop
    };
};
