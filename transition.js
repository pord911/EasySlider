$(document).ready(function() {
    var width = 400;
    var array = [-1, 0, 1, 2];
    function calculateArray() {
      for (var i = 0; i < array.length; i++) {
        if (array[i] < 0) {
          array[i] = 2;
          continue;
        }
        array[i] -= 1;
      }
    }
    $('.transitionobj').children().each(function(index) {
      var value = index * width;
      $(this).css({left:value + 'px'});
    });
    $('.transitionobj li:last').css({left: '-' + width + 'px'});
    $('.mybutton').on("click", function() {
      moveIt();
      //jMove();
      //setInterval(moveIt, 2000);
    });
    function moveIt() {
      var t;
        $('.transitionobj').bind("transitionend", function() {
          var el = $(this)[0];
          $(this).children().each(function(index) {
            var value = array[index] * width;
            $(this).css({left: value + 'px'});
          });
          calculateArray();
          $('.transitionobj').removeClass('transitionClass');
          console.log("callback: Changed list");
          def = "translateX(0px)";
          el.style.transform = def;
          $('.transitionobj').unbind("transitionend");
          console.log("callback: Css to default");
          //setTimeout(moveIt, 0);
        });
        $('.transitionobj').addClass('transitionClass');
        prop = "translateX(-400px)";
        temp = $('.transitionobj')[0];
        t = temp.style.transform;
        console.log('base: configured transform:' + t);

        console.log("base: Initiate new configuration.");
        
        $('.transitionobj').css({'transform': prop});

    }
    function jMove() {

      $('.transitionobj').animate({left:'-800px'}, 500, function() {
         $('.transitionobj li:last').after($('.transitionobj li:first'));
         $('.transitionobj').css({'left':'-400px'});
         jMove();
      });
    }
}); 