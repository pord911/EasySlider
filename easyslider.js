;(function($) {
	var defaultParams = {
		width: 400,
		height: 200,

		option: 'horizontal',
		cssClass: 'transitionClass2',
		skipClass: 'transitionClass',

		lazyElement: 'img',
		lazyWaitClass: 'lazy-hidden',
		lazyAnimTime: 200,

        skipAnim: 50,
        moveAnim: 500,

        auto: false,
        interval: 3000,

		rightArrowImage: "right_arrow.png",
		leftArrowImage: "left_arrow.png",
		righwArrowClass: "right_control",
		leftArrowClass: "left_control"
	}

	$.fn.easySlider = function( options ) {
		var slider = {}, sliderConfig = {}, arrowConfig = {},
		    sliderObject;
		slider = $.extend( {}, defaultParams, options );
		slider.matrix = initMatrix( this.children().length );
		sliderConfig = {
			option: slider.option,
			width: slider.width,
			height: slider.height,
			skipAnim: slider.skipAnim,
			moveAnim: slider.moveAnim,
			useCssThree: false,
			callbackList: []
		};
		sliderObject = new SliderMain( this, sliderConfig );
		SliderElement.init( this, sliderObject, slider );
		SliderElement.onMouseEnterEvent();
		SliderElement.onMouseLeaveEvent();

		PagerElement.init( this, this.children().length );
		PagerElement.onPagerClick();

		arrowConfig = {
			rightImage: slider.rightArrowImage,
			leftImage: slider.leftArrowImage,
			rightClass: slider.righwArrowClass,
			leftClass: slider.leftArrowClass
		};
		ArrowElement.init( this, arrowConfig );
		ArrowElement.onRightClick();
		ArrowElement.onLeftClick();

		var c = this.children();
		// TODO: this.children().length does not work for some reason
		SCONTROL.init( { length: c.length,
			             autoMode: slider.auto,
		                 renderList: [ SliderElement, PagerElement ],
		                 interval: slider.interval
		               } );
	}
} )( jQuery );