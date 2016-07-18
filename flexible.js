;(function($) {
/*
* Create permutation matrix
* length:    length of the element list
*/
function initMatrix(length)
{
    var array = new Array(length), i,
        temp = [], result;

    for (i = 0; i < length; i++) {
        array[i] = new Array(length);
        temp[i] = (i == length - 1) ? -1 : i;
    }

    array[0] = temp.slice();
    for (i = 1; i < length; i++) {
        result = temp.pop();
        temp.splice(0, 0, result);
        array[i] = temp.slice();
    }

    return array;
}

/*
* Create an object which manages index
* length:    length of the element list
*/
function initIndexObject(length) 
{
    var offset = 0, 
        index = 0, 
        indexLength = length - 1,

    incrementIndex = function() {
        index++;
        console.log("incrementIndex: Increment:" + index);
        if (index > indexLength)
            index = 0;
    },

    decrementIndex = function() {
        index--;
        console.log("decrementIndex:" + index);
        if (index < 0)
            index = indexLength;
    },

    updateIndex = function(next) {
        if (next == "next")
            incrementIndex();
        else
            decrementIndex();
    },

    /* TODO: probably should be removed */
    setIndex = function(value) {
        index = value;
    },

    getIndex = function() {
        return index;
    },

    getOffset = function(value) {
        console.log("getOffset: index:" + index + " value:" + value);
        offset = Math.abs(index - value);
        return offset;
    };

    return {
        updateIndex: updateIndex,
        setIndex: setIndex,
        getIndex: getIndex,
        getOffset: getOffset
    }
}

/*
*  Initialize procedure from which sliding functions
*  will be called
*  slider:    main object which containes basic configuration
*/
function initSlideProcedure(slider)
{
    /* TODO: maybe add duck typing for this object */
    var sliderObject = slider.sliderObject,
    /* TODO: add a name instead of this here */
    cssThreeSlideProc = function(slideParams) {

        sliderObject.unbind(this.transitionEvent);
        sliderObject.bind(this.transitionEvent, {params: slideParams,
                                                 skip: slideParams.skip,
                                                 skipFunction: "slideProcedure",
                                                 context: this}, this.sliderCallback);
        this.moveSlide(slideParams);
    },
    /* TODO: maybe add additional properties to slideParams */
    animateSlideProc = function(slideParams) {
        var params = {
            params: slideParams,
            skip: slideParams.skip,
            skipFunction: "slideProcedure",
            context: this
        };
        this.moveOldSlide(params);
    },

    slideProcedure = function(slideParams) {
        console.log("cssThreeSlideProc: offset:" + slideParams.offset);
        if (slideParams.offset > 1)
            slideParams.skip = "SKIP";
        else
            slideParams.skip = "NONE";
        if (slider.useCssThree)
            cssThreeSlideProc.call(this, slideParams);
        else
            animateSlideProc.call(this, slideParams);
    };

    return {
        slideProcedure: slideProcedure
    };
}

/*
* Create an object containing sliding methods
* slider:       main object which containes basic configuration
* callbacks:    callbacks which should be called after sliding finishes
*/
function initMoveObject(slider, callbacks)
{
    var sliderObject = slider.sliderObject,

    updateIndexParams = function(params) {
        params.offset--;
        slider.indexObject.updateIndex(params.next);
    },

    /* This method should be called if CSS3 is not supported */
    moveOldSlide = function(params) {
        var moveObject = params.params.next == "next" ? slider.moveNext : slider.movePrev;
        updateIndexParams(params.params);
        sliderObject.animate(moveObject, 1000, (function(params, context) {
            return function() {
                context.sliderCallback(params);
            }
        })(params, this));
    },

    moveSlide = function(params) {
        var moveValue = params.next == "next" ? slider.moveNext : slider.movePrev,
            moveClass;

        moveClass = params.skip == "SKIP" ? slider.skipClass : slider.cssClass;
        console.log("moveSlide: moveClass=" + moveClass);
        updateIndexParams(params);

        /* Problem: After adding css class, the change
         *          in CSS property (e.g. translateX) would
         *          not triger the animation.
         * Fix: Add a delay in order for addition of css 
         *      class to take effect 
         */
        setTimeout(function() {
            sliderObject.addClass(moveClass);
            setTimeout(function() {
                slider.moveConfig[slider.moveConfigProp] = moveValue;
                sliderObject.css(slider.moveConfig);
            }, 10);
        }, 10);
    },

    sliderCallback = function(event) {
        var array, value, listElement,
            params = event.data || event,
            fn = slider.sliderProcObj[params.skipFunction], moveClass;

        console.log("sliderCallback: Calling callback");
        array = slider.matrix[slider.indexObject.getIndex()];

        console.log("sliderCallback: array=" + array);
        console.log("sliderCallback: Index in callback=" + slider.indexObject.getIndex());
        console.log("sliderCallback: skip=" + params.skip);

        moveClass = params.skip == "SKIP" ? slider.skipClass:slider.cssClass;
        sliderObject.removeClass(moveClass);
        slider.moveConfig[slider.moveConfigProp] = slider.moveConfigDefVal;
        sliderObject.css(slider.moveConfig);

        sliderObject.children().each(function(index) {
            listElement = $(this);
            value = array[index] * slider.listIteratorValue;
            slider.listIterator[slider.listIteratorProp] = value + 'px';
            listElement.css(slider.listIterator);
        });

        if (params.skip == "SKIP")
            fn.call(params.context, params.params);
        else {
            callbacks.forEach(function(element, index) {
                slider.sliderState.setSliderState("SLIDER_FREE");
                /* TODO: popraviti da prepoznaje od kud dolazi callback, da li slider ili freelance */
                if (element == "autoSlider" && !slider.interval) {
                    console.log("sliderCallback: Calling autocallback");
                    var auto = slider[element];
                    auto();
                } else {
                    /* TODO: staviti druge callback-ove */
                    console.log("sliderCallback: Calling callbacks!");
                }
            });
        }
    },

    transitionEvent = slider.transEvent;

    return {
        sliderCallback: sliderCallback,
        transitionEvent: transitionEvent,
        moveSlide: moveSlide,
        moveOldSlide: moveOldSlide
    };   
}

/*
* Set slider css values and create it
* slider:    main object which containes basic configuration
*/
function createSliderElement(slider)
{
    var sliderObj = slider.sliderObject,
        objChildren = sliderObj.children(),
        permuteObj = {}, value;
    sliderObj.css(slider.cssConfig.sliderListCss);
    objChildren.css(slider.cssConfig.sliderListElementCss);
    objChildren.each(function(index) {
        permuteObj[slider.listIteratorProp] = slider.matrix[0][index] * slider.listIteratorValue + 'px';
        $(this).css(permuteObj);
    });
}

/*
* Initialize slider frame css configuration
* width:     width of slider container
* height:    height of slider container
*/
function createSliderCss(width, height)
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
* Create pager control and API
* slider:    main object which containes basic configuration
*/
function createPager(slider)
{
    var sliderContainer = slider.sliderObject.parent(),
        pager =  $('<div class="pager_box"></div>'), htmlPager = '',
        indexObject = slider.indexObject, i, wraper, pagerLinks;

    sliderContainer.wrap('<div class="wraper"></div>');
    wraper = sliderContainer.parent();
    wraper.append(pager);

    for (i = 0; i < slider.sliderObject.children().length; i++) {
        htmlPager += '<div class="pager_item"><a href="#" slide_index="'+ i +'"></a></div>'
    }

    pager.append(htmlPager);
    var slide_index = pager.find('a').first();
    slide_index.addClass('active');
    pagerLinks = pager.find('a');

    /* Pager API functions for controling the pager CSS */
    var updatePager = function(index) {
        var index = (typeof index != 'undefined') ? index:indexObject.getIndex();

        console.log("updatePager: index=" + index);
        pagerLinks.removeClass('active');
        pagerLinks.each(function() {
            if (parseInt($(this).attr('slide_index')) == index)
                $(this).addClass('active');
        });
    },

    handlePagerClick = function(event) {
        var triggeredElement = $(event.target),
            clickIndex = parseInt(triggeredElement.attr("slide_index")),
            currentIndex = indexObject.getIndex(), next;

        if (clickIndex == currentIndex)
            return;
        else if (clickIndex > currentIndex)
            next = "next";
        else
            next = "prev";
        console.log("handlePagerClick: clickIndex=" + clickIndex);
        if (slider.sliderState.getSliderState() == "SLIDER_FREE") {
            updatePager(clickIndex);
            slider.callMoveFunction(next, clickIndex);
        }
    };
    pager.find('a').on('click', handlePagerClick);

    return {
        updatePager: updatePager
    }
}

/*
* Create arrows control and API
* slider:    main object which containes basic configuration
*/
function createArrowControl(slider)
{
    var sliderContainer = slider.sliderObject.parent(),
        next = $('<img src=\"right_arrow.png\" class="right_control"/>'),
        prev = $('<img src=\"left_arrow.png\" class="left_control"/>');
    sliderContainer.prepend(next);
    sliderContainer.prepend(prev);

    /* Arrow API functions for controling the arrow CSS */
    var hanldeClickNext = function() {
        if (slider.sliderState.getSliderState() == "SLIDER_FREE") {
            slider.callMoveFunction("next");
            slider.pager.updatePager();
        }
    },

    handleClickPrev = function() {
        if (slider.sliderState.getSliderState() == "SLIDER_FREE") {
            slider.callMoveFunction("prev");
            slider.pager.updatePager();
        }
    };

    next.on("click", hanldeClickNext);
    prev.on("click", handleClickPrev);
}

/*
* Initialize slider state object
* STATE_FREE: no function/CSS is doing operations on the slider
* STATE_BUSY: function/CSS is doing operations on the slider
*/
function initSliderState()
{
    var busy = "SLIDER_FREE",

    setSliderState = function(param) {
        busy = param;
    },

    getSliderState = function() {
        return busy;
    };

    return {
        setSliderState: setSliderState,
        getSliderState: getSliderState
    }
}

/*
* Create moving rules and configuration for vertical slider
* slider:    main object which containes basic configuration
*/
function createVertical(slider)
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
* slider:    main object which containes basic configuration
*/
function createHorizontal(slider)
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
* slider:    main object which containes basic configuration
*/
function createSlider(slider)
{
    if (slider.option == "vertical")
        createVertical(slider);
    else
        createHorizontal(slider);
}

var defaultParams = {
    width: 400,
    height: 200,

    option: 'horizontal',
    cssClass: 'transitionClass2',
    skipClass: 'transitionClass'
}

$.fn.easySlider = function(options) {
    var slider ={};
    slider = $.extend({}, defaultParams, options);
    slider.sliderObject = this;

    /* Check if we're on a modern browser or a dinosaur */
    slider.useCssThree = (function(slider){
        var div = document.createElement('div'), i, cssPrefix, animProp,
            props = ['WebkitPerspective',
                     'MozPerspective',
                     'OPerspective',
                     'msPerspective'];
        for (i in props) {
            if (div.style[props[i]] !== undefined) {
                slider.cssPrefix = '-' + props[i].replace('Perspective', '').toLowerCase();
                return true;
            }
        }
        return false;
    })(slider);

    console.log("ready: useCssThree=" + slider.useCssThree);

    /* Get slider moving configuration */
    slider.listIterator = {};
    slider.moveConfig = {};
    createSlider(slider);
    
    /* Create slider html and css */
    slider.cssConfig = createSliderCss(slider.width, slider.height);
    slider.matrix = initMatrix(slider.sliderObject.children().length);
    createSliderElement(slider);
    slider.transEvent = 'transitionend';

    /* Initialize basic slider functions and properties */
    slider.sliderProcObj = initSlideProcedure(slider);
    slider.sliderState = initSliderState();
    slider.indexObject = initIndexObject(slider.sliderObject.children().length);
    var moveFunctionConfig = initMoveObject(slider, ["autoSlider"]);

    /* Create slider controls */
    slider.pager = createPager(slider);
    slider.arrows = createArrowControl(slider);

    slider.autoSlider = function() {
        var moveConfig = {
            next: "next",
            offset: null
        }
        slider.interval = setInterval(function() {
            slider.sliderState.setSliderState("SLIDER_BUSY");
            slider.sliderProcObj.slideProcedure.call(moveFunctionConfig, moveConfig);
        }, 5000);
        slider.pagerInterval = setInterval(function() {
            slider.pager.updatePager();
        }, 5000);
    }

    slider.callMoveFunction = function(next, index) {
        var moveParams = {}, offset;

        moveParams.next = next;
        slider.sliderState.setSliderState("SLIDER_BUSY");
        clearInterval(slider.interval);
        clearInterval(slider.pagerInterval);
        slider.interval = 0;

        offset = slider.indexObject.getOffset(index);
        if (offset > 1)
            moveParams.offset = offset;
        slider.sliderProcObj.slideProcedure.call(moveFunctionConfig, moveParams);
    }
    
    slider.autoSlider();
}
})(jQuery);

