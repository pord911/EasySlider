/*
* Za napraviti:
* auto slide, bind funkcija za executeSlide, isprobavanje drugačije implementacije execute, callback ... funkcija ali sa istim pozivima
*/
function initSlideProcedure(slider)
{
    var sliderObject = slider.sliderObject;
    var cssThreeSlideProc = function(slideParams) {
        sliderObject.unbind(this.transitionEvent);
        sliderObject.bind(this.transitionEvent, {index: slideParams.index}, this.sliderCallback);
        this.moveSlide.call(sliderObject, slideParams.next);
    }

    var animateSlideProc = function(slideParams) {

    }

    return function(slideParams) {
                console.log(slideParams.index);
                var i;
                /* TODO: check for css3 support */
                for (i = 0; i < slideParams.offset; i++)
                cssThreeSlideProc.call(this, slideParams);
    };
}

function createIndexObject(length) 
{
    var offset = 0, 
        index = 0, 
        indexLength = length - 1,
        indexStart = 0;

    var incrementIndex = function() {
        index++;
        console.log("Increment:" + index);
        if (index > indexLength)
            index = 0;
        offset = 1;
    }

    var decrementIndex = function() {
        index--;
        console.log("decrementIndex:" + index);
        if (index < 0)
            index = indexLength;
        offset = 1;
    }

    var setIndex = function(value) {
        if (value < indexLength) {
            offset = Math.abs(index - value);
            indexStart = index;
            index = value;
        } else
            return -1;
        return 0;
    }

    var getIndex = function() {
        return index;
    }

    var getOffset = function() {
        return offset;
    }

    var getIndexStart = function() {
        return indexStart;
    }

    return {
        incrementIndex: incrementIndex,
        decrementIndex: decrementIndex,
        setIndex: setIndex,
        getIndex: getIndex,
        getOffset: getOffset,
        getIndexStart: getIndexStart
    }
}

function createMoveObject(slider, callbacks)
{
    var sliderCallback = function(event) {
        var array = slider.matrix[event.data.index],
            sliderObject = $(this), value, listElement;
        console.log(array);
        console.log("Index in callback:" + event.data.index);
        sliderObject.removeClass(slider.cssClass);
        slider.moveObject[slider.moveProperty] = slider.defaultValue;
        sliderObject.css(slider.moveObject);
        sliderObject.children().each(function(index) {
            listElement = $(this);
            value = array[index] * slider.permuteValue;
            slider.property[slider.permuteProperty] = value + 'px';
            listElement.css(slider.property);
        });
        callbacks.forEach(function() {
            console.log("Calling callbacks!");
        });
    }

    var moveSlide = function(next) {
        var moveValue = next == "next" ? slider.moveNext : slider.movePrev,
            sliderObject = $(this);
        sliderObject.addClass(slider.cssClass);
        slider.moveObject[slider.moveProperty] = moveValue;
        sliderObject.css(slider.moveObject);
    }
    var transitionEvent = slider.transEvent;

    return {
        sliderCallback: sliderCallback,
        transitionEvent: transitionEvent,
        moveSlide: moveSlide
    };   
}

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

$(document).ready(function() {
    var slider ={};
    slider.cssConfig = createSliderCss(400, 200);
    slider.sliderObject = $('.transitionobj');
    slider.cssClass = 'transitionClass2';
    var sliderFunction = initSlideProcedure(slider);
    slider.property = {};
    slider.permuteValue = 400;
    slider.permuteProperty = 'left';
    slider.matrix = createMatrix(slider.sliderObject.children().length);
    slider.defaultValue = "translateX(0px)";
    slider.transEvent = 'transitionend';
    slider.moveNext = "translateX(-400px)";
    slider.movePrev = "translateX(400px)";
    slider.moveObject = {};
    slider.moveProperty = "transform";
    createSliderElement(slider);
    var moveFunctionConfig = createMoveObject(slider, [1,2]);
    var indexObject = createIndexObject(slider.sliderObject.children().length);
    var moveParams = {
        next: "next",
        index: 0
    }
    
    $('.mybutton').on("click", function() {
        indexObject.incrementIndex();
        moveParams.next = 'next';
        moveParams.index = indexObject.getIndex();
        sliderFunction.call(moveFunctionConfig, moveParams);
    });
    $('.skip').on("click", function() {
        indexObject.decrementIndex();
        moveParams.next = 'prev';
        moveParams.index = indexObject.getIndex();
        sliderFunction.call(moveFunctionConfig, moveParams);
    });
});
