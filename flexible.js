;(function($) {

/*
* Initialize lazy loading of slider object images
* @param sliderObject    jQuery slider object
* @param element         element which loaded in a lazy manner
* @param animateParams   parameters for lazy loading animation
*/
function initLazyLoading(sliderObject, element, animateParams)
{
    var sliderContainer = sliderObject.parent(),
        loadingEvents = "load scroll moveFinished",
    handleLazyLoad = {
        isElementVisible: function(el) {
            /* TODO: check compatibility for this function */
            var rect = el.getBoundingClientRect();

            return(
                rect.top >= 0 &&
                rect.left >= 0 &&
                rect.bottom <= window.innerHeight &&
                rect.right <= window.innerWidth
            );
        },

        lazyLoadElements: function() {
            var el = sliderObject.find(element + '[data-src]'), item, obj = this;

            sliderContainer.addClass(animateParams.lazyWaitClass);
            $(el).each(function() {
                if (obj.isElementVisible(this)) {
                    $(this).on("load", function() {
                        $(this).animate(animateParams.lazyAnimProp, animateParams.lazyAnimTime);
                        sliderContainer.addClass(animateParams.waitClass);
                    });
                    $(this).attr("src", $(this).attr("data-src"));
                    $(this).removeAttr("data-src");
                }
            });
        }
    };

    $(window).on(loadingEvents, (function(obj) {
        return function() {
            obj.lazyLoadElements();
        }
    })(handleLazyLoad));
}


/**
 * Create a permutation matrix.
 * @param length  Length of elements
 */
function initMatrix( length )
{
    var array = new Array( length ), i, temp = [];

    for ( i = 0; i < length; i++ ) {
        array[ i ] = new Array( length );
        temp[ i ] = ( i == length - 1 ) ? -1 : i;
    }

    /*
     * Create permutated matrix. I.e.
     * |  0,  1,  2, -1 |
     * | -1,  0,  1,  2 |
     * |  2, -1,  0,  1 |
     * |  1,  2, -1,  0 |
     */
    array[ 0 ] = temp.slice();
    for ( i = 1; i < length; i++ ) {
        /* Put last element at first place */
        temp.splice( 0, 0, temp.pop() );
        array[ i ] = temp.slice();
    }

    return array;
}

/*
* Create an object which manages index.
* @param length  Length of the element list.
*/
function initIndexObject( length ) 
{
    var offset = 0, 
        index = 0, 
        indexLength = length - 1,

    incrementIndex = function() {
        index++;
        console.log("incrementIndex: Increment:" + index);
        if ( index > indexLength )
            index = 0;
    },

    decrementIndex = function() {
        index--;
        console.log("decrementIndex:" + index);
        if ( index < 0 )
            index = indexLength;
    },

    updateIndex = function( next ) {
        if ( next == "next" )
            incrementIndex();
        else
            decrementIndex();
    },

    getIndex = function() {
        return index;
    },

    getOffset = function( value ) {
        console.log("getOffset: index:" + index + " value:" + value);
        if ( value < 0 || value > indexLength )
            offset = 0;
        else
            offset = Math.abs( index - value );
        return offset;
    };

    return {
        updateIndex: updateIndex,
        getIndex: getIndex,
        getOffset: getOffset
    }
}

/*
*  Initialize procedure from which sliding functions
*  will be called.
*  @param slider    Main object which containes basic configuration.
*/
function initSlideProcedure( slider )
{
    /* TODO: maybe add duck typing for this object */
    var sliderObject = slider.sliderObject,
    /* TODO: add a name instead of this here */
    cssThreeSlideProc = function( slideParams ) {

        sliderObject.unbind( this.transitionEvent );
        sliderObject.bind( this.transitionEvent, { params: slideParams,
                                                   skip: slideParams.skip,
                                                   skipFunction: "slideProcedure",
                                                   context: this }, this.sliderCallback );
        this.moveCssSlide( slideParams );
    },

    /* TODO: maybe add additional properties to slideParams */
    animateSlideProc = function( slideParams ) {
        var params = {
            params: slideParams,
            skip: slideParams.skip,
            skipFunction: "slideProcedure",
            context: this
        };
        this.moveAnimSlide( params );
    },

    slideProcedure = function( slideParams ) {
        console.log("cssThreeSlideProc: offset:" + slideParams.offset);
        if ( slideParams.offset > 1 )
            slideParams.skip = "SKIP";
        else
            slideParams.skip = "NONE";
        if ( slider.useCssThree )
            cssThreeSlideProc.call( this, slideParams );
        else
            animateSlideProc.call( this, slideParams );
    };

    return {
        slideProcedure: slideProcedure
    };
}

/*
* Create an object containing sliding methods.
* @param  slider       Main object which containes basic configuration.
* @param  callbacks    Callbacks which should be called after sliding finishes.
*/
function SliderMain( slider )
{
    this.slider = slider;
    this.sliderObject = slider.sliderObject;
    this.indexObject = slider.indexObject;
    this.transitionEvent = slider.transEvent;
}

/* This method should be called if CSS3 is not supported */
SliderMain.prototype.moveAnimSlide = function( params ) {
    var slider = this.slider, sliderObject = this.sliderObject,
        moveObject = params.params.next == "next" ? slider.moveNext : slider.movePrev,
        skipObject = params.skip === "SKIP" ? slider.skipAnim : slider.moveAnim;

    this.updateIndexParams( params );
    sliderObject.animate( moveObject, moveObject, ( function(params, context) {
        return function() {
            context.sliderCallback( params );
        }
    })( params, this ));
}

SliderMain.prototype.moveCssSlide = function( params ) {
    var slider = this.slider, sliderObject = this.sliderObject,
        moveValue = params.next == "next" ? slider.moveNext : slider.movePrev,
        moveClass = params.skip == "SKIP" ? slider.skipClass : slider.cssClass;

    this.updateIndexParams( params );
    /* Problem: After adding css class, the change
     *          in CSS property (e.g. translateX) would
     *          not triger the animation.
     * Fix: Add a delay in order for addition of css
     *      class to take effect
     */
    setTimeout( function() {
        sliderObject.addClass( moveClass );
        setTimeout( function() {
            slider.moveConfig[ slider.moveConfigProp ] = moveValue;
            sliderObject.css( slider.moveConfig );
        }, 10);
    }, 10);
}

SliderMain.prototype.sliderCallback = function( event ) {
    var params = event.data || event, context = params.context,
        slider = context.slider, fn = slider.sliderProcObj[ params.skipFunction ],
        callbacks = params.params.callbacks;

        context.removeSliderClass( params );
        context.setCssToDefault();
        context.reallocateSliderList();

        if ( params.skip == "SKIP" )
            fn.call( params.context, params.params );
        else {
            callbacks.forEach( function( element, index ) {
                /* TODO: popraviti da prepoznaje od kud dolazi callback, da li slider ili freelance */
                if ( element == "autoSlider" && !slider.interval ) {
                    console.log("sliderCallback: Calling autocallback");
                    var auto = slider[ element ];
                    auto();
                } else {
                    /* TODO: staviti druge callback-ove */
                    console.log("sliderCallback: Calling callbacks!");
                }
            });
            slider.sliderState.setSliderState( "SLIDER_FREE" );
        }
}

SliderMain.prototype.removeSliderClass = function( params ) {
    var slider = this.slider, sliderObject = this.sliderObject,
        moveClass = params.skip == "SKIP" ? slider.skipClass : slider.cssClass;
    sliderObject.removeClass( moveClass );
}

SliderMain.prototype.setCssToDefault = function() {
    var slider = this.slider, sliderObject = this.sliderObject;

    slider.moveConfig[ slider.moveConfigProp ] = slider.moveConfigDefVal;
    sliderObject.css( slider.moveConfig );
}

SliderMain.prototype.reallocateSliderList = function() {
    var slider = this.slider, sliderObject = this.sliderObject,
        indexObject = this.indexObject, array, value, listElement;

    array = slider.matrix[ indexObject.getIndex() ];
    sliderObject.children().each( function( index ) {
        listElement = $( this );
        value = array[ index ] * slider.listIteratorValue;
        slider.listIterator[ slider.listIteratorProp ] = value + 'px';
        listElement.css( slider.listIterator );
    });
}

SliderMain.prototype.updateIndexParams = function( params ) {
    var slider = this.slider;

    params.offset--;
    slider.indexObject.updateIndex( params.next );
}

function FadeSlider( slider ) {
    SliderMain.call( this, slider );

    this.moveCssSlide = function() {

    }
}

FadeSlider.prototype = Object.create( SliderMain.prototype );
FadeSlider.prototype.constructor = FadeSlider;

/*
* Set slider css values and create it
* @param slider    Main object which containes basic configuration.
*/
function createSliderElement( slider )
{
    var sliderObj = slider.sliderObject,
        objChildren = sliderObj.children(),
        permuteObj = {}, value;
    sliderObj.css( slider.cssConfig.sliderListCss );
    objChildren.css( slider.cssConfig.sliderListElementCss );
    objChildren.each( function( index ) {
        permuteObj[ slider.listIteratorProp ] = slider.matrix[ 0 ][ index ] * slider.listIteratorValue + 'px';
        $( this ).css( permuteObj );
    });
}

/*
* Initialize slider frame css configuration.
* @param  width     Width of slider container.
* @param  height    Height of slider container.
*/
function createSliderCss( width, height )
{
    var listCss = {
        display: 'block',
        position: 'relative',
        width: width + 'px',
        height: height + 'px',
        "list-style": 'none'
    },

    listElementCss = {
        width: width + 'px',
        height: height + 'px',
        position: 'absolute'
    }

    return {
        sliderListCss: listCss,
        sliderListElementCss: listElementCss
    }
}

/*
* Create pager control and API.
* @param  slider    Main object which containes basic configuration.
*/
function createPager( slider, callbacks )
{
    var sliderContainer = slider.sliderObject.parent(),
        pager =  $( '<div class="pager_box"></div>' ), htmlPager = '',
        i, wraper, pagerLinks;

    sliderContainer.wrap( '<div class="wraper"></div>' );
    wraper = sliderContainer.parent();
    wraper.append( pager );

    for ( i = 0; i < slider.sliderObject.children().length; i++ ) {
        htmlPager += '<div class="pager_item"><a href="#" slide_index="'+ i +'"></a></div>'
    }

    pager.append( htmlPager );
    var slide_index = pager.find( 'a' ).first();
    slide_index.addClass( 'active' );
    pagerLinks = pager.find( 'a' );

    /* Pager API functions for controling the pager CSS */
    var updatePager = function( index ) {
        var index = ( typeof index != 'undefined' ) ? index:slider.indexObject.getIndex();

        console.log("updatePager: index=" + index);
        pagerLinks.removeClass( 'active' );
        pagerLinks.each( function() {
            if ( parseInt($( this ).attr( 'slide_index' ) ) == index )
                $( this ).addClass( 'active' );
        });
    },

    handlePagerClick = function( event ) {
        var triggeredElement = $( event.target ),
            clickIndex = parseInt( triggeredElement.attr( "slide_index" ) ),
            currentIndex = slider.indexObject.getIndex(), next;

        if ( clickIndex == currentIndex )
            return;
        else if ( clickIndex > currentIndex )
            next = "next";
        else
            next = "prev";
        console.log("handlePagerClick: clickIndex=" + clickIndex);
        if ( slider.sliderState.checkSliderState( "SLIDER_FREE" ) ) {
            updatePager( clickIndex );
            slider.callMoveFunction( next, clickIndex, callbacks );
        }
    };
    pager.find( 'a' ).on( 'click', handlePagerClick );

    return {
        updatePager: updatePager
    }
}

/*
* Create arrows control and API.
* @param  slider    Main object which containes basic configuration.
*/
function createArrowControl( slider, callbacks )
{
    var sliderContainer = slider.sliderObject.parent(),
        next = $( '<img src=\"right_arrow.png\" class="right_control"/>' ),
        prev = $( '<img src=\"left_arrow.png\" class="left_control"/>' );
    sliderContainer.prepend( next );
    sliderContainer.prepend( prev );

    /* Arrow API functions for controling the arrow CSS */
    var hanldeClickNext = function() {
        /* Q&A: Which object actualy holds slider state? */
        if (slider.sliderState.checkSliderState( "SLIDER_FREE" )) {
            slider.callMoveFunction( "next", -1, callbacks );
            slider.pager.updatePager();
        }
    },

    handleClickPrev = function() {
        if (slider.sliderState.checkSliderState( "SLIDER_FREE" )) {
            slider.callMoveFunction( "prev", -1, callbacks );
            slider.pager.updatePager();
        }
    };

    next.on( "click", hanldeClickNext );
    prev.on( "click", handleClickPrev );
}

/*
* Initialize slider state object
* STATE_FREE: no function/CSS is doing operations on the slider
* STATE_BUSY: function/CSS is doing operations on the slider
*/
function initSliderState()
{
    var busy = "SLIDER_FREE",

    setSliderState = function( param ) {
        busy = param;
    },

    checkSliderState = function( state ) {
        return busy == state;
    };

    return {
        setSliderState: setSliderState,
        checkSliderState: checkSliderState
    }
}

/*
* Create moving rules and configuration for vertical slider.
* @param  slider    Main object which containes basic configuration.
*/
function createVertical( slider )
{
    slider.listIteratorValue = slider.height;
    slider.listIteratorProp = 'top';
    slider.moveProperty = slider.useCssThree ? slider.cssPrefix + '-transform':'top';
    slider.defaultValue = slider.useCssThree ? 'translateY(0px)':'0px';
    slider.moveNext = slider.useCssThree ? 'translateY(-' + slider.height + 'px)':{top:'-' + slider.height + 'px'};
    slider.movePrev = slider.useCssThree ? 'translateY(' + slider.height + 'px)':{top:slider.height + 'px'};
}

/*
* Create moving rules and configuration for horizontal slider
* @param  slider    Main object which containes basic configuration.
*/
function createHorizontal( slider )
{
    slider.listIteratorValue = slider.width;
    slider.listIteratorProp = 'left';
    slider.moveConfigProp = slider.useCssThree ? slider.cssPrefix + '-transform':'left';
    slider.moveConfigDefVal = slider.useCssThree ? 'translateX(0px)':'0px';
    slider.moveNext = slider.useCssThree ? 'translateX(-' + slider.width + 'px)':{left: '-' + slider.width + 'px'};
    slider.movePrev = slider.useCssThree ? 'translateX(' + slider.width + 'px)':{left: slider.width + 'px'};
}

/*
* Create the corresponding slider based on the option value
* @param  slider    Main object which containes basic configuration.
*/
function createSlider( slider )
{
    if ( slider.option == "vertical" )
        createVertical(slider);
    else
        createHorizontal(slider);
}

var defaultParams = {
    width: 400,
    height: 200,

    option: 'horizontal',
    cssClass: 'transitionClass2',
    skipClass: 'transitionClass',

    lazyElement: 'img',
    lazyWaitClass: 'lazy-hidden',
    lazyAnimTime: 200
}

$.fn.easySlider = function(options) {
    var slider ={};
    slider = $.extend( {}, defaultParams, options );
    slider.sliderObject = this;
    var lazyParams = {
        lazyAnimProp: {
            opacity: 1
        },
        lazyAnimTime: slider.lazyAnimTime,
        lazyWaitClass: slider.lazyWaitClass
    };

    /* Check if we're on a modern browser or a dinosaur */
    slider.useCssThree = ( function( slider ){
        var div = document.createElement( 'div' ), i, cssPrefix, animProp,
            props = [ 'WebkitPerspective',
                      'MozPerspective',
                      'OPerspective',
                      'msPerspective' ];
        for ( i in props ) {
            if ( div.style[ props[ i ] ] !== undefined ) {
                slider.cssPrefix = '-' + props[i].replace( 'Perspective', '' ).toLowerCase();
                return true;
            }
        }
        return false;
    })( slider );

    console.log("ready: useCssThree=" + slider.useCssThree);

    var defaultCallbacks = [ "autoSlider" ];
    /* Get slider moving configuration */
    slider.listIterator = {};
    slider.moveConfig = {};
    createSlider( slider );
    
     /* Create slider controls */
    slider.pager = createPager( slider, defaultCallbacks );
    slider.arrows = createArrowControl( slider, [] );

    /* Create slider html and css */
    slider.cssConfig = createSliderCss( slider.width, slider.height );
    slider.matrix = initMatrix( slider.sliderObject.children().length );
    createSliderElement( slider );
    slider.transEvent = 'transitionend';

    initLazyLoading( slider.sliderObject, slider.lazyElement, lazyParams );

    /* Initialize basic slider functions and properties */
    slider.sliderProcObj = initSlideProcedure( slider );
    slider.sliderState = initSliderState();
    slider.indexObject = initIndexObject( slider.sliderObject.children().length );
    var moveFunctionConfig = new SliderMain( slider );

    slider.autoSlider = function() {
        var moveConfig = {
            next: "next",
            callbacks: [],
            offset: null
        }
        slider.interval = setInterval( function() {
            /* Maybe add setting of state to move functions */
            slider.sliderState.setSliderState( "SLIDER_BUSY" );
            slider.sliderProcObj.slideProcedure.call( moveFunctionConfig, moveConfig );
        }, 5000 );
        slider.pagerInterval = setInterval( function() {
            slider.pager.updatePager();
        }, 5000 );
    }

    slider.callMoveFunction = function( next, index, callbacks ) {
        var moveParams = {}, offset;

        moveParams.next = next;
        moveParams.callbacks = callbacks;
        slider.sliderState.setSliderState( "SLIDER_BUSY" );
        clearInterval( slider.interval );
        clearInterval( slider.pagerInterval );
        slider.interval = 0;

        offset = slider.indexObject.getOffset( index );
        if ( offset > 1 )
            moveParams.offset = offset;
        slider.sliderProcObj.slideProcedure.call( moveFunctionConfig, moveParams );
    }

    slider.sliderObject.parent().on( "mouseenter", function() {
        console.log( "mouseenter" );
        clearInterval( slider.interval );
        clearInterval( slider.pagerInterval );
        slider.interval = 0;
    } );
    slider.sliderObject.parent().on( "mouseleave", function() {
        console.log("mouseleave");
        slider.autoSlider();
    } );

    slider.autoSlider();
}
} )( jQuery );

