/*
 * Зависит от jquery, jquery.mousewheel и jquery.custom.
 *
 * Важное ограничение: пока что слои со скоростями меньше единицы
 * (передвигающиеся медленее, чем зритель)
 * работают только будучи размещены прямо внутри слайда,
 * а не в глубине верстки.
 *
 * Copyright (c) 2013 Hot Dot Licensed MIT
 * http://hotdot.pro/
 * */

var paraSample = {}, utilLib = {},

	windowWidth, 
	windowHeight, 
	windowAspect, 
	baseFontSize,
	para, 
	wheelstep,
	aRCDescript,
/*
 * Хранит картинки, которые хоть и не видны,
 * но будут загружены при загрузке страницы
 */
	hiddenImagesContainer,


	iPadMode = navigator.userAgent.match(/iP/i), 
	supportsTouchEvents = 
		('ontouchstart' in document.documentElement) || ( /Android|webOS|iPhone|iPad|iPod|BlackBerry|Windows Phone|ZuneWP7/i.test(navigator.userAgent) );

/* */

(function(nmspc) {

	var alertFallback = false;
	if ( typeof console === "undefined" || typeof console.log === "undefined") {
		alert('oh no');
		console = {};
		if (alertFallback) {
			console.log = function(msg) {
				alert(msg);
			};
		} else {
			console.log = function() {
			};
		}
	}

	/* */

	nmspc.DEVICE_TYPES = {
		iPad : 'iPad',
		iPhone: 'iPhone',
		android : 'android',
		desktop : 'desktop',
		wPhone : 'wPhone'
	}
	
	nmspc.BROWSERS = {
		safari: 'Safari',
		chrome: 'Chrome'
	}
	
	nmspc.OS_TYPES = {
		mac: 'Mac OS',
		win: 'Windows'
	}

	nmspc.deviceDescription = {
		type : undefined,
		browser : undefined,
		touchCapable : false
	}
	
	nmspc.deviceDescription.type = nmspc.DEVICE_TYPES.desktop;

	if (navigator.userAgent.indexOf('iPad') > -1) {
		nmspc.deviceDescription.type = nmspc.DEVICE_TYPES.iPad;
	} else if (navigator.userAgent.indexOf('iPhone') > -1) {
		nmspc.deviceDescription.type = nmspc.DEVICE_TYPES.iPhone;
	} else if (navigator.userAgent.indexOf('Android') > -1) {
		nmspc.deviceDescription.type = nmspc.DEVICE_TYPES.android;
	} else if (navigator.userAgent.indexOf('Windows Phone') > -1) {
		nmspc.deviceDescription.type = nmspc.DEVICE_TYPES.wPhone;
	}

	if (navigator.userAgent.indexOf('Chrome') > -1 ){
		nmspc.deviceDescription.browser = nmspc.BROWSERS.chrome;
	} else if (navigator.userAgent.indexOf('Safari') > -1) {
		nmspc.deviceDescription.browser = nmspc.BROWSERS.safari;
	}
	
	nmspc.deviceDescription.os = undefined;
	
	if (navigator.userAgent.indexOf('Mac OS') > -1 ){
		nmspc.deviceDescription.os = nmspc.OS_TYPES.mac;
	} else if (navigator.userAgent.indexOf('Windows') > -1 ){
		nmspc.deviceDescription.os = nmspc.OS_TYPES.win;
	}
	
	if (( typeof Touch == "object") || ('ontouchstart' in document.documentElement)) {
		nmspc.deviceDescription.touchCapable = true;
	}

	/* */

	nmspc.debu = window.location.href.indexOf('?debug') > -1;
	var $debWindow;

	nmspc.debLog = function(str) {
		if (!$debWindow)
			return;
		$debWindow.prepend($('<p>' + str + '</p>'));
	}

	$(function() {

		if (nmspc.debu) {

			$debWindow = $('<div></div>').css({
				position : 'fixed',
				top : 0,
				right : 0,
				display : 'inline-block',
				width : 300,
				'min-height' : 100,
				font : '12px sans-serif',
				color : 'rgba(255,255,255,.8)',
				'background-color' : 'rgba(0,0,0,.5)',
				'z-index' : 999,
				'max-height' : '50%',
				'overflow-y' : 'scroll'
			});
			$('body').append($debWindow);

		}

		nmspc.debLog(nmspc.deviceDescription.type);
		nmspc.debLog('Standard-touch-capable: ' + nmspc.deviceDescription.touchCapable);

	})

})(utilLib);


(function(arg){
	
	if(!window.Modernizr) return;
	
	if(window.Modernizr.csstransforms3d){
		paraSample.bestTranslateType = 'translate3d';
	} else if(window.Modernizr.csstransforms){
		paraSample.bestTranslateType = 'translate';
	} else {
		paraSample.bestTranslateType = 'left';
	}
	
	// translate3d, left, translate
	
	var translateType,
		transformString;
	
	arg.applyHorizontalShift = function(value, $div, translateType){
		
		
		translateType = translateType || paraSample.bestTranslateType;
		
		if (value=='' || translateType != 'left') {

			if (value==''){
				transformString = '';
			} else if (translateType === 'translate3d') {
				transformString = 'translate3d(' + value + 'px, 0px, 0px)';
			} else if (translateType === 'translate') {
				transformString = 'translate(' + value + 'px, 0px)';
			} else if (translateType === 'translateX') {
				transformString = 'translateX(' + value + 'px)';
			} else 
				return;

			$div.css({

				WebkitTransform : transformString,
				MozTransform : transformString,
				Transform : transformString,
				msTransform : transformString,
				OTransform : transformString,
				transform : transformString

			});

		}
		
		if (value=='' || translateType == 'left') {

			$div.css('left', value);

		}
		
	}
	
})(paraSample);


/* */

paraSample.preloaderEnabled = true;

