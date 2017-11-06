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
            this.active_image = [];
            this.targets = targets;
            this.options = extend({
                lazy: true,
                transition: 0.5,
                placeholder: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAEDWlDQ1BJQ0MgUHJvZmlsZQAAOI2NVV1oHFUUPrtzZyMkzlNsNIV0qD8NJQ2TVjShtLp/3d02bpZJNtoi6GT27s6Yyc44M7v9oU9FUHwx6psUxL+3gCAo9Q/bPrQvlQol2tQgKD60+INQ6Ium65k7M5lpurHeZe58853vnnvuuWfvBei5qliWkRQBFpquLRcy4nOHj4g9K5CEh6AXBqFXUR0rXalMAjZPC3e1W99Dwntf2dXd/p+tt0YdFSBxH2Kz5qgLiI8B8KdVy3YBevqRHz/qWh72Yui3MUDEL3q44WPXw3M+fo1pZuQs4tOIBVVTaoiXEI/MxfhGDPsxsNZfoE1q66ro5aJim3XdoLFw72H+n23BaIXzbcOnz5mfPoTvYVz7KzUl5+FRxEuqkp9G/Ajia219thzg25abkRE/BpDc3pqvphHvRFys2weqvp+krbWKIX7nhDbzLOItiM8358pTwdirqpPFnMF2xLc1WvLyOwTAibpbmvHHcvttU57y5+XqNZrLe3lE/Pq8eUj2fXKfOe3pfOjzhJYtB/yll5SDFcSDiH+hRkH25+L+sdxKEAMZahrlSX8ukqMOWy/jXW2m6M9LDBc31B9LFuv6gVKg/0Szi3KAr1kGq1GMjU/aLbnq6/lRxc4XfJ98hTargX++DbMJBSiYMIe9Ck1YAxFkKEAG3xbYaKmDDgYyFK0UGYpfoWYXG+fAPPI6tJnNwb7ClP7IyF+D+bjOtCpkhz6CFrIa/I6sFtNl8auFXGMTP34sNwI/JhkgEtmDz14ySfaRcTIBInmKPE32kxyyE2Tv+thKbEVePDfW/byMM1Kmm0XdObS7oGD/MypMXFPXrCwOtoYjyyn7BV29/MZfsVzpLDdRtuIZnbpXzvlf+ev8MvYr/Gqk4H/kV/G3csdazLuyTMPsbFhzd1UabQbjFvDRmcWJxR3zcfHkVw9GfpbJmeev9F08WW8uDkaslwX6avlWGU6NRKz0g/SHtCy9J30o/ca9zX3Kfc19zn3BXQKRO8ud477hLnAfc1/G9mrzGlrfexZ5GLdn6ZZrrEohI2wVHhZywjbhUWEy8icMCGNCUdiBlq3r+xafL549HQ5jH+an+1y+LlYBifuxAvRN/lVVVOlwlCkdVm9NOL5BE4wkQ2SMlDZU97hX86EilU/lUmkQUztTE6mx1EEPh7OmdqBtAvv8HdWpbrJS6tJj3n0CWdM6busNzRV3S9KTYhqvNiqWmuroiKgYhshMjmhTh9ptWhsF7970j/SbMrsPE1suR5z7DMC+P/Hs+y7ijrQAlhyAgccjbhjPygfeBTjzhNqy28EdkUh8C+DU9+z2v/oyeH791OncxHOs5y2AtTc7nb/f73TWPkD/qwBnjX8BoJ98VVBg/m8AAAFZaVRYdFhNTDpjb20uYWRvYmUueG1wAAAAAAA8eDp4bXBtZXRhIHhtbG5zOng9ImFkb2JlOm5zOm1ldGEvIiB4OnhtcHRrPSJYTVAgQ29yZSA1LjQuMCI+CiAgIDxyZGY6UkRGIHhtbG5zOnJkZj0iaHR0cDovL3d3dy53My5vcmcvMTk5OS8wMi8yMi1yZGYtc3ludGF4LW5zIyI+CiAgICAgIDxyZGY6RGVzY3JpcHRpb24gcmRmOmFib3V0PSIiCiAgICAgICAgICAgIHhtbG5zOnRpZmY9Imh0dHA6Ly9ucy5hZG9iZS5jb20vdGlmZi8xLjAvIj4KICAgICAgICAgPHRpZmY6T3JpZW50YXRpb24+MTwvdGlmZjpPcmllbnRhdGlvbj4KICAgICAgPC9yZGY6RGVzY3JpcHRpb24+CiAgIDwvcmRmOlJERj4KPC94OnhtcG1ldGE+CkzCJ1kAAAANSURBVAgdY2BgYPgPAAEEAQAec5xAAAAAAElFTkSuQmCC"
            }, options);
            this.initialize();
        }

        ResponsiveBackground.prototype.initialize = function () {
            var instance = this;

            for (var i = 0; i < this.targets.length; i++) {
                this.images.push([]);
                this.active_image.push(false);

                // set CSS
                this.targets[i].style.transition = 'background ' + this.options.transition + 's';
                this.targets[i].style.backgroundImage = 'url("' + this.options.placeholder + '")';

                // get image options
                var image = null;
                [].forEach.call(instance.targets[i].attributes, function (attr) {
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

            // broadcast success
            this.broadcast_success();
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
