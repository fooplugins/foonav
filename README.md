# FooNav.js - Simple Navigation Plugin #

----------

[![CDNJS](https://img.shields.io/cdnjs/v/foonav.svg)](https://cdnjs.com/libraries/foonav)

FooNav.js is a free plugin built on jQuery that let's you make a simple menu to help users navigate either your site or a single pages content. You can create your own custom menu links or let the plugin crawl your page for headers and build up a simple navigation menu itself. There are multiple themes to choose from to suite your site, or if you are so inclined you can create your own with a little custom CSS. There are also multiple demos to get you up and running in no time at all.

![FooNav](https://github.com/fooplugins/foonav/raw/master/screenshot.png "FooNav")

## Demos ##

### Playground ###

- [A Demo Page Showing Most of the Features](http://fooplugins.github.io/foonav/docs/playground.html)

### Item Creation ###

- [Auto-Generated Menu Items from Headers](http://fooplugins.github.io/foonav/docs/item-creation/auto-generation.html)
- [Custom Menu Items](http://fooplugins.github.io/foonav/docs/item-creation/custom.html)

### Positioning ###

The menu can be positioned at six different points around the window viewport, these are listed below and you can see them in action in [this demo page](http://fooplugins.github.io/foonav/docs/playground.html) by selecting them from the drop down.

- Top Left
- Top Right
- Left Center
- Right Center
- Bottom Left
- Bottom Right

### Themes ###

There are multiple themes available by default, the below lists them all individually however you can check them all out using [this demo page](http://fooplugins.github.io/foonav/docs/playground.html) and simply selecting each from the drop down.

**Default**
- Blue
- Dark
- Green
- Light

**Flat UI**
- Amethyst
- Asbestos
- Asphalt
- Blue
- Emerald
- Orange
- Pumpkin
- Red
- Silver
- Turquoise

----------

### Other Features ###

There are a number of different ways to change to behaviour of the menu, from only showing it once a user has scrolled past a certain pixel value to adjusting whether or not to smooth scroll to anchors.

- Insert Custom Content Before or After the Menu
- Show After X Pixels Scrolled
- Change the Show/Hide Speed
- Enable/Disable Auto Tracking of Anchors in the Menu
- Enable/Disable the Smooth Scroll to Anchors
- Enable/Disable Auto Parsing of the current URL for Hash Values (Anchors)
- Enable/Disable Auto Showing of the Menu on Page Load
- Switch Between a Simple Slide or Fade Animation in the Menu
- Simple API for Developers to Use
- Add Custom Buttons

----------

## Getting Started Bower ##

Install using [Bower](http://bower.io): `bower install foonav`

## Getting Started Simple ##

### Step 1: Include the required files ###

Include the foonav.min.css file.

```html
<link href="http://example.com/css/foonav.min.css" rel="stylesheet" />
```

After jQuery, add the foonav.min.js file.

```html
<script src="http://example.com/js/foonav.min.js"></script>
```

### Step 2: Initialize and Configure

In either a JavaScript file or inline, initalize FooNav. This has to be below the foonav.js file. Some of the following settings below are defaults, and are only added for demonstration purposes.

```javascript
FooNav.init({
	classes: 'fon-full-height fon-border fon-rounded fon-shadow',
	items: '#content',
	position: 'fon-top-right',
	theme: 'fon-light'
});
```
----------

## Getting Started Dev ##

### Step 1: Include the required files ###

Include the foonav.min.css file.

```html
<link href="http://example.com/css/foonav.min.css" rel="stylesheet" />
```

After jQuery, add the foonav.min.js file.

```html
<script src="http://example.com/js/foonav.min.js"></script>
```

### Step 2: Initialize and Configure

In either a JavaScript file or inline, initialize FooNav. This has to be below the foonav.js file. Some of the following settings below are defaults, and are only added for demonstration purposes.

```javascript
FooNav.init({
	classes: 'fon-full-height fon-border fon-rounded fon-shadow',
	items: '#content',
	position: 'fon-top-right',
	theme: 'fon-light'
});
```

### Step 3: Use the FooNav Instance

FooNav has it's own ready event to use to avoid asynchronous loading issues. You can see it below allowing you to use the FooNav API to control the plugin, binding it to whatever events you want.

```javascript
FooNav.init({...configuration...}).ready(function(fnav){
	fnav.toggle(); // Toggles FooNav between open and closed states
	fnav.destroy(); // Completely destroys FooNav removing it from the DOM
	fnav.reinit({
		classes: 'fon-shadow',
		items: '#content',
		position: 'fon-top-left',
		theme: 'fon-dark'
	}); // Reinitializes FooNav with the new options
});
```
