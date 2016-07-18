/*
* Za napraviti:
* auto slide, bind funkcija za executeSlide, isprobavanje drugačije implementacije execute, callback ... funkcija ali sa istim pozivima
*/
function createMatrix(length)
{
    var array = new Array(length);
    var i;
    var temp = [];
    var result;
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

function createIndexObject(length) 
{
    var offset = 0, 
        index = 0, 
        indexLength = length - 1;

    var incrementIndex = function() {
        index++;
        console.log("incrementIndex: Increment:" + index);
        if (index > indexLength)
            index = 0;
    }

    var decrementIndex = function() {
        index--;
        console.log("decrementIndex:" + index);
        if (index < 0)
            index = indexLength;
    }

    var updateIndex = function(next) {
        if (next == "next")
            incrementIndex();
        else
            decrementIndex();
    }

    var setIndex = function(value) {
        index = value;
    }

    var getIndex = function() {
        return index;
    }

    var getOffset = function(value) {
        console.log("getOffset: index:" + index + " value:" + value);
        offset = Math.abs(index - value);
        return offset;
    }

    return {
        updateIndex: updateIndex,
        setIndex: setIndex,
        getIndex: getIndex,
        getOffset: getOffset
    }
}

function initSlideProcedure(slider)
{
    var sliderObject = slider.sliderObject;

    var cssThreeSlideProc = function(slideParams) {

        sliderObject.unbind(this.transitionEvent);
        sliderObject.bind(this.transitionEvent, {params: slideParams,
                                                 skip: slideParams.skip,
                                                 skipFunction: "slideProcedure",
                                                 context: this}, this.sliderCallback);
        this.moveSlide(slideParams);
    }

    var animateSlideProc = function(slideParams) {
        var params = {
            params: slideParams,
            skip: slideParams.skip,
            skipFunction: "slideProcedure",
            context: this
        };
        this.moveOldSlide(params);
    }

    var slideProcedure = function(slideParams) {
        console.log("cssThreeSlideProc: offset:" + slideParams.offset);
        if (slideParams.offset > 1)
            slideParams.skip = "SKIP";
        else
            slideParams.skip = "NONE";
        if (1)
            cssThreeSlideProc.call(this, slideParams);
        else
            animateSlideProc.call(this, slideParams);
    }

    return {
        slideProcedure: slideProcedure
    };
}

function createMoveObject(slider, callbacks)
{
    var sliderObject = slider.sliderObject;

    var updateIndexParams = function(params) {
        params.offset--;
        slider.indexObject.updateIndex(params.next);
    }

    var moveOldSlide = function(params) {
        var moveObject = params.params.next == "next" ? slider.moveNext : slider.movePrev;

        sliderObject.animate(moveObject, 1000, (function(params, context) {
            return function() {
                context.sliderCallback(params);
            }
        })(params, this));
    }

    var moveSlide = function(params) {
        var moveValue = params.next == "next" ? slider.moveNext : slider.movePrev,
            moveClass;

        moveClass = params.skip == "SKIP" ? slider.skipClass : slider.cssClass;
        console.log("moveSlide: moveClass=" + moveClass);
        updateIndexParams(params);

        setTimeout(function() {
            sliderObject.addClass(moveClass);
            setTimeout(function() {
                slider.moveObject[slider.moveProperty] = moveValue;
                sliderObject.css(slider.moveObject);
            }, 10);
        }, 10);
    }

    var sliderCallback = function(event) {
        var array, value, listElement,
            params = event.data || event,
            fn = slider.sliderFunction[params.skipFunction], moveClass;

        console.log("sliderCallback: Calling callback");
        array = slider.matrix[slider.indexObject.getIndex()];

        console.log("sliderCallback: array=" + array);
        console.log("sliderCallback: Index in callback=" + slider.indexObject.getIndex());
        console.log("sliderCallback: skip=" + params.skip);

        moveClass = params.skip == "SKIP" ? slider.skipClass:slider.cssClass;
        sliderObject.removeClass(moveClass);
        slider.moveObject[slider.moveProperty] = slider.defaultValue;
        sliderObject.css(slider.moveObject);

        sliderObject.children().each(function(index) {
            listElement = $(this);
            value = array[index] * slider.permuteValue;
            slider.property[slider.permuteProperty] = value + 'px';
            listElement.css(slider.property);
        });

        if (params.skip == "SKIP")
            fn.call(params.context, params.params);
        else {
            callbacks.forEach(function(element, index) {
                slider.sliderBusy.setSliderBusy("SLIDER_FREE");
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
    }

    var transitionEvent = slider.transEvent;

    return {
        sliderCallback: sliderCallback,
        transitionEvent: transitionEvent,
        moveSlide: moveSlide,
        moveOldSlide: moveOldSlide
    };   
}

function createSliderElement(slider)
{
    var sliderObj = slider.sliderObject,
        objChildren = sliderObj.children(),
        permuteObj = {}, value;
    sliderObj.css(slider.cssConfig.sliderListCss);
    objChildren.css(slider.cssConfig.sliderListElementCss);
    objChildren.each(function(index) {
        permuteObj[slider.permuteProperty] = slider.matrix[0][index] * slider.permuteValue + 'px';
        $(this).css(permuteObj);
    });
}

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

    var updatePager = function(index) {
        var index = (typeof index != 'undefined') ? index:indexObject.getIndex();

        console.log("updatePager: index=" + index);
        pagerLinks.removeClass('active');
        pagerLinks.each(function() {
            if (parseInt($(this).attr('slide_index')) == index)
                $(this).addClass('active');
        });
    }

    var handlePagerClick = function(event) {
        var triggeredElement = $(event.target),
            clickIndex = parseInt(triggeredElement.attr("slide_index")),
            currentIndex = indexObject.getIndex(), next;

        if (clickIndex == currentIndex)
            return;
        else if (clickIndex > currentIndex)
            next = "next";
        else
            next = "prev";
        console.log("handlePagerClick: currentIndex=" + clickIndex);
        if (slider.sliderBusy.getSliderBusy() == "SLIDER_FREE") {
            updatePager(clickIndex);
            slider.callMoveFunction(next, clickIndex);
        }
    }
    pager.find('a').on('click', handlePagerClick);

    return {
        updatePager: updatePager
    }
}

function createArrowControl(slider)
{
    var sliderContainer = slider.sliderObject.parent(),
        next = $('<img src=\"right_arrow.png\" class="right_control"/>'),
        prev = $('<img src=\"left_arrow.png\" class="left_control"/>');
    sliderContainer.prepend(next);
    sliderContainer.prepend(prev);

    var hanldeClickNext = function() {
        if (slider.sliderBusy.getSliderBusy() == "SLIDER_FREE") {
            slider.callMoveFunction("next");
            slider.pager.updatePager();
        }
    }

    var handleClickPrev = function() {
        if (slider.sliderBusy.getSliderBusy() == "SLIDER_FREE") {
            slider.callMoveFunction("prev");
            slider.pager.updatePager();
        }
    }

    next.on("click", hanldeClickNext);
    prev.on("click", handleClickPrev);
}

function sliderBusy()
{
    var busy = "SLIDER_FREE";
    var setSliderBusy = function(param) {
        busy = param;
    }
    var getSliderBusy = function() {
        return busy;
    }

    return {
        setSliderBusy: setSliderBusy,
        getSliderBusy: getSliderBusy
    }
}

/* TODO: malo skratiti ready() funkciju */
$(document).ready(function() {
    var slider ={};
    slider.sliderObject = $('.transitionobj');
    slider.cssClass = 'transitionClass2';
    slider.skipClass = 'transitionClass';

    slider.property = {};
    slider.permuteValue = 400;
    slider.permuteProperty = 'left';

    slider.moveObject = {};
    slider.moveProperty = "transform";
    slider.defaultValue = 'translateX(0px)';

    slider.transEvent = 'transitionend';
    slider.moveNext = "translateX(-400px)"
    slider.movePrev = "translateX(400px)"

    slider.cssConfig = createSliderCss(400, 200);
    slider.sliderFunction = initSlideProcedure(slider);
    slider.matrix = createMatrix(slider.sliderObject.children().length);
    slider.sliderBusy = sliderBusy();
    slider.indexObject = createIndexObject(slider.sliderObject.children().length);
    slider.pager = createPager(slider);
    slider.arrows = createArrowControl(slider);
    var moveFunctionConfig = createMoveObject(slider, ["autoSlider"]);

    slider.autoSlider = function() {
        var moveConfig = {
            next: "next",
            offset: null
        }
        slider.interval = setInterval(function() {
            slider.sliderBusy.setSliderBusy("SLIDER_BUSY");
            slider.sliderFunction.slideProcedure.call(moveFunctionConfig, moveConfig);
        }, 5000);
        slider.pagerInterval = setInterval(function() {
            slider.pager.updatePager();
        }, 5000);
    }

    slider.callMoveFunction = function(next, index) {
        var moveParams = {}, offset;

        moveParams.next = next;
        slider.sliderBusy.setSliderBusy("SLIDER_BUSY");
        clearInterval(slider.interval);
        clearInterval(slider.pagerInterval);
        slider.interval = 0;

        offset = slider.indexObject.getOffset(index);
        if (offset > 1)
            moveParams.offset = offset;
        slider.sliderFunction.slideProcedure.call(moveFunctionConfig, moveParams);
    }

    
    slider.autoSlider();
    createSliderElement(slider);
});