paraSample.settings = {
	
	removeScrollbar: 
		utilLib.deviceDescription.type != utilLib.DEVICE_TYPES.wPhone,
	
	disableAutoHashChange: utilLib.deviceDescription.type == utilLib.DEVICE_TYPES.android, 
		
	touchNotScrollMode: 
		(utilLib.deviceDescription.type != utilLib.DEVICE_TYPES.desktop) 
		&& utilLib.deviceDescription.touchCapable,

	mousewheelSlowness: {
		windows: 15,
		mac: 60
	},
	
	pauseSideAnimationsWhenMoving: true
	
}

function parallax(param) {

	/* Настройки */

	var parallaxID = "parallax", 
		overflowsParentClass = "overflowsSlide", 
		wrapsWindowWidthClass = 'wrapsWindowWidth', 
		paralaxBackgroundClass = 'parallaxBackground',

	/* Отключает скроллбар вовсе */
	scrollbarFullyRemoved = param.removeScrollbar;

	/*
	 * Можно задать тип анимации параллакса и слоев
	 * и анимируемое свойство.
	 *
	 * Далее следует оценка
	 * совместимости настроек
	 * в виде таблицы.
	 *
	 * Без анимации виртуального скролла:
	 *
	 *              X     JQuery     CSS3
	 * left      |	o  |    o    |    o    |
	 * translate |	o  |    ?    |    o    |
	 *
	 * С анимированным виртуальным скроллом:
	 *
	 *              X     JQuery     CSS3
	 * left      |	o  |    x    |    x    |
	 * translate |	o  |    x    |    x    |
	 *
	 *
	 *  */


	var animationTypes = {
		NONE : 0,
		JQ_EASED : 1,
		CSS3_EASED : 2,
		SUPER_EASED : 3,
		EASED : 4
	}, shiftPropertyTypes = {
		LEFT : 'left',
		TRANSLATEX : 'translateX',
		TRANSLATE : 'translate',
		TRANSLATE3D : 'translate3d'
	};

	var layerAnimationType = animationTypes.NONE, 
		scrollValueAnimationType = animationTypes.EASED, 
		parallaxLeftAnimationType = animationTypes.NONE;

	var layerShiftProperty = param.layerShiftProperty || 'left', 
		parallaxShiftProperty = param.parallaxShiftProperty ||  'left';

	//http://easings.net/ru
	var scrollEasing = 'easeOutExpo', scrollAnimationDuration = 1500;

	/* Конец настроек, начало рабочего кода */

	var para_cached = this;
	
	var windowWidth;

	var slides = {
		$src : undefined,
		array : [],
		singleSlideWidth : 0
	};

	
	var scroll = {
		add : function() {
		},
		get : function() {
		},
		delta : 0,
		cur : 0,
		previous : 0,
		maxLimit : 0,
		firstStep : 0,
		$src : undefined,
		startWindowWidth : 0,
		resizeModifier : 1,
		minimalStep : 0
	};
	
	para_cached.scroll = scroll;

	this.currentSlideI = 0;

	this.mouseWheelTarget = $('body');

	this.findLayerWrapper = function(src) {

		for (var i = 0, s = slides.array[0]; i < slides.array.length; i++, s = slides.array[i]) {

			for (var j = 0, l = s.layers[0]; j < s.layers.length; j++, l = s.layers[j]) {

				if (src == l.$src[0]) {
					return l;
				}

			}

		}
	}
	
	var slideChangeModel = 'onBorder';
	
	function layer($src, prnt) {

		//$src.parent().css('display','');

		var hasParalaxBackgroundClass = $src.hasClass(paralaxBackgroundClass);

		this.$src = $src;
		this.prnt = prnt;
		this.spd = +$src.attr('alt');

		if (hasParalaxBackgroundClass) {
			$src.css('min-height', '100%');
		}

		var slowness = 1 - this.spd, extraSpeed = this.spd - 1;

		var halfWindowWidth, halfParentWidth, preCalculatedPosition, halfWidth;

		var hasOverflowMarker = $src.hasClass(overflowsParentClass), isSmallAndSlow;

		var relLeftBorder = 0, relRightBorder;

		if (layerAnimationType == animationTypes.CSS3_EASED) {
			CSS3setupAdjust(layerShiftProperty, this.$src);
		}

		this.applyWindowSize = function() {

			if (!hasParalaxBackgroundClass) {
				$src.attr('style', '');
			} else {

				paraSample.applyHorizontalShift('', $src);
				$src.css({
					width : ''
				});
				// Opera:
				// переключение позиционирования
				// слоя с относительного на абсолютное
				// рушит верстку.
				var usingOpera = navigator.userAgent.indexOf('Opera') > -1;
				if (!usingOpera) {
					$src.css({
						position : ''
					});
				}
			}

			halfWindowWidth = windowWidth / 2;
			halfParentWidth = this.prnt.width / 2;

			/*var isTestSlide = false&&$src.parent().is('#intro');*/
			
			if (hasParalaxBackgroundClass) {

				this.width = $src.width();
				var minWidth = this.spd * (this.prnt.prnt.width - windowWidth) + windowWidth;

				if (this.width < minWidth) {
					this.width = minWidth;
					$src.width(this.width);
				}

			} else {
				
				// Баг в (sic!) Хроме.
				// Элемент <img alt="5.5" class='test-subject' src="/static/img/mainPage/intro/4.png" />
				// Имеет правила, меняющие его высоту.
				// В этот момент программы Хром меняет высоту в соответствии с правилом,
				// но оставляет ширину неизменной.
				// Попробуем вылечить небольшим встряхиванием состояния элемента.
				$src.css('position','absolute');
				/*(if(isTestSlide){
					console.log($src,$src.width());
				}*/
				this.width = $src.width();
				$src.css('position','');
				/*if(isTestSlide){
					console.log($src,$src.width());
				}*/
			}

			halfWidth = this.width / 2;
			relRightBorder = prnt.width - this.width;

			isSmallAndSlow = this.spd <= 1 && this.width < this.prnt.width;
			this.overflowsParent = hasOverflowMarker || hasParalaxBackgroundClass || !isSmallAndSlow;

			this.$src.css('left', '');

			// Moz:
			// Если позиционирование слоя на этот момент абсолютное,
			// то даже с учетом ресета css('left', '')
			// .css('left') будет выдавать числовое значение,
			// не содержащееся ни в одном из каскадных стилей.
			var cssLeft = $src.css('left');

			/*
			 * В Опере нельзя переключать позиционирование фонового слоя,
			 * но можно определить, что css-left = auto, при абсолютном.
			 * В FF можно переключать позиционирование этого слоя,
			 * но нельзя определить, что css-left = auto, при абсолютном.
			 * Решение: для Оперы всегда сохранять абсолютное позиционирование,
			 * для остальных браузеров -- отключать во время определения css-left = auto.
			 */
			$src.css({
				display : 'inline-block',
				overflow : 'visible',
				position : 'absolute'
			});

			// Moz:
			// Элементы с позиционированием не-static
			// выдают численное значение даже при отсутствии left в стиле.
			if (cssLeft == 'auto') {
				this.left = halfParentWidth - halfWidth;
			} else {
				this.left = parseInt(cssLeft, 10);
			}

			if (layerShiftProperty !== shiftPropertyTypes.LEFT) {
				this.$src.css('left', '0px');
			};

			if (this.spd == 0) {
				preCalculatedPosition = halfWindowWidth - halfWidth;
			} else if (this.spd > 0 && this.spd < 1) {
				preCalculatedPosition = (halfWindowWidth - halfWidth) * (1 - this.spd) + this.left * this.spd;
			} else {
				preCalculatedPosition = this.left;
			}

		}
		/*
		 Формулы подсчета в сыром виде:

		 spd = 0
		 halfWindowWidth-halfWidth+inScroll
		 spd: (0,1)
		 (halfWindowWidth-halfWidth+inScroll)*(1-this.spd)+this.left*this.spd
		 spd > 1
		 this.left-inScroll*(this.spd-1)
		 */

		this.parallaxLeft = function(inScroll) {

			if (this.spd == 0) {
				this.currentLeft = preCalculatedPosition + inScroll;
			} else if (this.spd > 0 && this.spd < 1) {
				this.currentLeft = preCalculatedPosition + inScroll * slowness;
			} else {
				this.currentLeft = preCalculatedPosition - inScroll * extraSpeed;
			}
			return this.currentLeft
		}

		this.adjust = function(inScroll) {

			var left = this.parallaxLeft(inScroll);

			/*
			 Слоям на переднем плане (очень быстрым)
			 позволяем выходить за границу слайда
			 */

			if (!this.overflowsParent) {

				var leftBorder = relLeftBorder, rightBorder = relRightBorder;

				if (left < leftBorder) {
					left = leftBorder;
				} else if (left > rightBorder) {
					left = rightBorder;
				}

			}

			if (layerAnimationType == animationTypes.CSS3_EASED || layerAnimationType == animationTypes.NONE) {

				paraSample.applyHorizontalShift(left, this.$src, layerShiftProperty);
			} else if (layerAnimationType == animationTypes.JQ_EASED) {
				jqueryAnimateShift(this.$src, left);
			}

		}

		return this;
	}

	function slide($src, masterSlide, prnt) {

		this.masterSlide = masterSlide;
		this.layers = [];
		this.$src = $src;
		this.initialLeft = 0;
		this.left = 0;
		this.width = 0;
		this.$axis = {};
		this.prnt = prnt;
		var children = this.$src.children();

		var windowWidth_cache;

		this.childrenVisible = true;

		this.adjust = function() {

			this.left = this.initialLeft - this.prnt.$src.scroll;

			var right = this.left + this.width;

			var toTheLeftOfScreen = this.left < 0 && right < 0, toTheRightOfScreen = this.left > windowWidth_cache && right > windowWidth_cache;

			if ((toTheLeftOfScreen || toTheRightOfScreen)
				&& !param.noSlideHideOptimization) {
				if (this.childrenVisible) {
					children.hide();
					this.childrenVisible = false;
				}
			} else {
				if (!this.childrenVisible) {

					children.show();
					this.childrenVisible = true;
				}

				/* Переход к дочерним слоям */

				var scrollPosition = -this.left;

				for (var i = 0, l = this.layers[0], len = this.layers.length; i < len; i++, l = this.layers[i]) {
					l.adjust(scrollPosition);
				}
			}

		}
		var slide = this;

		this.applyWindowSize = function() {

			windowWidth_cache = windowWidth;
			this.$src.css('display', '');
			if (masterSlide) {
				this.width = this.prnt.width;
				this.initialLeft = 0;

			} else {
				this.width = windowWidth;
				this.initialLeft = this.prnt.width;
				this.$src.css('width', this.width);

			}

		}
		this.applyWindowSize();

		this.applyWindowSizeToChildren = function() {

			children.show();

			for (var i = 0, j = slide.layers.length; i < j; i++) {
				slide.layers[i].applyWindowSize();
			};
		}

		this.initChildren = function() {

			var layerChildren;

			if (masterSlide) {
				layerChildren = this.$src.children('[alt]');
			} else {
				layerChildren = $('*[alt]', this.$src);
			}

			children.show();

			layerChildren.each(function() {

				var $layer = $(this)

				if ($layer.attr('alt') == '1') {
					$layer.css({
						position : 'absolute'
					});
					slide.$axis = $layer;

				} else {
					var wrapped = new layer($layer, slide);
					slide.layers.push(wrapped);
				}
			});
		}
		this.initChildren();

		return this;

	}


	this.init = init;
	function init() {

		slides.$src = $('#' + parallaxID);
		slides.$src.scroll = 0;

		if (scrollbarFullyRemoved) {
			$('html').css('overflow', 'hidden');
		} else {
			$('html').css({
				'overflow-x' : 'scroll',
				'overflow-y' : 'hidden'
			});
		}

		slides.$src.children('div').css({
			height : '100%',
			position : 'relative',
			float : 'left',
			overflow : 'hidden'
		});

		slides.$src.css({
			width : '100%',
			height : '100%',
			'overflow-x' : 'visible',
			position : 'fixed'
		});

		if (parallaxLeftAnimationType === animationTypes.CSS3_EASED) {
			CSS3setupAdjust(parallaxShiftProperty, slides.$src);
		}

		initSlides();

		applyWindowSize();
		
		applyWindowSizeToParallaxLayers();

		refreshSlides();
		
		//$('body').bind('mousewheel', onMouseWheel);

		$('.' + paralaxBackgroundClass).css('z-index', 'auto');

		slides.$src.trigger('init');

	}

	function initSlides() {

		/* Обычные слайды */

		slides.array = [];

		slides.$src.find('> div').each(function() {
			var $slide = $(this);
			if ($slide.attr('alt'))
				return;
			var p = new slide($slide, false, slides);

			slides.array.push(p);
		});

		para_cached.slidesCount = slides.array.length;

		/* Сам параллакс выступает в качестве слайда
		 * по отношению к фону параллакса */

		var p = new slide(slides.$src, true, slides);
		slides.array.push(p);

	}

	function applyWindowSize() {

		windowWidth = $(window).innerWidth();

		slides.singleSlideWidth = windowWidth;

		scroll.minimalStep = windowWidth / 1000 / 15;

		slides.width = 0;

		for (var i = 0, l = slides.array.length; i < l; i++) {
			var s = slides.array[i]
			s.applyWindowSize();
			if (!s.masterSlide) {
				slides.width += s.width;
			}
		}

		slides.$src.width(slides.width);
		scroll.maxLimit = slides.width - windowWidth;

		initScrollbar();

	}

	function applyWindowSizeToParallaxLayers() {
		for (var i = 0, s = slides.array[i]; i < slides.array.length; i++, s = slides.array[i]) {

			s.applyWindowSizeToChildren();
		}


		slides.$src.trigger('engineRebuild', slides.$src.scroll)
		//customEventEngine.call(para_cached, 'engineRebuild', slides.$src.scroll);
	}

	var intervalID, stepToBe;

	// Участник собственноручно сделанного сглаженного скролла
	function stepF() {

		stepToBe = (scroll.cur - slides.$src.scroll) / 15;

		if (Math.abs(stepToBe) > scroll.minimalStep) {
			slides.$src.scroll += stepToBe;

			refreshSlidesAndFireListeners();

		} else if (scroll.doingNextMove) {
			scroll.doingNextMove = false;

		
			slides.$src.trigger('finishedMove', slides.$src.scroll)
			slides.$src.removeClass('disable-hover');

		}

	};

	var straightScrollSwitch = false;

	function straightScroll() {

		slides.$src.scroll = scroll.cur;

		refreshSlidesAndFireListeners();

		straightScrollSwitch = false;
	}

	var lastSlideI = 0, currentSlideI = 0, rawScroll = 0;

	function trackSlideChange() {

		rawScroll = scroll.cur / slides.singleSlideWidth;

		if(slideChangeModel == 'onBorder'){
			
			// смена происходит
			// на границе слайдов
			while (rawScroll <= lastSlideI - .5) {
				para.currentSlideI--;
				lastSlideI = para.currentSlideI;
			}
	
			while (rawScroll >= lastSlideI + .5) {
				para.currentSlideI++;
				lastSlideI = para.currentSlideI;
			}
		
		} else {
			
			// смена происходит 
			// в центре соседнего слайда
			while (rawScroll <= lastSlideI - 1) {
				para.currentSlideI--;
				lastSlideI = para.currentSlideI;
			}
	
			while (rawScroll >= lastSlideI + 1) {
				para.currentSlideI++;
				lastSlideI = para.currentSlideI;
			}
		}
	}

	function getScrollPositionAndAnimateEverything() {

		scroll.cur = scroll.get();
		scroll.delta = Math.abs(slides.$src.scroll - scroll.cur);

		scroll.doingNextMove = true;

			slides.$src.trigger('startedMove', slides.$src.scroll)
			slides.$src.addClass('disable-hover');

		if (false)
			alert('getScrollPositionAndAnimateEverything : .cur: ' + scroll.cur + ', $src.scroll: ' + slides.$src.scroll);

		if (straightScrollSwitch) {

			straightScroll();

		} else if (scrollValueAnimationType == animationTypes.EASED) {

			if (!intervalID)
				intervalID = setInterval(stepF, 17);

		} else if (scrollValueAnimationType == animationTypes.SUPER_EASED) {
			if (scroll.delta > 70) {

				scroll.firstStep = true;

				slides.$src.stop(true, true).animate({
					scroll : scroll.cur
				}, {
					step : function(now, fx) {

						/* дикий хак */
						if (scroll.firstStep) {
							fx.start = slides.$src.scroll;
							scroll.firstStep = false;
							return;
						}

						refreshSlidesAndFireListeners();
						slides.$src.scroll = now;

					},
					duration : scrollAnimationDuration,
					easing : scrollEasing
				});

			} else {

				slides.$src.stop(true, true);
				slides.$src.scroll = scroll.cur;
				refreshSlidesAndFireListeners()
			}

		} else if (scrollValueAnimationType == animationTypes.JQ_EASED) {

			slides.$src.stop().animate({
				scroll : scroll.cur
			}, {
				step : function(now, fx) {
					slides.$src.scroll = now;
					refreshSlidesAndFireListeners();

				},
				duration : scrollAnimationDuration,
				easing : scrollEasing
			});

		} else {
			straightScroll();
		}

		trackSlideChange();

	}
	
	function refreshSlidesAndFireListeners(){
		
		refreshSlides();


		slides.$src.trigger('scrollChange', slides.$src.scroll)
		//customEventEngine.call(para_cached, 'scrollChange', slides.$src.scroll);
		
	}

	function refreshSlides() {

		if (parallaxLeftAnimationType == animationTypes.CSS3_EASED || parallaxLeftAnimationType == animationTypes.NONE) {
			paraSample.applyHorizontalShift(-slides.$src.scroll, slides.$src, parallaxShiftProperty);
		} else if (parallaxLeftAnimationType == animationTypes.JQ_EASED) {
			jqueryAnimateShift(slides.$src, -slides.$src.scroll);
		}

		
		for (var i = 0, s = slides.array[0], len = slides.array.length; i < len; i++, s = slides.array[i]) {
			s.adjust();
		}

		

		/*
		 for(var l in scrollListeners){

		 scrollListeners[l](slides.$src.scroll);
		 }*/

	}

	function initScrollbar() {

		var scrollListenerTarget;

		var firstInit = scroll.$src ? false : true;

		if (!firstInit) {
			scroll.$src.remove();
		} else {
			startWindowWidth = windowWidth;
		}

		if (param.touchNotScrollMode) {

			/*
			 $('html').css('overflow','hidden');
			 $('body').css('overflow','hidden');*/

			var dummy = $('<div/>').css({
				position : 'absolute',
				display : 'hidden'
			});

			if (firstInit)
				$('body').append(dummy);

			scroll.$src = $('<div/>').css({
				width : slides.width,
			});

			var touchStart = 0;
			time = {
				start : 0,
				end : 0
			};

			var delta, speed = {
				cur : 0,
				max : 15,
				min : .1
			};

			if (firstInit) {

				slides.$src[0].addEventListener("touchmove", function(e) {


					if (e.touches.length > 1)
						return;

					e.preventDefault();

					time.end = new Date().getTime();

					var deltaTime = time.end - time.start;

					delta = e.touches[0].screenX - touchStart;

					speed.cur = delta * delta / 15 * (delta < 0 ? -1 : 1);

					scroll.add(-speed.cur);

					touchStart = e.touches[0].screenX;

					time.start = time.end;

				});

				slides.$src[0].addEventListener("touchstart", function(e) {

					//e.preventDefault();


				time.start = new Date().getTime();

					touchStart = e.touches[0].screenX;

					scroll.stop();

				});

			}

			var maxScroll = slides.width - windowWidth, minScroll = 0;

			scroll.add = function(delta) {

				if (scroll.cur + delta > maxScroll) {
					scroll.cur = maxScroll
				} else if (scroll.cur + delta < minScroll) {
					scroll.cur = minScroll;
				} else {
					scroll.cur += delta;
				}

				getScrollPositionAndAnimateEverything();
			}

			scroll.stop = function() {
				scroll.cur = slides.$src.scroll;
			}

			scroll.get = function() {
				return scroll.cur;
			}
		} else {

			var scrollTarget;

			if (!scrollbarFullyRemoved) {

				scroll.$src = $('<div/>').css({
					width : slides.width,
					height : '1px'
				});

				$('body').append(scroll.$src);

				scrollTarget = window;
			}

			scroll.get = function() {

				if (scrollbarFullyRemoved) {
					return scroll.cur;
				}

				return $(scrollTarget).scrollLeft();
			}

			scroll.add = function(delta) {

				if (scrollbarFullyRemoved) {

					var newScroll = scroll.cur + delta;

					if (newScroll < 0) {
						newScroll = 0;
					} else if (newScroll > scroll.maxLimit) {
						newScroll = scroll.maxLimit;
					}

					scroll.cur = newScroll;
					getScrollPositionAndAnimateEverything();
					return;
				}
				$(scrollTarget).scrollLeft($(scrollTarget).scrollLeft() + delta);
			}
			if (firstInit && !scrollbarFullyRemoved) {

				$(scrollTarget).on('scroll', getScrollPositionAndAnimateEverything);
			}
		}

		para_cached.add = scroll.add;

		para_cached.width = slides.width;
	}


	this.toSlide = function(index) {
		if (index > -1 && index < slides.array.length) {
			this.to(windowWidth * index);
		}
	}

	this.to = function(value) {
		scroll.add(value - scroll.get());
	}
	function closerGeneric(left) {
		var cur = scroll.get(), roun = left ? Math.floor : Math.ceil, curIndex = cur / slides.singleSlideWidth, dest = roun(cur / slides.singleSlideWidth);

		if (cur % slides.singleSlideWidth == 0) {
			dest += left ? (-1) : 1;
		}
		dest *= slides.singleSlideWidth;
		
		para_cached.to(dest);
	}


	this.closerLeft = function() {
		closerGeneric(true);
	}

	this.closerRight = function() {
		closerGeneric(false);
	}
	function CSS3setupAdjust(shiftProperty, $div) {

		var transiTrailer = scrollAnimationDuration + 'ms ease-in-out 1ms';

		if (shiftProperty == shiftPropertyTypes.LEFT) {

			transi = 'left ' + transiTrailer;

		} else if (shiftProperty == shiftPropertyTypes.TRANSLATE || shiftProperty == shiftPropertyTypes.TRANSLATEX || shiftProperty == shiftPropertyTypes.TRANSLATE3D) {

			transi = '-webkit-transform ' + transiTrailer;

		}

		$div.css({
			WebkitTransition : transi,
			MozTransition : transi,
			OTransition : transi,
			msTransition : transi,
			transition : transi
		});

	}

	function jqueryAnimateShift($div, value) {

		$div.stop(false).animate({
			left : value + 'px',
		}, scrollAnimationDuration, scrollEasing);
	}
	

	/* Обратные связи */

	var absScroll, relativeScroll;

	this.onResizeSlides = function() {

		absScroll = scroll.get();
		relativeScroll = absScroll / windowWidth;

		applyWindowSize();

	}

	this.onResizeLayers = function() {

		applyWindowSizeToParallaxLayers();

		refreshSlidesAndFireListeners();

		var newScroll = relativeScroll * windowWidth;

		straightScrollSwitch = true;

		scroll.add(newScroll - scroll.get());
	}
}

