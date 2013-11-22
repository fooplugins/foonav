(function($, window){

	window.FooNav = {
		defaults: {
			after: null,
			before: null,
			classes: null,
			home: null,
			top: true,
			position: 'fon-bottom-right',
			theme: 'fon-light',
			scroll: 0,
			speed: 200,
			smart: {
				enable: true,
				anchors: true,
				close: true,
				open: true,
				remember: true,
				scroll: true,
				url: true
			},
			title: 'FooNav',
			transition: 'slide',
			icons: {
				set: null,
				back: 'fon-icon-back',
				expand: 'fon-icon-expand',
				home: 'fon-icon-home',
				menu: 'fon-icon-menu',
				top: 'fon-icon-top'
			},
			items: []
		},
		instances: []
	};

	FooNav.get = function(index){
		index = index > FooNav.instances.length - 1 ? FooNav.instances.length - 1 : index < 0 ? 0 : index;
		return FooNav.instances[index];
	};

	FooNav.create = function(options){
		return new FooNav.Instance(options);
	};

	FooNav.reinit = function(index, options){
		FooNav.get(index).reinit(options);
	};

	FooNav.destroy = function(index){
		FooNav.get(index).destroy();
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
		this.back = null;
		this.top = null;
		this.toggle = null;
		this.home = null;
		this.root = null;

		var _ = this,
			noop = function(){},
			kill = function(e){
				e.preventDefault();e.stopPropagation();
			};

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
			_.nav = _.inner = _.back = _.top = _.toggle = _.home = _.root = null;
			$(window)
				.off('scroll', _.a.check)
				.off('scroll', _.w.scrolled)
				.off('click', _.w.clicked);
			if (!partial){
				FooNav.instances[_.id - 1] = null;
			}
		};

		this.u = {
			_a: document.createElement('a'),
			qualify: function(url){
				_.u._a.href = url;
				return _.u._a.href;
			},
			classes: function(className, classNameN){
				var a = [], i;
				for (i = 0; i < arguments.length; i++){ a.push(arguments[i]); }
				return a.join(' ');
			},
			position: function(){
				var p = _.o.position.split('-');
				return { v: p[1], h: p[2] };
			},
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

		this.b = {
			nav: function() {
				_.nav = $('<div/>', {
					'class': _.u.classes('fon-nav', _.o.position, _.o.theme, _.o.icons.set, _.o.classes),
					css: { display: 'none' }
				})
					.on('click', '.fon-item-link', _.m.clicked)
					.on('click', '.fon-item-back', _.m.back)
					.appendTo('body');

				_.inner = $('<div/>', { 'class': 'fon-nav-inner' }).appendTo(_.nav);
			},
			buttons: function(){
				_.top = $('<a/>', {
					'class': 'fon-button',
					href: '#top',
					css: { display: 'none' },
					on: {	click: _.w.top }
				}).append($('<span/>', { 'class': _.u.classes('fon-icon', _.o.icons.top) }));

				_.toggle = $('<a/>', {
					'class': 'fon-button',
					href: '#toggle',
					on: {	click: _.m.toggle }
				}).append($('<span/>', { 'class': _.u.classes('fon-icon', _.o.icons.menu) }));

				_.home = $('<a/>', {
					'class': 'fon-button',
					href: _.o.home
				}).append($('<span/>', { 'class': _.u.classes('fon-icon', _.o.icons.home) }));

				if (typeof _.o.home != 'string' || (typeof _.o.home == 'string' && _.u.qualify(_.o.home) == [location.protocol, '//', location.host, location.pathname].join(''))){
					_.home.css('display','none');
				}

				$('<div/>', {
					'class': 'fon-buttons'
				}).append(_.top, _.toggle, _.home).appendTo(_.nav);
			},
			_menu: function(menu, parent, items){
				var i, l = items.length, $menu, $li, $item, item;
				if (parent != null){
					$li = $('<li/>').appendTo(menu);
					$item = $('<a/>', { 'class': 'fon-item fon-item-back', href: parent.href, text: parent.text })
						.prepend($('<span/>', { 'class': _.u.classes('fon-icon', _.o.icons.back) }))
						.appendTo($li);

					_.u.exists(parent.href, function(){
						$item.addClass('fon-anchored');
					});
				} else if (typeof _.o.title == 'string'){
					$li = $('<li/>').appendTo(menu);
					$item = $('<span/>', { 'class': 'fon-item fon-item-title fon-anchored', text: _.o.title })
						.appendTo($li);
				}
				for (i = 0; i < l; i++){
					item = items[i];
					$li = $('<li/>').appendTo(menu);
					$item = $('<a/>', { 'class': 'fon-item fon-item-link', href: item.href, text: item.text }).appendTo($li);
					_.u.exists(item.href, function(){
						$item.addClass('fon-anchored');
					});
					if ($.isArray(item.children)){
						$item.addClass('fon-has-menu').prepend($('<span/>', { 'class': 'fon-icon ' + _.o.icons.expand }));
						$menu = $('<ul/>', { 'class': 'fon-menu' }).appendTo($li);
						_.b._menu($menu, item, item.children);
					}
				}
			},
			menu: function(){
				_.root = $('<ul/>', { 'class': 'fon-menu' });
				_.b._menu(_.root, null, _.o.items);
				_.inner.empty().append(_.root.clone());
			},
			extra: function(){
				if (typeof _.o.after == 'string'){
					_.nav.append($('<div/>', { 'class': 'fon-after' }).html(_.o.after));
				}
				if (typeof _.o.before == 'string'){
					_.nav.prepend($('<div/>', { 'class': 'fon-before' }).html(_.o.before));
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
					$nav = $('<div/>',{ 'class': 'fon-nav-size'	}).appendTo('body');
					$('<div/>',{ 'class': 'fon-nav-inner' }).appendTo($nav);
				}
				$nav.removeClass().addClass(_.u.classes('fon-nav-size', _.o.theme, _.o.icons.set, _.o.classes));
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