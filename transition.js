$(document).ready(function() {
    $('.transitionobj li:first').before($('.transitionobj li:last'));
    $('.mybutton').on("click", function() {
      moveIt();
      //jMove();
      //setInterval(moveIt, 2000);
    });
    var i = 0;
    function moveIt() {
      
      var temp;
      var t;
     if (i < 3) {
        $('.transitionobj').bind("transitionend", function() {
          var el = $(this)[0];
          $('.transitionobj li:last').after($('.transitionobj li:first'));
          $('.transitionobj').removeClass('transitionClass');
          console.log("callback: Changed list");
          def = "translateX(-400px)";
          el.style.transform = def;
          //$('.transitionobj').css({'transform': def});
          $('.transitionobj').unbind("transitionend");
          console.log("callback: Css to default");
          setTimeout(moveIt, 0);
          //moveIt();
        });
       
        $('.transitionobj').addClass('transitionClass');
        prop = "translateX(-800px)";
        temp = $('.transitionobj')[0];
        t = temp.style.transform;
        console.log('base: configured transform:' + t);

        console.log("base: Initiate new configuration.");
        
          $('.transitionobj').css({'transform': prop});
          i++;
      }
    }
    function jMove() {

      $('.transitionobj').animate({left:'-800px'}, 500, function() {
         $('.transitionobj li:last').after($('.transitionobj li:first'));
         $('.transitionobj').css({'left':'-400px'});
         jMove();
      });
    }
}); 