/*
 * Загрузка
 */

var preloader = {
	disable : undefined,
	start : undefined,
	onLoad : function() {
	},
	$slide : undefined,
	visuals : undefined,
	fillVisuals : function() {
	},
	fillingTime : 1400,
	delayBeforeLoadCheck : 0,
	targetLogoWidth : 0
};

var loaderClass = 'loadBackground';

preloader.fillVisuals = function(fillAmount, callback) {

	if (!callback)
		callback = function() {
		};

	$(function() {
		preloader.visuals.loaded/*.stop(false, false)*/.animate({
			'width' : preloader.targetLogoWidth * fillAmount
		}, {
			duration : preloader.fillingTime,
			queue : false
		});
		preloader.visuals.unloaded/*.stop(false, false)*/.animate({
			'width' : (1 - fillAmount) * preloader.targetLogoWidth
		}, {
			duration : preloader.fillingTime,
			queue : false,
			complete : callback
		});
	});

}

preloader.disable = function(param) {

	if (param && param.rough) {

		$('.' + loaderClass).remove();
		preloader.$slide.remove();

	} else {

		$('.' + loaderClass).delay(300).animate({
			'opacity' : 0
		}, preloader.fillingTime, function() {
			$(this).remove();
		});

		preloader.$slide.animate({
			'opacity' : 0,
			/*left: "-"+preloader.$slide.width()+"px"*/
		}, preloader.fillingTime, function() {
			$(this).remove();
		});
	}

	$(document.body).removeClass('unloaded');

}
$(function() {
	return;
	var $media = $('html').find('img,video');

	var lc = 0;
	$media.on('load', function() {
		lc++;
		utilLib.debLog('loadEvent() fired. Total fired: ' + lc + '\n Still need to load ' + ($media.length - lc));
		console.log(this);
	});
	$media.on('error', function() {
		lc++;
		utilLib.debLog('errorEvent() fired.');
		console.log(this);
	});
});

