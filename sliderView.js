/**
 * Create a permutation matrix.
 * @param length  Length of elements
 */
function initMatrix( length ) {
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

var SliderElement = {

    settings: {
        elementListCss: {
            display: 'block',
            position: 'relative',
            "list-style": 'none'
        },
        elementCss: {
            position: 'absolute'
        },
        slideObject: null
    },

    init: function( jQObject, slideObject, config ) {
        var s = this.settings;

        s.elementListCss.width = config.width + 'px';
        s.elementListCss.height = config.height + 'px';
        s.elementCss.width = config.width + 'px';
        s.elementCss.height = config.height + 'px';
        s.slideObject = slideObject;
        this.jQObject = jQObject;
        this.matrix = config.matrix;
        this.setElementCss( config );
        this.createSlider();
    },

    setElementCss: function( config ) {
        if ( config.option == "horizontal" ) {
            this.position = 'left';
            this.value = config.width;
        } else if ( config.option == "vertical" ) {
            this.position = 'top';
            this.value = config.height;
        }
    },

    createSlider: function() {
        var elementCssObject = {}, context = this,
            children = this.jQObject.children(),
            s = this.settings;

        this.jQObject.css( s.elementListCss );
        children.css( s.elementCss );
        children.each( function( index ) {
            elementCssObject[ context.position ] = context.matrix[ 0 ][ index ] * context.value + 'px';
            $( this ).css( elementCssObject );
        } );
    },

    render: function() {
        var s = this.settings;
        s.slideObject.slide( Control.getMoveParams() );
    },

    getArrayFromMatrix: function( index ) {
        return this.matrix[ index ];
    },

    onMouseEnterEvent: function( control ) {
        this.jQObject.on( "mouseenter", function() {
            //control.stopSlider();
        } );
    },

    onMouseLeaveEvent: function( control ) {
        this.jQObject.on( "mouseleave", function() {
            //control.startSlider();
        } );
    }
};


var PagerElement = {
    settings: {
        pagerHtml: '<div class="pager_box"></div>',
        wraperHtml: '<div class="wraper"></div>'
    },

    init: function( jQObject, length ) {
        this.sliderContainer = jQObject.parent();
        this.length = length;
        this.pager = $( this.settings.pagerHtml );
        this.createPager();
    },

    createPager: function() {
        var s = this.settings, pagerElement = '', i;
            pagerb = $( '<div class="pager_box"></div>' );

        this.sliderContainer.wrap( s.wraperHtml );
        /* Wraper needs to be created here since jQuery
         * needs to have container as a parent in it's 
         * object. In order for the pager_box addition
         * to take effect. */
        var wraper = this.sliderContainer.parent();
        /* Append needs a jQuery object here in order 
         * for pagers parentElement to get set to wraper
         * I do not know why is this needed. Otherwise,
         * this.pager.append( pagerElement ) won't work. */
        wraper.append( this.pager );

        for ( i = 0; i < this.length; i++ ) {
            pagerElement += '<div class="pager_item"><a href="#" slide_index="'+ i +'"></a></div>';
        }

        this.pager.append( pagerElement );
        this.pager.find( 'a' ).first().addClass( 'active' );
        this.pagerLinks = this.pager.find( 'a' );
    },

    render: function() {
        this.pagerLinks.removeClass( 'active' );
        this.pagerLinks.each(function() {
            if (parseInt($(this).attr( 'slide_index' )) == IndexObject.getIndex())
                $(this).addClass( 'active' );
        });
    },

    onPagerClick: function() {
        this.pager.find( 'a' ).on( "click", (function( context ) {
            return function( event ) {
                context.pagerClicked( event );
            }
        })( this ) );
    },

    pagerClicked: function( event ) {
        var triggeredElement = $( event.target ), direction,
            clickIndex = parseInt( triggeredElement.attr( "slide_index" ) );
        if ( clickIndex > IndexObject.getIndex() )
            direction = "next";
        else
            direction = "prev";
        this.render( clickIndex );
        Control.startSlider( direction, ControlMode.MOVE_WITH_INDEX, clickIndex );
    }
};

var ArrowElement = {
    settings: {

    },

    init: function( jQObject, config ) {
        this.jQObject = jQObject.parent();
        this.settings.next = $( '<img src="' + config.rightImage +  '" class="' + config.rightClass + '"/>'  );
        this.settings.prev = $( '<img src="' + config.leftImage +  '" class="' + config.leftClass + '"/>'  );
        this.createArrow();
    },

    createArrow: function() {
        this.jQObject.prepend( this.settings.next );
        this.jQObject.prepend( this.settings.prev );
    },

    onRightClick: function() {
        this.settings.next.on( "click", function() {
            Control.startSlider( "next", ControlMode.MOVE );
        } );
    },

    onLeftClick: function() {
        this.settings.prev.on( "click", function() {
            Control.startSlider( "prev", ControlMode.MOVE );
        } );
    }
};
