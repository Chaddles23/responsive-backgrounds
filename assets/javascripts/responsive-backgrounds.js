function ResponsiveBackground(selector, options={}) {
    this.target = document.querySelector(selector);
    this.active_image = false;
    this.options = Object.assign({
        lazy: true,
        transition: 0.5
    }, options);
    console.log(this.options);
    this.images = [];
    this.initialize();
}

ResponsiveBackground.prototype.initialize = function () {
    var instance = this;

    // set CSS
    this.target.style.transition = 'background ' + this.options.transition + 's';

    // get image options
    var image = null;
    [].forEach.call(instance.target.attributes, function (attr) {
        if (/^data-screen-/.test(attr.name)) {
            var size = attr.name.substr(12).replace(/-(.)/g, function ($0, $1) {
                return $1.toUpperCase();
            });

            image = {
                size: size,
                source: attr.value,
            };
            if (instance.options.lazy) {
                var img = new Image;
                img.onload = function () {
                    instance.image_loaded(this.src);
                };
                image = Object.assign(image, {
                    image: img
                })
            }

            instance.images.push(image);
        }
    });


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
};

// apply the image to the DOM
ResponsiveBackground.prototype.image_loaded = function (image) {
    this.target.style.backgroundImage = 'url("' + image + '")';
}

// choose the appropriate image for the screen size
ResponsiveBackground.prototype.choose_image = function () {
    var i = this.images.length - 1,
        width = screen.width;
    this.active_image = false;

    // find the closest matching image based on the window size
    while (!this.active_image && i >= 0) {
        if (width >= this.images[i].size) {
            this.active_image = this.images[i];
        }
        i--;
    }

    // default to last/biggest
    if (!this.active_image) {
        this.active_image = this.images[this.images.length - 1];
    }

    // set the source, initiating image_loaded
    if (this.options.lazy) {
        this.active_image.image.src = this.active_image.source.toString();
    }
    // set directly, without waiting for onload
    else {
        this.image_loaded(this.active_image.source.toString());
    }
};