preloader.init = function(){
	preloader.visuals = {
		loaded : $('.preloaderCont .ending'),
		unloaded : $('.preloaderCont .starting')
	};
	preloader.$slide = $('.preloaderCont');
	preloader.targetLogoWidth = .9 * $(window).innerWidth();
}

preloader.start = function() {
	
	preloader.init();
	
	var $media = $('html').find('img,video');

	var mediaCount = $media.length;

	var local_onContentLoad = this.onContentLoad;

	var loaded = 0;

	preloader.visuals.loaded
	.add(preloader.visuals.unloaded)
		.css('opacity', 0);

	var $subCont = $('.preloaderCont .subCont');

	var imageAspect = preloader.visuals.loaded.find('img').width() / preloader.visuals.loaded.find('img').height();

	preloader.visuals.loaded.find('img')
	.add(preloader.visuals.unloaded.find('img'))
	.add(preloader.visuals.unloaded)
		.css('width', preloader.targetLogoWidth);

	$subCont
	.add(preloader.visuals.loaded.find('img'))
	.add(preloader.visuals.unloaded.find('img'))
		.css('height', preloader.targetLogoWidth / imageAspect);

	

	function getFilesToLoadCount() {

		var a = $media.filter(function() {

			// причина: в одном из браузеров не обнаружил complete у svg-изображения
			if (this.src && this.src.indexOf('svg') > -1) {
				return false;
				// видео
				/*READY_STATE http://www.w3schools.com/tags/av_prop_readystate.asp*/
			} else if (this.readyState !== undefined && this.readyState >= 3) {
				return false;
			} else if (this.complete) {
				return false;
			}

			//console.log(this);
			return true;

		});

		return a.length;
	}

	setTimeout(earlyCachedDetection, preloader.delayBeforeLoadCheck);

	function earlyCachedDetection() {

		var alreadyLoaded = getFilesToLoadCount();

		if (alreadyLoaded == 0) {

			utilLib.debLog('No need to load.');

			preloader.onLoad();
			preloader.disable({
				'rough' : true
			});

			return;

		} else {

			preloader.visuals.loaded.add(preloader.visuals.unloaded).animate({
				'opacity' : 1
			}, 300);
			a();
		}
	}

	function a() {

		var notLoaded = getFilesToLoadCount();

		var loadedPart = (mediaCount - notLoaded ) / mediaCount;

		if (notLoaded == 0) {

			utilLib.debLog('Finished loading');

			preloader.fillVisuals(loadedPart, preloader.onLoad);

		} else {

			setTimeout(a, 1000);

			utilLib.debLog('Still need to load ' + notLoaded);

			preloader.fillVisuals(loadedPart);

		}
	}

}


