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

    var getIndexStart = function() {
        return indexStart;
    }

    return {
        updateIndex: updateIndex,
        setIndex: setIndex,
        getIndex: getIndex,
        getOffset: getOffset,
        getIndexStart: getIndexStart
    }
}

function initSlideProcedure(slider)
{
    var sliderObject = slider.sliderObject;
    var cssThreeSlideProc = function(slideParams) {

        console.log("cssThreeSlideProc: offset:" + slideParams.offset);
        if (slideParams.offset > 1)
            slideParams.skip = "SKIP";
        else
            slideParams.skip = "NONE";

        sliderObject.unbind(this.transitionEvent);
        sliderObject.bind(this.transitionEvent, {params: slideParams,
                                                 skip: slideParams.skip,
                                                 skipFunction: "slideProcedure",
                                                 context: this}, this.sliderCallback);
        this.moveSlide.call(sliderObject, slideParams);
    }

    var animateSlideProc = function(slideParams) {

    }

    var slideProcedure = function(slideParams) {
        /* TODO: check for css3 support */
        cssThreeSlideProc.call(this, slideParams);
    }

    return {
        slideProcedure: slideProcedure
    };
}

function createMoveObject(slider, callbacks)
{
    var sliderObject = slider.sliderObject;

    var moveSlide = function(params) {
        var moveValue = params.next == "next" ? slider.moveNext : slider.movePrev,
            moveClass;

        moveClass = params.skip == "SKIP" ? slider.skipClass : slider.cssClass;
        console.log("moveSlide: moveClass=" + moveClass);
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
            fn = slider.sliderFunction[event.data.skipFunction], moveClass;

        console.log("sliderCallback: Calling callback");
        event.data.params.offset--;
        slider.indexObject.updateIndex(event.data.params.next);
        array = slider.matrix[slider.indexObject.getIndex()];

        console.log("sliderCallback: array=" + array);
        console.log("sliderCallback: Index in callback=" + slider.indexObject.getIndex());
        console.log("sliderCallback: skip=" + event.data.skip);

        moveClass = event.data.skip == "SKIP" ? slider.skipClass:slider.cssClass;
        sliderObject.removeClass(moveClass);
        slider.moveObject[slider.moveProperty] = slider.defaultValue;
        sliderObject.css(slider.moveObject);

        sliderObject.children().each(function(index) {
            listElement = $(this);
            value = array[index] * slider.permuteValue;
            slider.property[slider.permuteProperty] = value + 'px';
            listElement.css(slider.property);
        });

        if (event.data.skip == "SKIP")
            fn.call(event.data.context, event.data.params);
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
        moveSlide: moveSlide
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
    slider.permuteValue = 200;
    slider.permuteProperty = 'top';
    slider.defaultValue = "translateY(0px)";
    slider.transEvent = 'transitionend';
    slider.moveNext = "translateY(-200px)";
    slider.movePrev = "translateY(200px)";
    slider.moveObject = {};
    slider.moveProperty = "transform";

    slider.cssConfig = createSliderCss(400, 200);
    slider.sliderFunction = initSlideProcedure(slider);
    slider.matrix = createMatrix(slider.sliderObject.children().length);
    slider.sliderBusy = sliderBusy();
    slider.indexObject = createIndexObject(slider.sliderObject.children().length);
    var moveFunctionConfig = createMoveObject(slider, ["autoSlider"]);

    slider.autoSlider = function() {
        var moveConfig = {
            next: "prev",
            offset: null
        }
        slider.interval = setInterval(function() {
            slider.sliderBusy.setSliderBusy("SLIDER_BUSY");
            slider.sliderFunction.slideProcedure.call(moveFunctionConfig, moveConfig);
        }, 5000);
    }

    slider.callMoveFunction = function(next, index) {
        var moveParams = {};

        moveParams.next = next;
        slider.sliderBusy.setSliderBusy("SLIDER_BUSY");
        clearInterval(slider.interval);
        slider.interval = 0;
        if (index)
            moveParams.offset = slider.indexObject.getOffset(index);
        slider.sliderFunction.slideProcedure.call(moveFunctionConfig, moveParams);
    }

    slider.autoSlider();
    createSliderElement(slider);
    
    $('.mybutton').on("click", function() {
        /* TODO: možda staviti u posebnu funkciju */
        console.log("click to move: busy=" + slider.sliderBusy.getSliderBusy());
        if (slider.sliderBusy.getSliderBusy() == "SLIDER_FREE") {
            slider.callMoveFunction("prev", 0);
        }
    });

    $('.skip').on("click", function() {
        console.log("skip: busy=" + slider.sliderBusy.getSliderBusy());
        if (slider.sliderBusy.getSliderBusy() == "SLIDER_FREE") {
            slider.callMoveFunction("next", 0);
        }
    });
});
