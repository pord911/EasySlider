$(document).ready(function() {
    var width = 700;
    var array;
    var index = 1;

    function createMatrix() {
      var length = $('.transitionobj').children().length;
      array = new Array(length);
      var temp = [];
      var result;
      for (var i = 0; i < length; i++) {
        array[i] = new Array(length);
        temp[i] = (i == length - 1) ? -1 : i;
      }
      array[0] = temp.slice();
      for (var i = 1; i < length; i++) {
        result = temp.pop();
        temp.splice(0, 0, result);
        array[i] = temp.slice();
      }
    }
    function updateIndex() {
      if (index < array.length - 1)
        index++;
      else
        index = 0;
    }
    function getIndex() {
      return index;
    }
    function getArray(index) {
      return array[index];
    }
    function setIndex(ind) {
      index = ind;
    }
    createMatrix();
    $('.transitionobj').children().each(function(index) {
      var value = index * width;
      $(this).css({left:value + 'px'});
    });
    $('.transitionobj li:last').css({left: '-' + width + 'px'});

    $('.mybutton').on("click", function() {
      moveChange(1);
      //jMove();
      //setInterval(moveIt, 2000);
    });

    $('.skip').on("click", function() {
      moveChange(3);
    });
    function moveChange(offset) {      
      var transitionActual = 'transitionClass2';
      var transition;
     for (var i = 0; i < offset; i++) {
        transition = (i < offset - 1) ? skipSlide() : transitionActual;
        if (transition === transitionActual)
          executeSlideTransition(transition);      }
    }
  }
  function executeSlideTransition(transition) {
       var def;
       var prop;
       
        $('.transitionobj').bind("transitionend", function() {
          var el = $(this)[0];
          var array = getArray(getIndex());
          $('.transitionobj').removeClass(transition);
          console.log("callback: Changed list");
          def = "translateX(0px)";
          el.style.transform = def;
          $(this).children().each(function(index) {
            var value = array[index] * width;
            $(this).css({left: value + 'px'});
          });
          updateIndex();
          $('.content1').addClass('changeContent');
          $('.content2').addClass('changeContent2');
          $('.transitionobj').unbind("transitionend");
          console.log("callback: Css to default");
        });

        $('.transitionobj').addClass(transition);
        prop = "translateX(-"+ width +"px)";
        $('.transitionobj').css({'transform': prop});
  }
  function skipSlide() {
    var array = getArray(getIndex());
    $('.transitionobj').children().each(function(index) {
       var value = array[index] * width;
       $(this).css({left: value + 'px'});
    });
    updateIndex();
  }
    function jMove() {
      $('.transitionobj').animate({left:'-800px'}, 500, function() {
         $('.transitionobj li:last').after($('.transitionobj li:first'));
         $('.transitionobj').css({'left':'-400px'});
         jMove();
      });
    }
}); 