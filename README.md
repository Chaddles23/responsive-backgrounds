# responsive-backgrounds
Lazy-load responsive backgrounds
Define different screen sizes for background images to be swapped out

Define your screen sizes with:
```html
<div selector data-screen-0="images/small.jpg" data-screen-500="images/medium.jpg" data-screen-800="images/large.jpg"></div>
```
* For window width 0px and up, images/small.jpg will be used.
* For window width 500px and up, images/medium.jpg will be used.
* For window width 800px and up, images/large.jpg will be used.

Initialize the javascript with:
```javascript
new SodaBG(selector,options);
```
Options defaults are:
```javascript
options = {
  lazy: true, // lazy-load image(s) on page load, and before transitioning between different sizes
  transition: 0.5 // how long a background transition is (in seconds)
}
```