/*

	resizeables.js 
	
 * Пожалуйста, предоставляйте 
 * релевантные глобальные переменные
 * windowWidth, windowHeight, windowAspect
 * перед вызовами resizeables.adjust()
 */

var resizeables = {

	engineCreator: undefined,
	
	engine: undefined,
	
	initFromDescript: function(d){
		resizeables.engine.getContainersFromDescript(d);
	},
	init: function(){
		resizeables.engine.findContainers();
	},
	adjust: function(){
		resizeables.engine.adjust();
	},
	fillModes: {
		FILL_PARENT : 'fillParent',
		FIT_PARENT : 'fitParent',
		FIT_PARENT_WIDTH : 'fitParentWidth',
		NONE: 'none'
	},
	orientations: {
		LANDSCAPE : 'landscape',
		PORTRAIT : 'portrait'
	},
	criticalReadabilityClass: 'criticalReadability',
	
	/* Минимально допускаемый движком 
	 * размер шрифта на .criticalReadability*/
	minimalReadableFontSize: 11
};


	
	/* window.innerWidth и window.innerHeight 
	 * на машине верстальщика при 100% зуме. */
	
resizeables.reference = {w:1280, h:923};

resizeables.engineCreator = function(){
			
	var list = [],
		l,
		obj = resizeables;

	this.findContainers = function(){
		
		for (var fm in obj.fillModes) {
			$('.' + obj.fillModes[fm]).each(function() {
				var a = new aRContainer($(this), obj.fillModes[fm]);
				list.push(a);
			});
		}
		l = list.length;
	}
	
	this.getContainersFromDescript = function(d){
		
		for (var aRCIndex in d) {
			var aRCData = d[aRCIndex];
			aRCData.$src = $(aRCData.srcString);
			var aRC = new aRContainerGeneric(aRCData);
			list.push(aRC);
		}
		l = list.length;
	}
	
	this.adjust = function() {
		for (var i = 0, arc = list[i]; i < l; i++, arc = list[i]) {
			arc.adjust();
		}
	}
	
	function aRContainer($src, fillMode) {
		return new aRContainerGeneric({
			$src : $src,
			fitting : fillMode
		});
	}

	function aRContainerGeneric(src) {

		var $src = src.$src, 
			fitting = src.fitting, 
			multiLayout = src.multiLayout, 
			initialDim, 
			initialDimRelative, 
			aspect, 
			baseFontSize,
			versionB;

		this.recollectMetrics = function() {

			if(fitting!=obj.fillModes.NONE){
				$src.css({
					width : '',
					height : '',
					'font-size' : ''
				});
			}

			initialDim = {
				w : $src.outerWidth(true),
				h : $src.outerHeight(true)
			};
			aspect = initialDim.w / initialDim.h;
			initialDimRelative = {
				w : initialDim.w / resizeables.reference.w,
				h : initialDim.h / resizeables.reference.h
			};
			baseFontSize = parseInt($src.css('font-size'), 10);

		};
		
		versionB = true;//src.versionB;

		if(versionB){
			$src.css('display','inline-block');
		}
		
		this.recollectMetrics();

		criticalElements = $src.find('.' + obj.criticalReadabilityClass);
		this.parent = $src.parent();

		var currentOrientation, lastOrientation = 'none';

		function updateOrientation() {
			currentOrientation = windowAspect > layoutSwitchThreshold ? obj.orientations.LANDSCAPE : obj.orientations.PORTRAIT;
		}

		var layoutSwitchThreshold = 1;
		if (src.layoutSwitchThreshold) {
			layoutSwitchThreshold = src.layoutSwitchThreshold;
		}

		this.adjust = function() {

			if (multiLayout) {

				updateOrientation();

				if (currentOrientation != lastOrientation) {

					$src.addClass(currentOrientation).removeClass(lastOrientation);

					this.recollectMetrics();

					lastOrientation = currentOrientation;
				}

			}

			if(fitting==obj.fillModes.NONE) return;
			
			var anchorDim = 'w', complementDim = 'h';

			if (fitting === obj.fillModes.FILL_PARENT) {
				if (aspect > windowAspect) {
					anchorDim = 'h';
				} 
			} else if (fitting === obj.fillModes.FIT_PARENT) {
				if (aspect < windowAspect) {
					anchorDim = 'h';
				}
			}
			
			if(anchorDim=='h'){
				complementDim = 'w';
			}
			
			var widthToBe, heightToBe, fontSizeToBe;
			
			var dimToBe = {
				h: 0,
				w: 0
			};
			
			var windowDim = {
				h: windowHeight,
				w: windowWidth
			};
			
			var marginNameTranslation = {
				h: 'margin-left',
				w: 'margin-top'
			};

			dimToBe[anchorDim] = 
				windowDim[anchorDim]*
				(fitting === obj.fillModes.FILL_PARENT || versionB ? 
					1 
					: initialDimRelative[anchorDim]
				);
			
			dimToBe[complementDim] = 
				dimToBe[anchorDim];
			
			if(complementDim=='h'){
				dimToBe[complementDim] /= aspect;
			} else {
				dimToBe[complementDim] *= aspect;
			}
			
			
			if(dimToBe[complementDim]>windowDim[complementDim]){
				
				var remargin = 
					-(dimToBe[complementDim] - windowDim[complementDim]) / 2;
				
				var complementMargin = marginNameTranslation[anchorDim],
					anchorMargin = marginNameTranslation[complementDim];
					
				$src.css(anchorMargin,'');
				$src.css(complementMargin,remargin);
			}
			
			fontSizeToBe = dimToBe.h/initialDim.h;
			
			
			

			$src.width(dimToBe.w);
			$src.height(dimToBe.h);
			
			fontSizeToBe *= baseFontSize;
			$src.css('font-size', fontSizeToBe);

			// Здесь следим за тем, чтобы у специально помеченных надписей
			// размер был не меньше порога [ obj.minimalReadableFontSize ]
			for (var i = 0, l = criticalElements.length; 
					 i < l;  
					 i++) {
						
				$ce = $(criticalElements[i]);

				$ce.css('font-size', '');

				var calculatedFontSize = parseInt($ce.css('font-size'), 10);

				if (calculatedFontSize < obj.minimalReadableFontSize) {
					$ce.css('font-size', obj.minimalReadableFontSize + 'px');
				}
			}
		}
	}

	return this;
};

