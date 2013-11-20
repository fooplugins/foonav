(function($, window){

	window.FooNav = {
		defaults: {
			after: null,
			before: null,
			classes: null,
			position: 'fon-bottom-right',
			theme: 'fon-light',
			scroll: 0,
			speed: 200,
			smart: {
				enable: false,
				anchors: true,
				close: true,
				open: true,
				remember: true,
				scroll: true,
				url: true
			},
			icons: {
				set: null,
				back: 'fon-icon-back',
				close: 'fon-icon-menu',
				expand: 'fon-icon-expand',
				open: 'fon-icon-menu',
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

	FooNav.Instance = function(options){
		this.id = FooNav.instances.push(this);
		this.o = $.extend(true, {}, FooNav.defaults);
		this.nav = null;
		this.inner = null;
		this.back = null;
		this.top = null;
		this.toggle = null;
		this.root = null;
		this.history = [];

		var _ = this;

		this.init = function(o){
			_.o = $.extend(true, _.o, o);

			_.build.side();
			_.build.buttons();
			_.build.menu();
			_.build.extra();
			_.menu.position();

			if (_.o.smart.enable){
				if (_.o.smart.url){ _.menu.set(location.href, _.o.smart.open); }
				if (_.o.smart.close){ $(window).on('click', _.window.clicked); }
				if (_.o.smart.anchors){ $(window).on('scroll', _.anchors.check); }
			}

			if (_.o.scroll > 0) {
				$(window).on('scroll', _.window.scrolled);
			} else {
				_.nav.show();
			}
		};

		this.reinit = function(o){
			_.destroy(true);
			_.o = $.extend(true, _.o, o);
			_.init(o);
		};

		this.destroy = function(partial){
			partial = partial || true;
			_.nav.remove();
			_.o = $.extend(true, {}, FooNav.defaults);
			_.nav = _.inner = _.back = _.toggle = _.root = null;
			_.history = [];
			$(window)
				.off('scroll', _.anchors.check)
				.off('scroll', _.window.scrolled)
				.off('click', _.window.clicked);
			if (!partial){
				FooNav.instances[_.id - 1] = null;
			}
		};

		this.u = {
			classes: function(className, classNameN){
				var a = [], i;
				for (i = 0; i < arguments.length; i++){ a.push(arguments[i]); }
				return a.join(' ');
			},
			position: function(){
				var p = _.o.position.split('-');
				return { v: p[1], h: p[2] };
			}
		};

		this.build = {
			side: function() {
				_.nav = $('<div/>', {
					'class': _.u.classes('fon-nav', _.o.position, _.o.theme, _.o.icons.set, _.o.classes),
					css: { display: 'none' }
				}).on('click', '.fon-item-link', _.handlers.clicked).appendTo('body');

				_.inner = $('<div/>', { 'class': 'fon-nav-inner' }).appendTo(_.nav);
			},
			buttons: function(){
				_.top = $('<a/>', {
					'class': 'fon-button',
					href: '#top',
					on: {	click: _.handlers.top }
				}).append($('<span/>', { 'class': _.u.classes('fon-icon', _.o.icons.top) }));

				_.toggle = $('<a/>', {
					'class': 'fon-button',
					href: '#toggle',
					on: {	click: _.handlers.toggle }
				}).append($('<span/>', { 'class': _.u.classes('fon-icon', _.o.icons.open) }));

				_.back = $('<a/>', {
					'class': 'fon-button',
					href: '#back',
					css: { display: 'none' },
					on: {	click: _.handlers.back }
				}).append($('<span/>', { 'class': _.u.classes('fon-icon', _.o.icons.back) }));

				var $buttons = $('<div/>', {
					'class': 'fon-buttons'
				}).appendTo(_.nav);

				var pos = _.u.position();
				switch(pos.v){
					case 'top':
					case 'middle':
						$buttons.append(_.top, _.toggle, _.back);
						break;
					default:
						$buttons.append(_.back, _.top, _.toggle);
						break;
				}
			},
			_menu: function(parent, items){
				var i, l = items.length, $menu;
				for (i = 0; i < l; i++){
					var item = items[i];
					var $li = $('<li/>', { 'class': 'fon-item' }).appendTo(parent);
					var $a = $('<a/>', { 'class': 'fon-item-link', href: item.href, text: item.text }).appendTo($li);
					if ($.isArray(item.children)){
						$a.prepend($('<span/>', { 'class': 'fon-icon ' + _.o.icons.expand }));
						$menu = $('<ul/>', { 'class': 'fon-menu' }).appendTo($li);
						_.build._menu($menu, item.children);
					}
				}
			},
			menu: function(){
				_.root = $('<ul/>', { 'class': 'fon-menu' });
				_.build._menu(_.root, _.o.items);
				_.root.clone().appendTo(_.inner);
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

		this.url = {
			_a: document.createElement('a'),
			qualify: function(url){
				_.url._a.href = url;
				return _.url._a.href;
			},
			exists: function(url, parent){
				parent = parent || _.root;
				url = _.url.qualify(url);
				return parent.find('a.fon-item-link').filter(function(){
					return url == _.url.qualify($(this).attr('href'));
				}).first();
			}
		};

		this.menu = {
			position: function(visible){
				visible = visible || false;
				if (visible && _.back.hasClass('fon-requires-show')){ _.back.removeClass('fon-requires-show').show(); }

				var pos = _.u.position();

				_.nav.css(pos.h, visible ? 0 : -(_.nav.outerWidth(true)));
				if (visible){
					_.toggle.find('.fon-icon').removeClass(_.o.icons.open).addClass(_.o.icons.close);
					_.nav.removeClass('fon-closed fon-user-closed').addClass('fon-open');
				} else {
					_.toggle.find('.fon-icon').removeClass(_.o.icons.close).addClass(_.o.icons.open);
					_.nav.removeClass('fon-open').addClass('fon-closed');
				}
			},
			current: function(href, menu){
				if (menu.find('> .fon-current').length != 0) { return; }
				var $link = _.url.exists(href, menu);
				if ($link.length == 0) { return; }
				$link.closest('.fon-item').addClass('fon-current');
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
			get: function(href){
				if (typeof href == 'string'){
					return _.url.exists(href).closest('.fon-menu');
				}
				return _.root;
			},
			set: function(href, visible){
				visible = visible || false;
				var $menu = _.menu.get(href), $back;
				if ($menu.length == 0) { return; }

				_.history = [];
				$back = $menu.parents('.fon-menu:first');
				while ($back.length > 0){
					_.history.unshift($back.clone());
					$back = $back.parents('.fon-menu:first');
				}

				var ns = _.menu.size($menu),
					$clone = $menu.clone();

				_.inner.empty().css(ns).append($clone);
				if (_.history.length > 0){ _.back.addClass('fon-requires-show'); }
				_.back.hide();
				_.menu.current(href, $clone);
				_.menu.position(visible);
			},
			toggle: function(){
				var $icon = _.toggle.find('.fon-icon');
				if ($icon.hasClass(_.o.icons.open)){
					$icon.removeClass(_.o.icons.open).addClass(_.o.icons.close);
				} else {
					$icon.removeClass(_.o.icons.close).addClass(_.o.icons.open);
				}
				_.nav.toggleClass('fon-open');

				var cw = _.nav.outerWidth(true),
					active = _.nav.hasClass('fon-open'),
					start = 0, end = 0,
					o = {},
					dir;

				if (active){ start = -(cw); }
				else { end = -(cw);	}

				if (_.o.position.indexOf('right') !== -1){ dir = 'right'; }
				else { dir = 'left'; }

				o[dir] = end;

				if (active){
					if(_.back.hasClass('fon-requires-show')){ _.back.removeClass('fon-requires-show').show(); }
					_.nav.removeClass('fon-closed fon-user-closed');
				}
				_.nav.css(dir, start).animate(o, _.o.speed, function(){
					if (!active){
						if (!_.o.smart.remember){
							var	$menu = _.inner.find('> .fon-menu'),
								$next = _.history.shift();

							if ($next instanceof jQuery){
								$menu.remove();
								var ns = _.menu.size($next);
								_.inner.css(ns).append($next);
								_.back.hide();
								_.menu.position();
							}
						}
						if (_.back.is(':visible')) { _.back.addClass('fon-requires-show').hide(); }
						if (_.o.smart.enable && _.o.smart.url){
							_.menu.set(location.href);
						}
						_.nav.addClass('fon-closed fon-user-closed');
					}
				});
			},
			forward: function(menu){
				var $menu = _.inner.find('> .fon-menu'),
					$next = menu.clone();

				var i = 0,
					ns = _.menu.size($next),
					cs = { height: _.inner.height(), width: _.inner.width() };

				if (ns.width != cs.width || ns.height != cs.height){ i = _.o.speed; }
				_.back.off('click', _.handlers.back);
				$menu.stop(false, true).animate({ left: -(cs.width) }, _.o.speed, function(){
					_.history.push($menu.css('left','').detach());
					_.inner.animate(ns, i, function(){
						_.inner.append($next.css('left', ns.width));
						$next.animate({ left: 0 }, _.o.speed, function(){
							$next.css('left', '');
							_.back.on('click', _.handlers.back);
							_.back.show();
							if (_.o.smart.enable && _.o.smart.url){
								_.menu.current(location.href, $next);
							}
						});
					});
				});
			},
			back: function(){
				var $menu = _.inner.find('> .fon-menu'),
					$next = _.history.pop();

				var i = 0,
					ns = _.menu.size($next),
					cs = { height: _.inner.height(), width: _.inner.width() };

				if (ns.width != cs.width || ns.height != cs.height){ i = _.o.speed; }
				_.back.off('click', _.handlers.back);
				$menu.stop(false, true).animate({ left: cs.width }, _.o.speed, function(){
					$menu.remove();
					_.inner.animate(ns, i, function(){
						_.inner.append($next.css('left', -(ns.width)));
						$next.animate({ left: 0 }, _.o.speed, function(){
							$next.css('left', '');
							_.back.on('click', _.handlers.back);
							if (_.history.length == 0){ _.back.hide();	}
							if (_.o.smart.enable && _.o.smart.url){
								_.menu.current(location.href, $next);
							}
						});
					});
				});
			}
		};

		this.anchors = {
			_id: null,
			tracked: {
				elements: [],
				build: function(items){
					var i, item;
					for(i = 0; i < items.length; i++){
						item = items[i];
						if ($.isArray(item.children)){
							_.anchors.tracked.build(item.children);
						}
						if (typeof item.href == 'string' && item.href.substring(0,1) == '#'){
							var $target = $(item.href);
							if ($target.length == 0){ continue; }
							_.anchors.tracked.elements.push($target);
						}
					}
					return _.anchors.tracked.elements;
				},
				get: function(){
					if (_.anchors.tracked.elements.length > 0){ return _.anchors.tracked.elements; }
					_.anchors.tracked.elements = [];
					_.anchors.tracked.build(_.o.items);
					return _.anchors.tracked.elements;
				}
			},
			visible: function(el){
				var rect = el.getBoundingClientRect(), p = 20;
				return rect.top >= -p && rect.left >= p && rect.bottom <= $(window).height() + p && rect.right <= $(window).width() + p;
			},
			check: function(){
				if (_.anchors._id != null){ clearTimeout(_.anchors._id); }
				_.anchors._id = setTimeout(function(){
					_.anchors._id = null;

					var tracked = _.anchors.tracked.get(), i, visible = [], top = 0, el, final = $(), offset, id;
					for (i = 0; i < tracked.length; i++){
						if (!_.anchors.visible(tracked[i].get(0))){ continue; }
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
					_.menu.set('#' + id, _.nav.hasClass('fon-open') || (!_.nav.hasClass('fon-user-closed') && _.o.smart.open));
				}, 100);
			}
		};

		this.window = {
			_id: null,
			scrolled: function(){
				if (_.window._id != null){ clearTimeout(_.window._id); }
				_.window._id = setTimeout(function(){
					_.window._id = null;
					if ($(window).scrollTop() > _.o.scroll){
						_.nav.fadeIn(_.o.speed);
					} else {
						_.nav.fadeOut(_.o.speed);
					}
				}, 100);
			},
			clicked: function(e){
				if (_.nav.hasClass('fon-open') && !$(e.target).is('fon-nav') && $(e.target).closest('.fon-nav').length == 0){
					_.handlers.toggle.call(_.toggle.get(0), e);
				}
			}
		};

		this.handlers = {
			clicked: function(e){
				var $link = $(this),
					$item = $link.closest('.fon-item'),
					$menu = $item.find('> .fon-menu:first'),
					href, $target;

				if ($item.hasClass('fon-current')){
					e.preventDefault();
					e.stopPropagation();
				}
				_.inner.find('.fon-current').removeClass('fon-current');
				$item.addClass('fon-current');
				if ($menu.length > 0){
					e.preventDefault();
					e.stopPropagation();
					_.menu.forward($menu);
				}
				if (_.o.smart.enable && _.o.smart.scroll){
					href = $link.attr('href');
					if (typeof href == 'string' && href.substring(0, 1) == '#'){
						$target = $(href);
						if ($target.length == 0){ return; }
						e.preventDefault();
						e.stopPropagation();
						$(window).off('scroll', _.window.scrolled);
						$(window).off('scroll', _.anchors.check);
						$('html, body').stop().animate({
							scrollTop: $target.offset().top
						}, 1000, function(){
							setTimeout(function(){
								if (_.o.scroll > 0) {
									$(window).on('scroll', _.window.scrolled);
								}
								if (_.o.smart.enable && _.o.smart.anchors){
									$(window).on('scroll', _.anchors.check);
								}
							},100);
						});
					}
				}
			},
			toggle: function(e){
				e.preventDefault();
				e.stopPropagation();
				_.menu.toggle();
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
			},
			back: function(e){
				e.preventDefault();
				e.stopPropagation();
				_.menu.back();
			}
		};
		this.init(options);
		return this;
	};

})(jQuery, window);