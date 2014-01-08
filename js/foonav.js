(function($, window){

	window.FooNav = {
		defaults: {
			/** @type {(string|HTMLElement|Array|jQuery)} - A DOM element, array of elements, HTML string, or jQuery object to insert after the generated menu. */
			after: null,
			/** @type {(string|HTMLElement|Array|jQuery)} - A DOM element, array of elements, HTML string, or jQuery object to insert before the generated menu. */
			before: null,
			/** @type {string} - A string of space separated class names to add to the navigation element. */
			classes: null,
			/** @type {boolean} - Whether or not to display the 'To Top' button. */
			top: true,
			/** @type {string} - The class name of the position for the navigation element. */
			position: 'fon-bottom-right',
			/** @type {string} - The class name of the theme for the navigation element. */
			theme: 'fon-light',
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
				open: true,
				/** @type {boolean} - Whether or not to remember menu position on toggle. If set to true the menu will remember it's current position while being toggled. If set to false when the menu is displayed or redisplayed it is reset to the root. */
				remember: true,
				/** @type {boolean} - Whether or not to enable smart scrolling. If set to true and a user clicks on an anchored item the page will smoothly scroll to the anchor from it's current position. */
				scroll: true,
				/** @type {boolean} - Whether or not to parse the current url for a hash value. If a hash is found and it matches an item the menu is set to display that item. */
				url: true
			},
			/** @type {string} - A string to display above the root menu items. This is replaced by the back button text on child menus. */
			title: 'FooNav',
			/** @type {string} - A string specifying the type of transition to use on the menu. Possible values are 'slide' and 'fade' */
			transition: 'slide',
			/** @namespace - Contains all the icon class information. */
			icons: {
				back: { family: 'fon-icon', icon: 'fon-icon-back' },
				expand: { family: 'fon-icon', icon: 'fon-icon-expand' },
				menu: { family: 'fon-icon', icon: 'fon-icon-menu' },
				top: { family: 'fon-icon', icon: 'fon-icon-top' }
			},
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
			/**
			 * An array of PlainObjects defining the items to display in the menu.
			 * @example <caption>Example item object</caption>
			 * items: [{
			 * 	href: [string],
			 * 	text: [string],
			 * 	children: [array]
			 * }]
			 */
			items: []
		},
		/**
		 * Contains all instantiated instances of FooNav.
		 */
		instances: []
	};

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

	FooNav.reinit = function(index, options){
		FooNav.fetch(index).reinit(options);
	};

	FooNav.destroy = function(index){
		FooNav.fetch(index).destroy();
	};

	FooNav.Timer = function(){
		this.id = null;
		var _t = this;
		this.start = function(func, delay){
			_t.stop();
			_t.id = setTimeout(function(){
				_t.id = null;
				func();
			}, delay);
		};
		this.stop = function(){
			if (_t.id != null){
				clearTimeout(_t.id);
				_t.id = null;
			}
		};
	};

	FooNav.Instance = function(options){
		this.id = FooNav.instances.push(this);
		this.o = $.extend(true, {}, FooNav.defaults);
		this.nav = null;
		this.inner = null;
		this.buttons = null;
		this.back = null;
		this.top = null;
		this.toggle = null;
		this.root = null;

		/** @type {FooNav.Instance} - Hold a reference to this object to use within functions to avoid scoping issues. */
		var _ = this,
			/** @type {function} - An empty function used for to perform no operation. */
			noop = function(){};

		this.init = function(o){
			_.o = $.extend(true, _.o, o);

			_.b.nav();
			_.b.buttons();
			_.b.menu();
			_.b.extra();
			_.m.position();

			if (_.o.smart.enable){
				if (_.o.smart.url){ _.m.set(location.href, _.o.smart.open); }
				if (_.o.smart.close){ $(window).on('click', _.w.clicked); }
				if (_.o.smart.anchors){ $(window).on('scroll', _.a.check); }
			}

			$(window).on('scroll', _.w.scrolled);
			if (_.o.scroll == 0) {
				_.nav.show();
			}
		};

		this.reinit = function(o){
			_.destroy(true);
			_.o = $.extend(true, _.o, o);
			_.init(o);
		};

		this.destroy = function(partial){
			partial = partial || false;
			_.nav.remove();
			_.o = $.extend(true, {}, FooNav.defaults);
			_.nav = _.inner = _.back = _.top = _.toggle = _.root = null;
			$(window)
				.off('scroll', _.a.check)
				.off('scroll', _.w.scrolled)
				.off('click', _.w.clicked);
			if (!partial){
				FooNav.instances[_.id - 1] = null;
			}
		};

		/** @namespace - Contains all util type functions. */
		this.u = {
			/** @type {HTMLAnchorElement} - An internal anchor element used to fully qualify urls. */
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
			}
		};

		/** @namespace - Contains all the functions used to build the menu. */
		this.b = {
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
				_.top = $('<a></a>', { 'class': 'fon-button', href: '#top', css: { display: 'none' }, on: { click: _.w.top }})
					.append(_icon('top'))
					.appendTo(_.buttons);

				_.toggle = $('<a></a>', { 'class': 'fon-button', href: '#toggle', on: { click: _.m.toggle }})
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
				var bh = _.toggle.outerHeight() * _.buttons.children().length;
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
				_.root = $('<ul></ul>', { 'class': 'fon-menu' });

				function _icon(name){
					var i = _.o.icons[name];
					if (!i) return $();
					return $('<span></span>', { 'class': _.u.concat('fon-item-icon', i.family, i.icon) });
				}

				// iterates through all the items and their children building the root ul
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
				_build(_.root, null, _.o.items);
				_.inner.append(_.root.clone());
			},
			/**
			 * Create the additional extras defined by the options.
			 */
			extra: function(){
				if (typeof _.o.after == 'string'){
					_.nav.append($('<div></div>', { 'class': 'fon-after' }).html(_.o.after));
				}
				if (typeof _.o.before == 'string'){
					_.nav.prepend($('<div></div>', { 'class': 'fon-before' }).html(_.o.before));
				}
			}
		};

		this.m = {
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
			exists: function(url, parent, back){
				parent = parent || _.root;
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
			active: function(href, menu, back){
				back = back || false;
				menu.find('li > .fon-active').removeClass('fon-active');
				var $link = _.m.exists(href, menu, back);
				if ($link.length == 0) { return; }
				$link.addClass('fon-active');
			},
			size: function(menu){
				var $nav = $('.fon-nav-size');
				if ($nav.length == 0){
					$nav = $('<div></div>',{ 'class': 'fon-nav-size'	}).appendTo('body');
					$('<div></div>',{ 'class': 'fon-nav-inner' }).appendTo($nav);
				}
				$nav.removeClass().addClass(_.u.concat('fon-nav-size', _.o.theme, _.o.classes));
				var $inner = $nav.find('.fon-nav-inner').empty().append(menu.clone());
				return {
					height: $inner.height(),
					width: $inner.width() + 10 //The reason for this is the negative margin-left in .fon-icon-expand (a child) causes IE & FireFox to miscalculate by the value of the margin...
				};
			},
			get: function(href, back){
				if (typeof href == 'string'){
					return _.m.exists(href, _.root, back).closest('.fon-menu').clone();
				}
				return _.root.clone();
			},
			set: function(href, visible){
				visible = visible || false;
				var $menu = _.m.get(href, true);
				if ($menu.length == 0) { return; }
				var ns = _.m.size($menu);
				_.inner.empty().css(ns).append($menu);
				_.m.active(href, $menu, true);
				_.m.position(visible);
			},
			transition: function(current, next, back, complete){
				complete = complete || noop;

				var ns = _.m.size(next),
					cs = { height: _.inner.height(), width: _.inner.width() },
					i = ns.width != cs.width || ns.height != cs.height ? _.o.speed : 0,
					start = {}, prep = {}, end = {}, remove = {}, name;

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
					_.inner.animate(ns, i, function(){
						_.inner.empty().append(next.css(prep));
						next.animate(end, _.o.speed, function(){
							next.css(remove);
							complete();
						});
					});
				});
			},
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
				else { end = -(w);	}

				o[pos.h] = end;

				if (active){ _.nav.removeClass('fon-closed fon-user-closed'); }
				_.nav.css(pos.h, start).animate(o, _.o.speed, function(){
					if (!active){
						if (_.o.smart.enable && !_.o.smart.remember){
							var	$next = _.root.clone(),
								ns = _.m.size($next);
							_.inner.empty().css(ns).append($next);
							_.m.position();
						}
						_.nav.addClass('fon-closed fon-user-closed');
					}
				});
			},
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
				}
			},
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
				if (anchored && _.o.smart.enable && _.o.smart.scroll) {
					e.preventDefault();
					e.stopPropagation();
					_.w.scroll(href);
				}
			}
		};

		this.a = {
			_check: new FooNav.Timer(),
			tracked: {
				elements: [],
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
					return _.a.tracked.elements;
				},
				get: function(){
					if (_.a.tracked.elements.length > 0){ return _.a.tracked.elements; }
					_.a.tracked.elements = [];
					_.a.tracked.build(_.o.items);
					return _.a.tracked.elements;
				}
			},
			visible: function(el){
				var rect = el.getBoundingClientRect(), p = 20;
				return rect.top >= -p && rect.left >= p && rect.bottom <= $(window).height() + p && rect.right <= $(window).width() + p;
			},
			check: function(){
				_.a._check.start(function(){
					var st = $(window).scrollTop();
					if (st <= _.o.scroll){
						_.m.set(null, _.nav.hasClass('fon-open'));
					} else {
						var tracked = _.a.tracked.get(), i, visible = [], top = 0, el, final = $(), offset, id;
						for (i = 0; i < tracked.length; i++){
							if (!_.a.visible(tracked[i].get(0))){ continue; }
							visible.push(tracked[i]);
						}
						for (i = 0; i < visible.length; i++){
							el = visible[i];
							offset = el.offset();
							if (top == 0 || offset.top < top){
								top = offset.top;
								final = el;
							}
						}
						if (final.length == 0){ return; }
						id = final.attr('id');
						_.m.set('#' + id, _.nav.hasClass('fon-open') || (!_.nav.hasClass('fon-user-closed') && _.o.smart.open));
					}
				}, 100);
			}
		};

		this.w = {
			_scroll: new FooNav.Timer(),
			_scrolled: new FooNav.Timer(),
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
			scrolled: function(){
				_.w._scrolled.start(function(){
					var st = $(window).scrollTop();
					if (_.o.top){
						if (st > 0){ _.top.slideDown(500); }
						else { _.top.slideUp(500); }
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
			clicked: function(e){
				if (_.nav.hasClass('fon-open') && !$(e.target).is('fon-nav') && $(e.target).closest('.fon-nav').length == 0){
					e.allow = true;
					_.m.toggle.call(_.toggle.get(0), e);
				}
			},
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
			}
		};
		this.init(options);
		return this;
	};

})(jQuery, window);