resizeables.engine = new resizeables.engineCreator();




function adjustFontSize() {

	var diminishing = {
		w : window.innerWidth / resizeables.reference.w,
		h : window.innerHeight / resizeables.reference.h
	};

	$('body').css('font-size', baseFontSize * Math.min(diminishing.w, diminishing.h));
}

/* ex-sample.js */



/* * Вспомогательные органы управления
 */

function wheelStep(windowWidth) {
	var deno = paraSample.settings.mousewheelSlowness.windows;
	if(utilLib.deviceDescription.os == utilLib.OS_TYPES.mac){
		deno = paraSample.settings.mousewheelSlowness.mac;
	}  
	return windowWidth / deno;
}

function onMouseWheel(event, delta) {

	para.add(-delta * wheelstep);
	event.preventDefault();
	event.stopPropagation();

};

$(document).keydown(function(e) {

	if (e.keyCode == '37') {
		para.closerLeft();
		e.preventDefault();
	} else if (e.keyCode == '39' || e.keyCode == '32') {
		para.closerRight();
		e.preventDefault();
	}

});

function onResize() {

	para.onResizeSlides();

	// Расщепление onResize параллакса и такая последовательность функций
	// вызваны работой движка автомасштабируемых контейнеров.
	// onResizeLayers зависит от его результатов (утверждение требует проверки),
	// потому onResizeLayers следует после.

	nonParaResize();

	para.onResizeLayers();

}




