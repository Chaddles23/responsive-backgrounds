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
            this.active_image = [];
            this.targets = targets;
            for (var i = 0; i < this.targets.length; i++) {
                this.images.push([]);
                this.active_image.push(false);
            }
            this.options = Object.assign({
                lazy: true,
                transition: 0.5
            }, options);
            this.initialize();
        }

        ResponsiveBackground.prototype.initialize = function () {
            var instance = this;

            for (var i = 0; i < this.targets.length; i++) {
                // set CSS
                this.targets[i].style.transition = 'background ' + this.options.transition + 's';

                // get image options
                var image = null;
                [].forEach.call(instance.targets[i].attributes, function (attr) {
                    if (/^data-screen-/.test(attr.name)) {
                        var size = attr.name.substr(12).replace(/-(.)/g, function ($0, $1) {
                            return $1.toUpperCase();
                        });

                        image = {
                            size: size,
                            source: attr.value,
                        };
                        if (instance.options.lazy) {
                            (function (x) {
                                var img = new Image;
                                img.onload = function () {
                                    instance.image_loaded(img.src, x);
                                };
                                image = Object.assign(image, {
                                    image: img
                                });
                            })(i);
                        }

                        instance.images[i].push(image);
                    }
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
            console.log(i, this.targets[i]);
            this.targets[i].style.backgroundImage = 'url("' + image + '")';
        }

        // choose the appropriate image for the screen size
        ResponsiveBackground.prototype.choose_image = function () {
            var width = screen.width;

            for (var i = 0; i < this.targets.length; i++) {

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
