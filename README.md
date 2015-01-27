# flood-video

Flood fill/fit video elements to their container.

## Installation

`npm install flood-video --save`

## Usage

See a [demo here](http://latentflip.com/flood-video)

### floodVideo(wrapperElement, videoElement, [options])

* options:
* minVisibleHeight: a number (from 0 to 1) how much of the vertical height of the video to ensure is always visible
* minVisibleWidth: a number (from 0 to 1) how much of the horizontal width of the video to ensure is always visible

```js
var floodVideo = require('flood-video');

var floodController = floodVideo(wrapperEl, videoEl, options);

floodController.forceFlood() //refit the video, if you've changed style/dimension of the wrapper/video (need not be called if element resizes due to window resize)

floodController.stop() // stop listening to window resize events, clear up handlers, remove classes

floodController.configure({
    minVisibleHeight: 0.5,
    minVisibleWidth: 0.5
}); //reconfigure the options (all options are optional, and the same as the floodVideo() call
```