function nonParaResize() {

	windowWidth = $(window).innerWidth();
	windowHeight = $(window).innerHeight();
	windowAspect = windowWidth / windowHeight;

	wheelstep = wheelStep(windowWidth);

	adjustFontSize();
	resizeables.adjust();

}


var hashProcessingSystem = {

	doNotApplyHashFromAddressLine : false,

	userLock : false,

	lastSlideI : 0,

	applyHashFromAddressLine : function() {

		var addr = self.location.toString(), selectedSlide = addr.slice(addr.indexOf('#') + 1);

		if (selectedSlide == undefined)
			return;

		for (var h in hashProcessingSystem.addrMap) {
			if (selectedSlide == hashProcessingSystem.addrMap[h] && h != hashProcessingSystem.lastSlideI) {
				hashProcessingSystem.userLock = true;
				para.toSlide((+h));
				return;
			}
		}
	},

	trackHashChange : function trackHashChange() {

		if (paraSample.settings.disableAutoHashChange) return;

		// Значение para.currentSlideI соответствует не текущему смещению,
		// а конечному. Значит, после того, как пользователь ввел хэш
		// и начал переход, значение поменяется только один раз.
		if (para.currentSlideI != hashProcessingSystem.lastSlideI) {

			hashProcessingSystem.lastSlideI = para.currentSlideI;

			if (hashProcessingSystem.userLock) {
				hashProcessingSystem.userLock = false;
				return;
			} else {
				hashProcessingSystem.doNotApplyHashFromAddressLine = true;
			}

			var infoString = 'trackHashChange : Changing hash. ';
			if (hashProcessingSystem.doNotApplyHashFromAddressLine) {
				infoString += ' Has doNotApplyHashFromAddressLine.';
			}
			if (hashProcessingSystem.userLock) {
				infoString += ' Has userHashLock.';
			}
			
			window.location.hash = hashProcessingSystem.addrMap[para.currentSlideI];

		}
	}
}

