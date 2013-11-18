(function($, window){

	window.FooNav = {
		defaults: {
			after: null,
			before: null,
			classes: null,
			position: 'fon-bottom-right',
			theme: 'fon-light',
			scroll: 200,
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
		this.options = $.extend(true, {}, FooNav.defaults);
		this.nav = null;
		this.inner = null;
		this.back = null;
		this.toggle = null;
		this.root = null;
		this.history = [];

		var _this = this, _scroll = null;

		this.init = function(o){
			_this.options = $.extend(true, _this.options, o);

			_this.build.side();
			_this.build.buttons();
			_this.build.menu();
			_this.build.extra();
			_this.menu.position();

			if (_this.options.smart.enable){
				if (_this.options.smart.url){ _this.menu.set(location.href, _this.options.smart.open); }
				if (_this.options.smart.close){ $(window).on('click', _this.handlers.close); }
			}

			$(window).on('scroll', _this.handlers.scroll);
		};

		this.reinit = function(o){
			_this.destroy(true);
			_this.options = $.extend(true, _this.options, o);
			_this.init(o);
		};

		this.destroy = function(partial){
			partial = partial || true;
			_this.nav.remove();
			_this.options = $.extend(true, {}, FooNav.defaults);
			_this.nav = _this.inner = _this.back = _this.toggle = _this.root = null;
			_this.history = [];
			$(window).off({
				scroll: _this.handlers.scroll,
				click: _this.handlers.close
			});
			if (!partial){
				FooNav.instances[_this.id - 1] = null;
			}
		};

		this.build = {
			side: function() {
				_this.nav = $('<div/>', {
					'class': ['fon-nav', _this.options.position, _this.options.theme].join(' '),
					css: { display: 'none' }
				}).appendTo('body');

				_this.inner = $('<div/>', { 'class': 'fon-nav-inner' }).appendTo(_this.nav);

				if (typeof _this.options.classes != 'string') { return; }
				_this.nav.addClass(_this.options.classes);
			},
			buttons: function(){
				_this.nav
					.on('click', '.fon-item-link:has(.fon-icon-expand)', _this.handlers.expand)
					.on('click', '.fon-current > .fon-item-link', _this.handlers.kill)
					.on('click', '.fon-item:not(.fon-current) .fon-item-link', _this.handlers.current);

				var $buttons = $('<div/>', {
					'class': 'fon-buttons'
				}).appendTo(_this.nav);

				_this.back = $('<a/>', {
					'class': 'fon-button',
					href: '#back',
					css: { display: 'none' },
					on: {	click: _this.handlers.back }
				}).append($('<span/>', { 'class': 'fon-icon fon-icon-back' }));

				_this.toggle = $('<a/>', {
					'class': 'fon-button',
					href: '#toggle',
					on: {	click: _this.handlers.toggle }
				}).append($('<span/>', { 'class': 'fon-icon fon-icon-open' })).appendTo($buttons);

				if (_this.options.position.indexOf('top') !== -1){ _this.back.appendTo($buttons); }
				else { _this.back.prependTo($buttons); }
			},
			_menu: function(parent, items){
				var i, l = items.length, $menu;
				for (i = 0; i < l; i++){
					var item = items[i];
					var $li = $('<li/>', { 'class': 'fon-item' }).appendTo(parent);
					var $a = $('<a/>', { 'class': 'fon-item-link', href: item.href, text: item.text }).appendTo($li);
					if ($.isArray(item.children)){
						$a.prepend($('<span/>', { 'class': 'fon-icon fon-icon-expand' }));
						$menu = $('<ul/>', { 'class': 'fon-menu' }).appendTo($li);
						_this.build._menu($menu, item.children);
					}
				}
			},
			menu: function(){
				_this.root = $('<ul/>', { 'class': 'fon-menu' });
				_this.build._menu(_this.root, _this.options.items);
				_this.root.clone().appendTo(_this.inner);
			},
			extra: function(){
				if (typeof _this.options.after == 'string'){
					_this.nav.append($('<div/>', { 'class': 'fon-after' }).html(_this.options.after));
				}
				if (typeof _this.options.before == 'string'){
					_this.nav.prepend($('<div/>', { 'class': 'fon-before' }).html(_this.options.before));
				}
			}
		};

		this.url = {
			_a: document.createElement('a'),
			qualify: function(url){
				_this.url._a.href = url;
				return _this.url._a.href;
			},
			exists: function(url, parent){
				parent = parent || _this.root;
				url = _this.url.qualify(url);
				return parent.find('a.fon-item-link').filter(function(){
					return url == _this.url.qualify($(this).attr('href'));
				}).first();
			}
		};

		this.menu = {
			position: function(visible){
				visible = visible || false;
				if (visible && _this.back.hasClass('fon-requires-show')){ _this.back.removeClass('fon-requires-show').show(); }

				var dir;
				if (_this.options.position.indexOf('right') !== -1){ dir = 'right'; }
				else { dir = 'left'; }

				_this.nav.css(dir, visible ? 0 : -(_this.nav.outerWidth(true)));
				if (visible){
					_this.toggle.find('.fon-icon').removeClass('fon-icon-open').addClass('fon-icon-close');
					_this.nav.addClass('fon-active');
				} else {
					_this.toggle.find('.fon-icon').removeClass('fon-icon-close').addClass('fon-icon-open');
					_this.nav.removeClass('fon-active');
				}
			},
			current: function(href, menu){
				if (menu.find('> .fon-current').length != 0) { return; }
				var $link = _this.url.exists(href, menu);
				if ($link.length == 0) { return; }
				$link.closest('.fon-item').addClass('fon-current');
			},
			size: function(menu){
				var $nav = $('.fon-nav-size');
				if ($nav.length == 0){
					$nav = $('<div/>',{ 'class': 'fon-nav-size'	}).appendTo('body');
					$('<div/>',{ 'class': 'fon-nav-inner' }).appendTo($nav);
				}
				$nav.removeClass().addClass('fon-nav-size ' + _this.options.theme);
				if (typeof _this.options.classes == 'string'){ $nav.addClass(_this.options.classes);	}
				var $inner = $nav.find('.fon-nav-inner');
				$inner.empty().append(menu.clone());
				return {
					height: $inner.height(),
					width: $inner.width() + 10 //The reason for this is the negative margin-left in .fon-icon-expand (a child) causes IE & FireFox to miscalculate by the value of the margin...
				};
			},
			get: function(href){
				if (typeof href == 'string'){
					return _this.url.exists(href).closest('.fon-menu');
				}
				return _this.root;
			},
			set: function(href, visible){
				visible = visible || false;
				var $menu = _this.menu.get(href), $back;
				if ($menu.length == 0) { return; }

				_this.history = [];
				$back = $menu.parents('.fon-menu:first');
				while ($back.length > 0){
					_this.history.unshift($back.clone());
					$back = $back.parents('.fon-menu:first');
				}

				var ns = _this.menu.size($menu),
					$clone = $menu.clone();

				_this.inner.empty().css(ns).append($clone);
				if (_this.history.length > 0){ _this.back.addClass('fon-requires-show'); }
				_this.back.hide();
				_this.menu.current(href, $clone);
				_this.menu.position(visible);
			},
			toggle: function(){
				_this.toggle.find('.fon-icon').toggleClass('fon-icon-open fon-icon-close');
				_this.nav.toggleClass('fon-active');

				var cw = _this.nav.outerWidth(true),
					active = _this.nav.hasClass('fon-active'),
					start = 0, end = 0,
					o = {},
					dir;

				if (active){ start = -(cw); }
				else { end = -(cw);	}

				if (_this.options.position.indexOf('right') !== -1){ dir = 'right'; }
				else { dir = 'left'; }

				o[dir] = end;

				if (active){
					if(_this.back.hasClass('fon-requires-show')){ _this.back.removeClass('fon-requires-show').show(); }
					_this.nav.removeClass('fon-closed');
				}
				_this.nav.css(dir, start).animate(o, _this.options.speed, function(){
					if (!active){
						if (!_this.options.smart.remember){
							var	$menu = _this.inner.find('> .fon-menu'),
								$next = _this.history.shift();

							if ($next instanceof jQuery){
								$menu.remove();
								var ns = _this.menu.size($next);
								_this.inner.css(ns).append($next);
								_this.back.hide();
								_this.menu.position();
							}
						}
						if (_this.back.is(':visible')) { _this.back.addClass('fon-requires-show').hide(); }
						if (_this.options.smart.enable && _this.options.smart.url){
							_this.menu.set(location.href);
						}
						_this.nav.addClass('fon-closed');
					}
				});
			},
			forward: function(menu){
				var $menu = _this.inner.find('> .fon-menu'),
					$next = menu.clone();

				var i = 0,
					ns = _this.menu.size($next),
					cs = { height: _this.inner.height(), width: _this.inner.width() };

				if (ns.width != cs.width || ns.height != cs.height){ i = _this.options.speed; }
				_this.back.off('click', _this.handlers.back);
				$menu.stop(false, true).animate({ left: -(cs.width) }, _this.options.speed, function(){
					_this.history.push($menu.css('left','').detach());
					_this.inner.animate(ns, i, function(){
						_this.inner.append($next.css('left', ns.width));
						$next.animate({ left: 0 }, _this.options.speed, function(){
							$next.css('left', '');
							_this.back.on('click', _this.handlers.back);
							_this.back.show();
							if (_this.options.smart.enable && _this.options.smart.url){
								_this.menu.current(location.href, $next);
							}
						});
					});
				});
			},
			back: function(){
				var $menu = _this.inner.find('> .fon-menu'),
					$next = _this.history.pop();

				var i = 0,
					ns = _this.menu.size($next),
					cs = { height: _this.inner.height(), width: _this.inner.width() };

				if (ns.width != cs.width || ns.height != cs.height){ i = _this.options.speed; }
				_this.back.off('click', _this.handlers.back);
				$menu.stop(false, true).animate({ left: cs.width }, _this.options.speed, function(){
					$menu.remove();
					_this.inner.animate(ns, i, function(){
						_this.inner.append($next.css('left', -(ns.width)));
						$next.animate({ left: 0 }, _this.options.speed, function(){
							$next.css('left', '');
							_this.back.on('click', _this.handlers.back);
							if (_this.history.length == 0){ _this.back.hide();	}
							if (_this.options.smart.enable && _this.options.smart.url){
								_this.menu.current(location.href, $next);
							}
						});
					});
				});
			}
		};

		this.anchors = {
			tracked: {
				elements: [],
				build: function(items){
					var i, item;
					for(i = 0; i < items.length; i++){
						item = items[i];
						if ($.isArray(item.children)){
							_this.anchors.tracked.build(item.children);
						}
						if (typeof item.href == 'string' && item.href.substring(0,1) == '#'){
							var $target = $(item.href);
							if ($target.length == 0){ continue; }
							_this.anchors.tracked.elements.push($target);
						}
					}
					return _this.anchors.tracked.elements;
				},
				get: function(){
					if (_this.anchors.tracked.elements.length > 0){ return _this.anchors.tracked.elements; }
					_this.anchors.tracked.elements = [];
					_this.anchors.tracked.build(_this.options.items);
					return _this.anchors.tracked.elements;
				}
			},
			visible: function(el){
				var rect = el.getBoundingClientRect(), p = 20;
				return rect.top >= -p && rect.left >= p && rect.bottom <= $(window).height() + p && rect.right <= $(window).width() + p;
			},
			check: function(){
				var tracked = _this.anchors.tracked.get(), i, visible = [], top = 0, el, final = $(), offset, id;
				for (i = 0; i < tracked.length; i++){
					if (!_this.anchors.visible(tracked[i].get(0))){ continue; }
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
				_this.menu.set('#' + id, _this.nav.hasClass('fon-active') || (!_this.nav.hasClass('fon-closed') && _this.options.smart.open));
			}
		};

		this.handlers = {
			kill: function(e){
				e.preventDefault();
				e.stopPropagation();
			},
			scroll: function(){
				if (_scroll != null){ clearTimeout(_scroll); }
				_scroll = setTimeout(function(){
					_scroll = null;
					if (_this.options.smart.enable && _this.options.smart.anchors){
						_this.anchors.check();
					}
					if ($(window).scrollTop() > _this.options.scroll){
						_this.nav.fadeIn(_this.options.speed);
					} else {
						_this.nav.fadeOut(_this.options.speed);
					}
				}, 100);
			},
			current: function(e){
				_this.inner.find('.fon-current').removeClass('fon-current');
				var $link = $(this), href, $target;
				$link.closest('.fon-item').addClass('fon-current');
				if (_this.options.smart.enable && _this.options.smart.scroll){
					e.preventDefault();
					e.stopPropagation();
					href = $link.attr('href');
					if (typeof href == 'string' && href.substring(0, 1) == '#'){
						$target = $(href);
						if ($target.length == 0){ return; }
						$(window).off('scroll', _this.handlers.scroll);
						$('html, body').stop().animate({
							scrollTop: $target.offset().top
						}, 1000, function(){
							$(window).on('scroll', _this.handlers.scroll);
						});
					}
				}
			},
			close: function(e){
				if (_this.nav.hasClass('fon-active') && !$(e.target).is('fon-nav') && $(e.target).closest('.fon-nav').length == 0){
					_this.handlers.toggle.call(_this.toggle.get(0), e);
				}
			},
			toggle: function(e){
				e.preventDefault();
				e.stopPropagation();
				_this.menu.toggle();
			},
			expand: function(e){
				e.preventDefault();
				e.stopPropagation();
				_this.menu.forward($(this).closest('.fon-item').find('> .fon-menu:first'));
			},
			back: function(e){
				e.preventDefault();
				e.stopPropagation();
				_this.menu.back();
			}
		};
		this.init(options);
		return this;
	};

})(jQuery, window);