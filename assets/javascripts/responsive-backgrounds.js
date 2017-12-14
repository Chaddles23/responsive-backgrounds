(function (window, factory) {
    'use strict';
    // universal module definition

    /*global define: false, module: false, require: false */

    if (typeof define == 'function' && define.amd) {
        // AMD
        define([], function () {
            return factory(window);
        });
    } else if (typeof module == 'object' && module.exports) {
        // CommonJS
        module.exports = factory(
            window
        );
    } else {
        // browser global
        window.ResponsiveBackground = factory(
            window
        );
    }

})(typeof window !== 'undefined' ? window : this,

// -------------------------- factory -------------------------- //
    function factory(window) {

        'use strict';

        var $ = window.jQuery;
        var console = window.console;

// -------------------------- helpers -------------------------- //
        function extend(a, b) {
            for (var prop in b) {
                a[prop] = b[prop];
            }
            return a;
        }

// -------------------------- ResponsiveBackground -------------------------- //
        function ResponsiveBackground(targets, options) {
            if ($) {
                // add jQuery Deferred object
                this.jqDeferred = new $.Deferred();
            }

            // jquery passes an element, JS passes a selector
            if (typeof targets == "string") {
                targets = document.querySelectorAll(targets);
            }

            this.images = []; // 2d array per targets
            this.placeholder_images = []; // 2d array per targets
            this.active_image = [];
            this.targets = targets;
            this.options = extend({
                lazy: true,
                transition: 0.5,
                placeholder: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAMAAAAoyzS7AAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAAADUExURUdwTIL60tIAAAABdFJOUwBA5thmAAAACklEQVQI12NgAAAAAgAB4iG8MwAAAABJRU5ErkJggg==", // transparent
                loading_class: 'responsive-background__loading',
                loaded_class: 'responsive-background__loaded',
            }, options);
            this.initialize();
        }

        ResponsiveBackground.prototype.initialize = function () {
            var instance = this;

            for (var i = 0; i < this.targets.length; i++) {
                this.images.push([]);
                this.placeholder_images.push([]);
                this.active_image.push(false);

                // set CSS
                this.targets[i].style.transition = 'background ' + this.options.transition + 's';
                this.targets[i].style.backgroundImage = 'url("' + this.options.placeholder + '")';
                this.targets[i].className += (" " + this.options.loading_class);

                // get image options
                var image = null;
                [].forEach.call(instance.targets[i].attributes, function (attr) {

                    // apply placeholder images if present
                    if (/^data-placeholder/.test(attr.name)) {
                        instance.targets[i].style.backgroundImage = 'url("' + attr.value + '")';
                    }

                    // images
                    if (/^data-screen-/.test(attr.name)) {
                        var size = attr.name.substr(12).replace(/-(.)/g, function ($0, $1) {
                            return $1.toUpperCase();
                        });

                        image = {
                            size: parseInt(size),
                            source: attr.value,
                        };
                        if (instance.options.lazy) {
                            (function (x) {
                                var img = new Image;
                                img.onload = function () {
                                    instance.image_loaded(img.src, x);
                                };

                                // add in new image
                                image.image = img;
                            })(i);
                        }

                        instance.images[i].push(image);
                    }
                });

                // sort images by size (small to large)
                this.images[i].sort(function (a, b) {
                    return a.size - b.size;
                });
            }

            this.choose_image(); // fire initially
            var resizeTimer;
            $(window).on('resize', function (e) {
                if (resizeTimer) {
                    clearTimeout(resizeTimer);
                }
                resizeTimer = setTimeout(function () {
                    // efficient resize listening
                    // only perform 200ms after finished resizing
                    instance.choose_image();
                }, 200);
            });
        }

        // apply the image to the DOM
        ResponsiveBackground.prototype.image_loaded = function (image, i) {
            this.targets[i].style.backgroundImage = 'url("' + image + '")';

            // add loaded class
            this.targets[i].className += (" " + this.options.loaded_class);

            // broadcast success
            this.broadcast_success();

            // remove loading class
            var reg = new RegExp('(\\s|^)' + this.options.loading_class + '(\\s|$)');
            this.targets[i].className = this.targets[i].className.replace(reg, ' ');
        }

        // choose the appropriate image for the screen size
        ResponsiveBackground.prototype.choose_image = function () {
            var width = screen.width;

            for (var i = 0; i < this.targets.length; i++) {
                this.active_image[i] = false; // reset

                // find the closest matching image based on the window size
                var j = this.images[i].length - 1;
                while (!this.active_image[i] && j >= 0) {
                    if (width >= this.images[i][j].size) {
                        this.active_image[i] = this.images[i][j];
                    }
                    j--;
                }

                // default to last/biggest
                if (!this.active_image[i] && this.images[i].length > 0) {
                    this.active_image[i] = this.images[i][this.images[i].length - 1];
                }

                if (this.active_image[i]) {
                    // set the source, initiating image_loaded
                    if (this.options.lazy) {
                        this.active_image[i].image.src = this.active_image[i].source.toString();
                    }
                    // set directly, without waiting for onload
                    else {
                        this.image_loaded(this.active_image[i].source.toString(), i);
                    }
                }
            }
        }

        ResponsiveBackground.prototype.broadcast_success = function () {
            var imageAppliedEvent = new Event('ResponsiveBackground: Image Applied');
            document.dispatchEvent(imageAppliedEvent);
        }

        ResponsiveBackground.images_loaded = function (callback) {
            if (document.addEventListener) {
                document.addEventListener('ResponsiveBackground: Image Applied', callback, false);
            } else {
                document.attachEvent('ResponsiveBackground: Image Applied', callback);
            }
        }

        ResponsiveBackground.prototype.images_loaded = function (callback) {
            ResponsiveBackground.images_loaded(callback);
        }


// -------------------------- jQuery -------------------------- //

        ResponsiveBackground.makeJQueryPlugin = function (jQuery) {
            jQuery = jQuery || window.jQuery;
            if (!jQuery) {
                return;
            }
            // set local variable
            $ = jQuery;
            // $().responsiveBackground()
            $.fn.responsiveBackground = function (options) {
                var instance = new ResponsiveBackground($(this).get(), options);
                return instance.jqDeferred.promise($(this));
            };
        };
// try making plugin
        ResponsiveBackground.makeJQueryPlugin();

// --------------------------  -------------------------- //
        return ResponsiveBackground;
    });