$(window).on('hashchange', function(e) {

	e.preventDefault();

	if (hashProcessingSystem.doNotApplyHashFromAddressLine) {
		//tdLib.debLog('jq.window.onhashchange : doNotApplyHashFromAddressLine, so returning.');
		hashProcessingSystem.doNotApplyHashFromAddressLine = false;
		return;
	}

	hashProcessingSystem.applyHashFromAddressLine();

	return false;

});


// Пользователь запускает эту функцию

function startAllParaSystems() {

	if(Modernizr.history 
		&& window.history.state 
		&& window.history.state.mediaIsLoaded){
			utilLib.debLog('All media is cached. Skipping preloader');
			paraSample.preloaderEnabled = false;
			
	}
	debugging = self.location.toString().indexOf('xe') > -1;
	var parallaxParams = {
		removeScrollbar : paraSample.settings.removeScrollbar,
		touchNotScrollMode : paraSample.settings.touchNotScrollMode
	}
	if (Modernizr.csstransforms3d) {
		parallaxParams.layerShiftProperty = 'translate3d';
		parallaxParams.parallaxShiftProperty = 'translate3d';
	} 
	para = new parallax(parallaxParams);
	baseFontSize = parseInt($('body').css('font-size'));
	hiddenImagesContainer = $('.preloadedImages');

	

	$('#parallax').on('init', function(){

		para.mouseWheelTarget.bind('mousewheel', onMouseWheel);
		$(window).on('resize', onResize);
		hashProcessingSystem.addrMap = 
		$('#parallax>div').map(function(i){return i==0?'':$(this).attr('id')});
		hashProcessingSystem.applyHashFromAddressLine();
		preloader.disable();
		
	});

	$('#parallax').on('scrollChange', function(amount) {

		hashProcessingSystem.trackHashChange();
	});

	function onPreloaderLoad(){
		
		if(Modernizr.history){
			
			$('a').on('click',function (args) {
				
				var href = $(this).attr('href');
				if(href=='' || href =='#') return;
		
				window.history.pushState({
					mediaIsLoaded: 'true'
				}, 'mediaIsLoaded');  
				
			});
			
		};

		resizeables.initFromDescript(aRCDescript);

		nonParaResize();

		if (parallax) {
			para.init();
		}

	}
	
	if(paraSample.preloaderEnabled){
		preloader.onLoad = onPreloaderLoad;	
	} else {
		preloader.init();
		onPreloaderLoad();
	}

	if(paraSample.preloaderEnabled){
		preloader.start();
	}

};