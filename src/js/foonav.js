/*jslint devel: true, browser: true, unparam: true, debug: false, es5: true, white: false, maxerr: 1000 */
/**!
 * FooNav - A jQuery navigation menu.
 * @version 0.0.5
 * @link http://fooplugins.github.io/foonav/
 * @copyright Steven Usher & Brad Vincent 2014
 * @license Released under the MIT license.
 */
(function($, window){

	window.FooNav = {
		defaults: {
			/** @type {(string|HTMLElement|Array|jQuery)} - A DOM element, array of elements, HTML string, or jQuery object to insert after the generated menu. */
			after: null,
			/** @type {(string|HTMLElement|Array|jQuery)} - A DOM element, array of elements, HTML string, or jQuery object to insert before the generated menu. */
			before: null,
			/**
			 * A PlainObject containing any additional buttons to create, these can be either just the href or
			 * an object of attributes, events, and methods to call on the newly-created button.
			 * The name used must match an icon defined in the icons object.
			 * @example <caption>A string</caption>
			 * buttons: {
			 * 	[name]: [string]
			 * }
			 * @example <caption>An object of attributes, events, and methods.</caption>
			 * buttons: {
			 * 	[name]: [object]
			 * }
			 * @see {@link http://api.jquery.com/jQuery/#jQuery-html-attributes|jQueryAPI} for more information on the html attributes object.
			 */
			buttons: null,
			/** @type {string} - A string of space separated class names to add to the navigation element. */
			classes: null,
			/** @type {boolean} - Whether or not to enable deeplinking. If set to true and the selected menu item corresponds to an anchor in the page the hash will be updated. */
			deeplinking: false,
			/** @namespace - Contains all the icon class information. */
			icons: {
				back: { family: 'fon-icon', icon: 'fon-icon-back' },
				expand: { family: 'fon-icon', icon: 'fon-icon-expand' },
				home: { family: 'fon-icon', icon: 'fon-icon-home' },
				menu: { family: 'fon-icon', icon: 'fon-icon-menu' },
				top: { family: 'fon-icon', icon: 'fon-icon-top' }
			},
			/**
			 * Items can be either a PlainObject defining the container, item and exclude selectors, just the container selector or an array of items.
			 * @example <caption>Example PlainObject</caption>
			 * items: {
			 * 	container: [string],
			 * 	exclude: [string],
			 * 	selector: [string]
			 * }
			 * @example <caption>Example string</caption>
			 * items: [string]
			 * @example <caption>Example item array</caption>
			 * items: [{
			 * 	href: [string],
			 * 	text: [string],
			 * 	children: [array]
			 * }]
			 */
			items: 'body',
			/** @type {string} - The class name of the position for the navigation element. */
			position: 'fon-top-right',
			/** @type {string} - The class name of the theme for the navigation element. */
			theme: 'fon-light',
			/** @type {string} - A string to display above the root menu items. This is replaced by the back button text on child menus. */
			title: null,
			/** @type {boolean} - Whether or not to display the 'To Top' button. */
			top: true,
			/** @type {string} - A string specifying the type of transition to use on the menu. Possible values are 'slide' and 'fade' */
			transition: 'slide',
			/** @type {number} - The distance the scroll bars must travel before displaying the navigation element. */
			scroll: 0,
			/** @type {number} - The speed the navigation element is shown/hidden and the speed the menus are transitioned between. */
			speed: 200,
			/** @namespace - Contains all the 'smart' options. */
			smart: {
				/** @type {boolean} - Whether or not to enable the smart options. This disables all smart options if set to false. */
				enable: true,
				/** @type {boolean} - Whether or not to track anchors in the page. If set to true the menu will automatically find the item corresponding to the current visible anchor. */
				anchors: true,
				/** @type {boolean} - Whether or not to close the menu when losing focus. If set to true when a user clicks anywhere on the page that is not within a navigation element, this instance will close. */
				close: true,
				/** @type {boolean} - Whether or not to auto open the navigation element on page load. If set to true and the page is scrolled past the scroll option value and a tracked anchor is visible the navigation element will be displayed. */
				open: false,
				/** @type {boolean} - Whether or not to remember menu position on toggle. If set to true the menu will remember it's current position while being toggled. If set to false when the menu is displayed or redisplayed it is reset to the root. */
				remember: true,
				/** @type {boolean} - Whether or not to enable smart scrolling. If set to true and a user clicks on an anchored item the page will smoothly scroll to the anchor from it's current position. */
				scroll: true,
				/** @type {boolean} - Whether or not to parse the current url for a hash value. If a hash is found and it matches an item the menu is set to display that item. */
				url: true
			}
		},
		/**
		 * Contains all instantiated instances of FooNav.
		 */
		instances: []
	};

	/** @property {boolean} - Extend the jQuery event with an allow property. */
	jQuery.Event.prototype.allow = false;

	/**
	 * Retrieves an instance of FooNav by index. Indexes are assigned from zero in the order they were created.
	 * @param {number} index - The index of the instance to retrieve.
	 * @returns {FooNav.Instance}
	 */
	FooNav.fetch = function(index){
		index = index > FooNav.instances.length - 1 ? FooNav.instances.length - 1 : index < 0 ? 0 : index;
		return FooNav.instances[index];
	};

	/**
	 * Initializes a new instance of FooNav with the given options.
	 * @param {object} options - The options to initialize FooNav with.
	 * @returns {FooNav.Instance}
	 */
	FooNav.init = function(options){
		return new FooNav.Instance(options);
	};

	/**
	 * Reinitializes the instance of FooNav specified by the index with the given options.
	 * @param {number} index - The index of the instance to reinitialize.
	 * @param {object} options - The options to reinitialize FooNav with.
	 */
	FooNav.reinit = function(index, options){
		FooNav.fetch(index).reinit(options);
	};

	/**
	 * Destroys the instance of FooNav at the supplied index.
	 * @param {number} index - The index of the instance to destroy.
	 */
	FooNav.destroy = function(index){
		FooNav.fetch(index).destroy();
	};

	/**
	 * Destroys all instances of FooNav on the page.
	 */
	FooNav.destroyAll = function(){
		for(var i = 0; i < FooNav.instances.length; i++){
			var instance = FooNav.instances[i];
			if (instance != null) instance.destroy();
		}
	};

	/**
	 * Generates FooNav items from the elements matching the selector within the container.
	 * @param {string} [container] - The jQuery selector for the container of the items.
	 * @param {string} [selector] - The jQuery selector for the items.
	 * @param {string} [excludes] - The jQuery selector that specifies the elements to exclude.
	 * @returns {Array}
	 */
	FooNav.items = function(container, selector, excludes){
		container = container || 'body';
		selector = selector || 'h1,h2,h3,h4,h5,h6';
		excludes = excludes || '';
		var items = [];
		var structure = selector.split(',');
		var item = null, el = null, pel = null, parentSelector = null, $el = null;

		//find the index of the el in the provided structure.
		function _indexOf(el){
			for(var i = 0; i < structure.length; i++){ if ($(el).is(structure[i])){ return i; } }
			return -1;
		}

		//creates a parent selector using the supplied index.
		function _parentSelector(index){
			var tmp = [];
			for(var i = 0; i < index; i++){ tmp.push(structure[i]); }
			return tmp.join(',');
		}

		//find an item by it's id in the supplied items arr.
		function _find(id, arr){
			for(var i = 0; i < arr.length; i++){
				if (arr[i].href == '#' + id){ return arr[i]; }
				if (arr[i].children){
					var result = _find(id, arr[i].children);
					if (result != null){ return result; }
				}
			}
			return null;
		}

		//determine whether or not to exclude an element.
		function _exclude(i, el){
			if (excludes == null || excludes == '') return true;
			return $(el).closest(excludes).length == 0;
		}

		//generates a unique ID
		function _generateID(){
			return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
		}

		$(container).find(selector).filter(_exclude).each(function(){
			el = this; $el = $(el);
			if (el.id == '' || el.id == null) el.id = _generateID();
			item = { text: $el.text(), href: '#' + el.id };
			parentSelector = _parentSelector(_indexOf(el));
			if (parentSelector != null && parentSelector != ''){
				pel = $el.prevAll(parentSelector).first();
				if (pel.length > 0){
					var parent = _find(pel.attr('id'), items);
					if (parent != null){
						parent.children = parent.children || [];
						parent.children.push(item);
					} else {
						items.push(item);
					}
				} else {
					items.push(item);
				}
			} else {
				items.push(item);
			}
		});

		return items;
	};

	/**
	 * A simple timer object built around timeouts.
	 * @returns {FooNav.Timer}
	 * @constructor
	 */
	FooNav.Timer = function(){
		/** @property {number} - The id of the timeout being used. */
		this.id = null;
		/** @field {FooNav.Timer} - Reference to this instance to avoid scoping issues. */
		var _t = this;
		/**
		 * Starts the timer which will execute the supplied function after the specified delay. If start is called multiple
		 * times for this timer any previous invocations will be stopped ensuring only a single execution of the function.
		 * @param {function} func - The function to execute after the specified delay.
		 * @param {number} delay - The delay in milliseconds to wait before executing the function.
		 */
		this.start = function(func, delay){
			_t.stop();
			_t.id = setTimeout(function(){
				_t.id = null;
				func();
			}, delay);
		};
		/**
		 * Stops the timer if it is running preventing the execution of the function it was started with.
		 */
		this.stop = function(){
			if (_t.id == null){ return; }
			clearTimeout(_t.id);
			_t.id = null;
		};
		return this;
	};

	/**
	 * Creates a new instance of the FooNav plugin using the supplied options. All instances of this object are stored in the global FooNav.instances array.
	 * @param {object} options - The options to initialize the plugin with.
	 * @returns {FooNav.Instance}
	 * @constructor
	 */
	FooNav.Instance = function(options){
		/** @property {number} - The id of this instance. */
		this.id = FooNav.instances.push(this);
		/** @property {number} - The index of this instance in the FooNav.instances array. */
		this.index = this.id - 1;
		/** @property {object} - The options this instance was instantiated with. */
		this.o = $.extend(true, {}, FooNav.defaults);
		/** @property {jQuery} - The jQuery object housing the entire FooNav plugin. */
		this.nav = null;
		/** @property {jQuery} - The jQuery object housing the menu structure. */
		this.inner = null;
		/** @property {jQuery} - The jQuery object housing the buttons. */
		this.buttons = null;
		/** @property {jQuery} - The back button jQuery object. */
		this.back = null;
		/** @property {jQuery} - The top button jQuery object. */
		this.top = null;
		/** @property {jQuery} - The menu/toggle button jQuery object. */
		this.toggle_button = null;
		/** @property {jQuery} - The menu jQuery object. */
		this.menu = null;
		/** @property {boolean} - A boolean value indicating if the FooNav instance is initialized. */
		this.initialized = false;

		/** @field {FooNav.Instance} - Hold a reference to this object to use within functions to avoid scoping issues. */
		var _ = this,
			__ = {},
			/** @field {function} - An empty function used for to perform no operation. */
			noop = function(){};

		/** @property {function} - Holds a reference to the callback function supplied as the first parameter to the ready method. */
		__.ready = null;

		/**
		 * The initialize function for the plugin.
		 * @param {object} o - The options to initialize the plugin with.
		 */
		this.init = function(o){
			_.o = $.extend(true, _.o, o);

			_.b.items();
			_.b.nav();
			_.b.buttons();
			_.b.menu();
			_.b.extra();

			if (_.o.smart.enable){
				if (_.o.smart.url){ _.m.set(location.href, _.o.smart.open); }
				if (_.o.smart.close){ $(window).on('click', _.w.clicked); }
				if (_.o.smart.anchors){ $(window).on('scroll', _.a.check); }
			}

			$(window)
				.on('scroll', _.w.scrolled)
				.on('resize', _.w.resized);

			//if the scroll position is set to zero show the nav
			if (_.o.scroll == 0) _.nav.show();

			// depending on page content load the initial size of the menu can be mis-calculated. This small delay is here to allow additional content to load/perform layout before calculating.
			setTimeout(function(){
				_.m.position(false);
				_.initialized = true;
				if ($.isFunction(__.ready)) __.ready.call(_, _);
			}, 500);

			return _;
		};

		/**
		 * Reinitializes the plugin with the supplied options.
		 * @param {object} o - The options to reinitialize the plugin with.
		 */
		this.reinit = function(o){
			_.destroy(true);
			_.init(o);
		};

		/**
		 * Destroys the plugin removing all DOM elements and unbinding any events.
		 * @param {boolean} [partial] - Used internally when reinitializing the plugin.
		 */
		this.destroy = function(partial){
			_.initialized = false;
			partial = partial || false;
			$(window)
				.off('scroll', _.a.check)
				.off('scroll', _.w.scrolled)
				.off('click', _.w.clicked)
				.off('resize', _.w.resized);
			_.nav.remove();
			_.o = $.extend(true, {}, FooNav.defaults);
			_.nav = _.inner = _.back = _.top = _.toggle_button = _.menu = null;
			if (partial){ return; }
			FooNav.instances[_.index] = null;
		};

		/**
		 * A ready function which is executed once FooNav is fully initialized.
		 * @param {function} callback - The callback function to execute on initialization.
		 */
		this.ready = function(callback){
			if (!$.isFunction(callback)) return;
			if (_.initialized == true) callback.call(_, _);
			else __.ready = callback;
		};

		/**
		 * Toggles FooNav between an open and closed state.
		 */
		this.toggle = function(){
			_.m.toggle({allow:true});
		};

		/** @namespace - Contains all util type functions. */
		this.u = {
			/**
			 * @property {HTMLAnchorElement} - An internal anchor element used to fully qualify urls.
			 * @private
			 */
			_a: document.createElement('a'),
			/**
			 * Turns a partial url into a fully qualified one.
			 * @param {string} url - A partial url.
			 * @returns {string}
			 */
			qualify: function(url){
				_.u._a.href = url;
				return _.u._a.href;
			},
			/**
			 * Checks if the supplied url is the current page url.
			 * @param {string} url - The url to check.
			 * @returns {boolean}
			 */
			isCurrent: function(url){
				return _.u.qualify(url) == [location.protocol, '//', location.host, location.pathname].join('');
			},
			/**
			 * Concatenates the supplied string arguments into a single space delimited string.
			 * @param {string} arg1 - The first string.
			 * @param {string} arg2 - A second string to concatenate with the first.
			 * @param {string} [argN] - Additional strings to concatenate.
			 * @returns {string}
			 */
			concat: function(arg1, arg2, argN){
				return Array.prototype.slice.call(arguments).join(' ');
			},
			/**
			 * Returns an object containing the vertical and horizontal position of the menu.
			 * @returns {{v: string, h: string}}
			 */
			position: function(){
				var p = _.o.position.split('-');
				return { v: p[1], h: p[2] };
			},
			/**
			 * Checks if the supplied href exists in the page (i.e. starts with a # and it exists).
			 * @param {string} href - The href to check.
			 * @param {function} [yes] - The function to execute if the href exists.
			 * @param {function} [no] - The function to execute if the href does NOT exist.
			 * @returns {boolean}
			 */
			exists: function(href, yes, no){
				yes = yes || noop;
				no = no || noop;
				if (typeof href == 'string' && href.substring(0, 1) == '#'){
					var $el = $(href);
					if ($el.length > 0){
						yes($el);
						return true;
					} else {
						no();
						return false;
					}
				}
				no();
				return false;
			},
			/**
			 * Retrieves the viewport size
			 * @returns {{}}
			 */
			viewportSize: function () {
				var ratio = typeof window.devicePixelRatio !== 'undefined' ? window.devicePixelRatio : 1;
				return {
					width: (window.innerWidth || document.documentElement.clientWidth || (document.body ? document.body.offsetWidth : 0)) / ratio,
					height: (window.innerHeight || document.documentElement.clientHeight || (document.body ? document.body.offsetHeight : 0)) / ratio
				};
			},
			/**
			 * @property {(boolean|null)} - Variable to hold the supportsTransitions result so we don't have to run the code multiple times.
			 */
			_supportsTransitions: null,
			/**
			 * Checks if the current browser supports CSS3 transitions.
			 * @returns {boolean} - True if the browser supports CSS3 transitions.
			 */
			supportsTransitions: function() {
				if (_.u._supportsTransitions != null) { return _.u._supportsTransitions; }
				var b = document.body || document.documentElement;
				var s = b.style;
				var p = 'transition', v;
				if(typeof s[p] == 'string') { return true; }

				// Tests for vendor specific prop
				v = ['Moz', 'Webkit', 'Khtml', 'O', 'ms'];
				p = p.charAt(0).toUpperCase() + p.substr(1);
				for(var i=0; i<v.length; i++) {
					if(typeof s[v[i] + p] == 'string') { return _.u._supportsTransitions = true; }
				}
				return _.u._supportsTransitions = false;
			}
		};

		/** @namespace - Contains all the functions used to build the DOM elements. */
		this.b = {
			/**
			 * Checks the items option and builds the items if required.
			 */
			items: function(){
				if ($.isArray(_.o.items)){ return; }
				var type = typeof _.o.items;
				if (type == 'string'){ //if just a string is provided assume it's the container selector.
					_.o.items = FooNav.items(_.o.items);
				} else if (type == 'object'){ //if an object is provided use the selectors in it.
					_.o.items = FooNav.items(_.o.items.container, _.o.items.selector, _.o.items.exclude);
				}
			},
			/**
			 * Create the outer container for the plugin.
			 */
			nav: function() {
				_.nav = $('<div></div>', {
					'class': _.u.concat('fon-nav', _.o.position, _.o.theme, _.o.classes),
					css: { display: 'none' }
				})
					.on('click', '.fon-item-link', _.m.clicked)
					.on('click', '.fon-item-back', _.m.back)
					.appendTo('body');
			},
			/**
			 * Create the button container and the buttons within it.
			 */
			buttons: function(){
				_.buttons = $('<div></div>', { 'class': 'fon-buttons' }).appendTo(_.nav);

				function _icon(name){
					var i = _.o.icons[name];
					if (!i) return $();
					return $('<span></span>', { 'class': _.u.concat('fon-button-icon', i.family, i.icon) });
				}

				// the top and toggle buttons have extra functionality so hold a reference to them for later use
				_.top = $('<a></a>', { 'class': 'fon-button fon-button-top', href: '#top', on: { click: _.w.top }})
					.append(_icon('top'))
					.appendTo(_.buttons);

				_.toggle_button = $('<a></a>', { 'class': 'fon-button', href: '#toggle', on: { click: _.m.toggle }})
					.append(_icon('menu'))
					.appendTo(_.buttons);

				if (typeof _.o.buttons == 'object') {
					// if any additional buttons are defined iterate through them and create the elements.
					for (var name in _.o.buttons){
						// if this property is inherited or does NOT have a matching icon continue.
						if (!_.o.buttons.hasOwnProperty(name) || !_.o.icons.hasOwnProperty(name)) continue;

						var prop = _.o.buttons[name];
						if (typeof prop === 'string'){ // if all that was supplied was a string (the href) build a button
							// check for a home button, if the url of the home button and the current page are the same just don't create it.
							if (name == 'home' && _.u.isCurrent(prop)) continue;

							$('<a></a>', { 'class': 'fon-button', href: prop })
								.append(_icon(name))
								.appendTo(_.buttons);
						} else if (typeof prop === 'object'){ // if the object initializer was supplied use it but append any required classes
							// check for a home button, if the url of the home button and the current page are the same just don't create it.
							if (typeof prop.href != 'string' || (name == 'home' && _.u.isCurrent(prop.href))) continue;
							// fix up the class property adding in the required classes
							prop['class'] = typeof prop['class'] === 'string' ? _.u.concat('fon-button', prop['class']) : 'fon-button';

							$('<a></a>', prop)
								.append(_icon(name))
								.appendTo(_.buttons);
						}
					}
				}
				//adjust the minimum height to accommodate all the buttons
				var bh = _.toggle_button.outerHeight() * _.buttons.children().length;
				// adjust for button offset defined in '.fon-[top|bottom]-[left|right] > .fon-buttons' classes
				var t = parseInt(_.buttons.css('top'), 0),
					b = parseInt(_.buttons.css('bottom'), 0),
					o = isNaN(t) ? (isNaN(b) ? 0 : b) : t;
				_.nav.css('min-height', bh + o);
			},
			/**
			 * Create the inner container and the menu within it.
			 */
			menu: function(){
				_.inner = $('<div></div>', { 'class': 'fon-nav-inner' }).appendTo(_.nav);
				_.menu = $('<ul></ul>', { 'class': 'fon-menu' });

				function _icon(name){
					var i = _.o.icons[name];
					if (!i) return $();
					return $('<span></span>', { 'class': _.u.concat('fon-item-icon', i.family, i.icon) });
				}

				// iterates through all the items and their children building the _.menu ul
				function _build(menu, parent, items){
					var i, l = items.length, $menu, $li, $item, item;

					if (parent != null){
						$li = $('<li></li>').appendTo(menu);
						$item = $('<a></a>', { 'class': 'fon-item fon-item-back', href: parent.href, text: parent.text })
							.prepend(_icon('back'))
							.appendTo($li);
						if (_.u.exists(parent.href)) $item.addClass('fon-anchored');
					} else if (typeof _.o.title == 'string'){
						$li = $('<li></li>').appendTo(menu);
						$item = $('<span></span>', { 'class': 'fon-item fon-item-title fon-anchored', text: _.o.title })
							.appendTo($li);
					}
					for (i = 0; i < l; i++){
						item = items[i];
						$li = $('<li></li>').appendTo(menu);
						$item = $('<a></a>', { 'class': 'fon-item fon-item-link', href: item.href, text: item.text })
							.appendTo($li);
						if (_.u.exists(item.href)) $item.addClass('fon-anchored');
						if ($.isArray(item.children)){
							$item.addClass('fon-has-menu').prepend(_icon('expand'));
							$menu = $('<ul></ul>', { 'class': 'fon-menu' }).appendTo($li);
							_build($menu, item, item.children);
						}
					}
				}
				_build(_.menu, null, _.o.items);
				_.inner.append(_.menu.clone());
			},
			/**
			 * Create the additional extras defined by the options.
			 */
			extra: function(){
				if (_.o.before != null) _.nav.prepend($('<div></div>', { 'class': 'fon-before' }).append(_.o.before));
				if (_.o.after != null) _.nav.append($('<div></div>', { 'class': 'fon-after' }).append(_.o.after));
			}
		};

		/** @namespace - Contains all the functions used for the menu. */
		this.m = {
			/**
			 * Positions the menu on the page in either the open or closed state depending on the supplied visible parameter.
			 * @param {boolean} visible - Whether or not the menu is visible.
			 */
			position: function(visible){
				visible = visible || false;
				var pos = _.u.position();
				if (visible){
					_.nav.css(pos.h, 0);
					_.nav.removeClass('fon-closed fon-user-closed').addClass('fon-open');
				} else {
					_.nav.css(pos.h, -(_.nav.outerWidth(true)));
					_.nav.removeClass('fon-open').addClass('fon-closed');
				}
			},
			/**
			 * Checks if a url exists within the supplied parent menu and returns the anchor element associated with it.
			 * @param {string} url - The url to search for.
			 * @param {jQuery} parent -  The parent menu to search in.
			 * @param {boolean} back - Whether or not to search for back button links.
			 * @returns {jQuery}
			 */
			exists: function(url, parent, back){
				parent = parent || _.menu;
				back = back || false;
				if (url == null && back){
					return parent.find('li > .fon-item-title').first();
				} else {
					url = _.u.qualify(url);
					if (back){
						var result = parent.find('li > .fon-item-back').filter(function(){
							return url == _.u.qualify($(this).attr('href'));
						}).first();
						if (result.length > 0){ return result; }
					}
					return parent.find('li > .fon-item-link').filter(function(){
						return url == _.u.qualify($(this).attr('href'));
					}).first();
				}
			},
			/**
			 * Sets the active link within the supplied parent menu.
			 * @param {string} href - The href to set to active.
			 * @param {jQuery} menu - The parent menu to search in.
			 * @param {boolean} [back] - Whether or not to search for back button links.
			 */
			active: function(href, menu, back){
				back = back || false;
				menu.find('li > .fon-active').removeClass('fon-active');
				var $link = _.m.exists(href, menu, back);
				if ($link.length == 0) { return; }
				$link.addClass('fon-active');
			},
			/**
			 * Calculates the size of the supplied menu.
			 * @param {jQuery} menu - The menu to size.
			 * @returns {{height: number, width: number}}
			 */
			size: function(menu){
				var $nav = $('.fon-nav-size'),
					$before = _.nav.find('.fon-before'),
					$after = _.nav.find('.fon-after');
				if ($nav.length == 0){
					$nav = $('<div></div>',{ 'class': 'fon-nav-size'	}).appendTo('body');
					$('<div></div>',{ 'class': 'fon-nav-inner' }).appendTo($nav);
				}
				$nav.removeClass().addClass(_.u.concat('fon-nav-size', _.o.theme, _.o.classes, _.o.position));
				var $inner = $nav.find('.fon-nav-inner').empty().append(menu.clone());
				return {
					height: $inner.height(),
					width: $inner.width(),
					before: {
						height: $before.height(),
						width: $before.width()
					},
					after: {
						height: $after.height(),
						width: $after.width()
					}
				};
			},
			/**
			 * Forces FooNav to recalculate it's size.
			 */
			resize: function(){
				var $menu = _.inner.children('.fon-menu:first');
				if ($menu.length == 0) { return; }
				_.m.setSize(_.m.size($menu));
			},
			setSize: function(size){
				if (typeof size.width !== 'number' || typeof size.height !== 'number') return;
				var vs = _.u.viewportSize(), nh = _.nav.height(),
					bah = (size.before.height ? size.before.height : 0) + (size.after.height ? size.after.height : 0) + 7;
				if (vs.width < 640) size.height = nh - bah;
				_.inner.css({ width: size.width, height: size.height });
			},
			/**
			 * Gets the menu that contains the supplied href.
			 * @param {string} href - The href to search for.
			 * @param {boolean} [back] -  Whether or not to search back links.
			 * @returns {jQuery}
			 */
			get: function(href, back){
				if (typeof href == 'string'){
					return _.m.exists(href, _.menu, back).closest('.fon-menu').clone();
				}
				return _.menu.clone();
			},
			/**
			 * Sets the menu to the supplied href and visibility.
			 * @param {string} href - The href to set.
			 * @param {boolean} [visible] - Whether or not the menu is open.
			 */
			set: function(href, visible){
				visible = visible || false;
				var $menu = _.m.get(href, true);
				if ($menu.length == 0) { return; }
				_.inner.empty();
				_.m.setSize(_.m.size($menu));
				_.inner.append($menu);
				_.m.active(href, $menu, true);
				_.m.position(visible);
			},
			/**
			 * Transitions between two menus.
			 * @param {jQuery} current - The current menu.
			 * @param {jQuery} next - The menu to display next.
			 * @param {boolean} back - Whether or not this is a back operation. This changes the direction of the slide transition but does not affect the fade transition.
			 * @param {function} complete - the function to call once the transition is complete.
			 */
			transition: function(current, next, back, complete){
				complete = complete || noop;

				var ns = _.m.size(next), //new size
					cs = { height: _.inner.height(), width: _.inner.width() }, //current size
					start = {}, prep = {}, end = {}, remove = {}, name,
					vs = _.u.viewportSize(), nh = _.nav.height(),
					bah = (ns.before.height ? ns.before.height : 0) + (ns.after.height ? ns.after.height : 0) + 7;

				if (vs.width < 640) ns.height = nh - bah;

				//if there's no change in size set the animation speed of the adjustment to zero, we don't need it.
				var s = ns.width != cs.width || ns.height != cs.height ? _.o.speed : 0;

				switch(_.o.transition){
					case 'fade':
						name = 'opacity';
						start[name] = prep[name] = 0;
						end[name] = 1;
						remove[name] = '';
						break;
					default:
						name = 'left';
						start[name] = back ? cs.width : -(cs.width);
						prep[name] = back ? -(cs.width) : cs.width;
						end[name] = 0;
						remove[name] = '';
						break;
				}

				_.inner.stop();
				current.stop().animate(start, _.o.speed, function(){
					current.remove();
					_.inner.animate(ns, s, function(){
						_.inner.empty().append(next.css(prep));
						next.animate(end, _.o.speed, function(){
							next.css(remove);
							complete();
						});
					});
				});
			},
			/**
			 * Handles the jQuery click event of the menu/toggle button.
			 * @param {*} e - The jQuery event object.
			 */
			toggle: function(e){
				if (!e.allow){
					e.preventDefault();
					e.stopPropagation();
				}
				_.nav.toggleClass('fon-open');
				var w = _.nav.outerWidth(true),
					active = _.nav.hasClass('fon-open'),
					pos = _.u.position(),
					start = 0, end = 0,	o = {};

				if (active){ start = -(w); }
				else { end = -(w); }

				o[pos.h] = end;

				if (active){ _.nav.removeClass('fon-closed fon-user-closed'); }
				else { _.nav.addClass('fon-closing'); }

				_.nav.css(pos.h, start).animate(o, _.o.speed, function(){
					if (!active && _.nav != null){
						if (_.o.smart.enable && !_.o.smart.remember){
							var	$next = _.menu.clone();
							_.inner.empty();
							_.m.setSize(_.m.size($next));
							_.inner.append($next);
							_.m.position(false);
						}
						_.nav.removeClass('fon-closing').addClass('fon-closed fon-user-closed');
					}
				});
			},
			/**
			 * Handles the jQuery click event of the back button.
			 * @param {jQuery.Event} e - The jQuery event object.
			 */
			back: function(e){
				var $link = $(this),
					href = $link.attr('href'),
					$menu = _.inner.find('> .fon-menu:last'),
					$next = _.m.get(href),
					anchored = $link.hasClass('fon-anchored');

				_.m.transition($menu, $next, true, function(){
					_.m.active(href, $next);
				});

				if (anchored && _.o.smart.enable && _.o.smart.scroll){
					e.preventDefault();
					e.stopPropagation();
					_.w.scroll(href);
					_.d.set(href.substring(1, href.length));
				}
			},
			/**
			 * Handles the jQuery click event of the menu items.
			 * @param {jQuery.Event} e - The jQuery event object.
			 */
			clicked: function(e){
				var $link = $(this),
					anchored = $link.hasClass('fon-anchored'),
					parent = $link.hasClass('fon-has-menu'),
					href = $link.attr('href');

				$link.parents('.fon-menu:first').find('li > .fon-active').removeClass('fon-active');
				$link.addClass('fon-active');

				if (parent){
					var $menu = _.inner.find('> .fon-menu:last'),
						$next = _.m.get(href, true);
					_.m.transition($menu, $next, false, function(){
						_.m.active(href, $next, true);
					});
				}
				if (anchored && _.o.smart.enable && _.o.smart.scroll) { // if it's anchored and we have smooth scroll enabled
					e.preventDefault();
					e.stopPropagation();
					_.w.scroll(href);
					_.d.set(href.substring(1, href.length));
				} else if (href.substring(0,1) == '#' && _.o.smart.enable && _.o.smart.scroll) { // if it's not anchored but smooth scroll is enabled eat the default behaviour
					e.preventDefault();
					e.stopPropagation();
				}
			}
		};

		/** @namespace - Contains all the functions used for deeplinking. */
		this.d = {
			/**
			 * Sets the url hash value to the provided value using the history API where applicable.
			 * @param {string} hash - The hash to set.
			 */
			set: function(hash){
				if (!_.o.deeplinking) return;
				if (window.history && window.history.pushState){
					window.history.replaceState(null, document.title, window.location.pathname + window.location.search + '#' + hash);
				} else {
					window.location.replace(('' + window.location).split('#')[0] + '#' + hash);
				}
			},
			/**
			 * Clears the hash value from the url using the history API where applicable.
			 */
			clear: function(){
				if (!_.o.deeplinking) return;
				if (window.history && window.history.pushState){
					window.history.replaceState(null, document.title, window.location.pathname + window.location.search);
				} else {
					window.location.replace(('' + window.location).split('#')[0] + '#/');
				}
			}
		};

		/** @namespace - Contains all the functions used for the tracking of anchors. */
		this.a = {
			/**
			 * @property {FooNav.Timer} - An internal timer used to prevent excessive checks on anchors while scrolling.
			 * @private
			 */
			_check: new FooNav.Timer(),
			/** @namespace - Contains functions for building the array of tracked elements. */
			tracked: {
				/** @property {Array} - The array containing all tracked elements. */
				elements: [],
				/**
				 * Recursively inspects each item and checks if the href points to an anchor in the page and if it does adds it to the elements array.
				 * @param {Array} items - The items to check.
				 */
				build: function(items){
					var i, item;
					for(i = 0; i < items.length; i++){
						item = items[i];
						if ($.isArray(item.children)){
							_.a.tracked.build(item.children);
						}
						if (typeof item.href == 'string' && item.href.substring(0,1) == '#'){
							var $target = $(item.href);
							if ($target.length == 0){ continue; }
							_.a.tracked.elements.push($target.addClass('fon-tracked'));
						}
					}
				},
				/**
				 * Lazy loads the tracked elements from the items array and stores the result in the elements array.
				 * @returns {Array}
				 */
				get: function(){
					if (_.a.tracked.elements.length > 0){ return _.a.tracked.elements; }
					_.a.tracked.elements = [];
					_.a.tracked.build(_.o.items);
					return _.a.tracked.elements;
				}
			},
			/**
			 * Checks if the supplied element is visible within the viewport.
			 * @param {HTMLElement} el - The element to check is visible.
			 * @returns {boolean}
			 */
			visible: function(el){
				var rect = el.getBoundingClientRect(), p = 20;
				return rect.top >= -p && rect.left >= -p;
			},
			/**
			 * Performs the actual visibility check on any tracked anchors and updates the menu accordingly.
			 */
			check: function(){
				_.a._check.start(function () {
					var st = $(window).scrollTop();
					if (st <= _.o.scroll) {
						_.m.set(null, _.nav.hasClass('fon-open'));
					} else {
						var tracked = _.a.tracked.get(), i, visible = [], top = 0, el, final = $(), offset, id;
						//check all tracked anchors and push those that are visible into another array.
						for (i = 0; i < tracked.length; i++) {
							if (!_.a.visible(tracked[i].get(0))) { continue; }
							visible.push(tracked[i]);
						}
						//loop through all visible anchors and get the one closest to the top of the viewport.
						for (i = 0; i < visible.length; i++) {
							el = visible[i];
							offset = el.offset();
							if (top == 0 || offset.top < top) {
								top = offset.top;
								final = el;
							}
						}
						if (final.length == 0) { return; }
						id = final.attr('id');
						_.m.set('#' + id, _.nav.hasClass('fon-open') || (!_.nav.hasClass('fon-user-closed') && _.o.smart.open));
						_.d.set(id);
					}
				}, 100);
			}
		};

		/** @namespace - Contains all the functions used with the window for scrolling and handling the close click event. */
		this.w = {
			/**
			 * @property {FooNav.Timer} - An internal timer used to prevent rebinding the anchor check to early when scrolling to a specified target.
			 * @private
			 */
			_scroll: new FooNav.Timer(),
			/**
			 * @property {FooNav.Timer} - An internal timer used to prevent excessive checks when scrolling.
			 * @private
			 */
			_scrolled: new FooNav.Timer(),
			/**
			 * @property {FooNav.Timer} - An internal timer used to prevent excessive checks when resizing.
			 * @private
			 */
			_resized: new FooNav.Timer(),
			/**
			 * Scrolls to the specified target element.
			 * @param {HTMLElement} target - The element to scroll into view.
			 */
			scroll: function(target){
				_.a._check.stop();
				var $target = $(target),
					top = $target.offset().top;

				$(window).off('scroll', _.a.check);
				_.w._scroll.stop();
				$('html, body').stop().animate({ scrollTop: top }, 800, function(){
					_.w._scroll.start(function(){
						_.w._to = null;
						$(window).on('scroll', _.a.check);
					}, 100);
				});

				if (_.o.smart.enable && _.o.smart.scroll){
				}
			},
			/**
			 * Handles the jQuery scroll event of the window.
			 */
			scrolled: function(){
				_.w._scrolled.start(function(){
					var st = $(window).scrollTop();
					if (_.o.top){
						if (st > 0){ _.top.addClass('fon-show'); }
						else { _.top.removeClass('fon-show'); }
						if (!_.u.supportsTransitions()){
							if (st > 0){ _.top.slideDown(500); }
							else { _.top.slideUp(500); }
						}
					}

					if (_.o.scroll != 0){
						if (st > _.o.scroll){
							_.nav.fadeIn(_.o.speed);
						} else {
							_.nav.fadeOut(_.o.speed);
						}
					}
				}, 100);
			},
			/**
			 * Handles the jQuery clicked event of the window.
			 * @param {jQuery.Event} e - The jQuery event object.
			 */
			clicked: function(e){
				if (_.nav.hasClass('fon-open') && !_.nav.hasClass('fon-closing') && !$(e.target).is('fon-nav') && $(e.target).closest('.fon-nav').length == 0){
					e.allow = true;
					_.m.toggle.call(_.toggle_button.get(0), e);
				}
			},
			/**
			 * Handles the jQuery clicked event of the top button.
			 * @param {jQuery.Event} e - The jQuery event object.
			 */
			top: function(e){
				e.preventDefault();
				e.stopPropagation();
				if (_.o.smart.enable && _.o.smart.scroll){
					$('html, body').stop().animate({
						scrollTop: 0
					}, 1000);
				} else {
					$('html, body').scrollTop(0);
				}
			},
			resized: function(){
				_.w._resized.start(function(){
					_.m.resize();
				}, 100);
			}
		};

		return this.init(options);
	};

})(jQuery, window);