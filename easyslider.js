;(function($) {
	var defaultParams = {

		option: 'horizontal',
		cssClass: 'transitionClass2',
		skipClass: 'transitionClass',

		lazyElement: 'img',
		lazyWaitClass: 'lazy-hidden',
		lazyAnimTime: 200,

		sliderElementContainer: 'container',

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
		var slider = {};
		slider = $.extend( {}, defaultParams, options );
		slider.matrix = initMatrix( this.children().length );
		slider.widthStr = this.css("width");
		slider.heightStr = this.css("height");
		slider.width = this.width();
		slider.height = this.height();
		slider.measure = slider.widthStr.match( /[^[0-9]+/i );
		slider.useCssThree = false;
		slider.callbackList = [];

		SliderElement.init( this, new SliderMain( this, slider ), slider );
		SliderElement.onMouseEnterEvent();
		SliderElement.onMouseLeaveEvent();

		PagerElement.init( this, this.children().length );
		PagerElement.onPagerClick();

		ArrowElement.init( this, slider );
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