var ControlMode = {
    AUTO: 1,
    MOVE: 2,
    MOVE_WITH_INDEX: 3
};

var CallbackRes = {
    CALLBACK_FINISHED: 1,
    MOVE: 2
};

/*
* Create an object which manages index.
* @param length  Length of the element list.
*/
var IndexObject = {

    settings: {
        indexLength: 0,
        index: 0,
        offset: 0
    },

    init: function( length ) {
        this.settings.indexLength = length - 1;
    },

    incrementIndex: function() {
        this.settings.index++;
        console.log("incrementIndex: Increment:" + this.settings.index);
        if ( this.settings.index > this.settings.indexLength )
            this.settings.index = 0;
    },

    decrementIndex: function() {
        this.settings.index--;
        console.log("decrementIndex:" + this.settings.index);
        if (this.settings.index < 0)
            this.settings.index = this.settings.indexLength;
    },

    updateIndex: function( next ) {
        if ( next == "next" )
            this.incrementIndex();
        else
            this.decrementIndex();
    },

    getIndex: function() {
        return this.settings.index;
    },

    getOffset: function( value ) {
        console.log( "getOffset: index:" + this.settings.index + " value:" + value );
        if ( value < 0 || value > this.settings.indexLength )
            this.settings.offset = 0;
        else
            this.settings.offset = Math.abs( this.settings.index - value );
        return this.settings.offset;
    }
};

var MoveState = {
    state: "SLIDER_MOVE",

    setMoveState: function( state ) {
        this.state = state;
    },

    checkMoveState: function( state ) {
        return this.state == state;
    }
};

var Control = {

    settings: {
        moveParams: {
            next: "next",
            context: undefined
        },
        offset: 0,
        autoMode: false,
        interval: 0,
        intervalSet: 0,
        state: "SLIDER_FREE",
        autoState: "STOPPED"
    },

    init: function( sliderObject, autoMode, interval ) {
        this.sliderObject = sliderObject;
        this.settings.moveParams.context = sliderObject;
        this.settings.autoMode = autoMode;
        this.settings.interval = interval;
        if ( this.settings.autoMode )
            this.startSlider( "next", ControlMode.AUTO, this.settings.interval );
    },

    moveSlide: function( direction ) {
        var s = this.settings;
        if ( s.offset > 1 ) {
            MoveState.setMoveState( "SLIDER_SKIP" );
            s.offset--;
        } else {
            MoveState.setMoveState( "SLIDER_MOVE" );
        }
        s.moveParams.next = direction;
        IndexObject.updateIndex( s.moveParams.next );
        s.state = "SLIDER_BUSY";
        /* Allow some time for the sliding to take affect. */
        setTimeout((function( context, moveParams ) {
            return function() {
                context.sliderObject.slide( moveParams );
                PagerElement.render( IndexObject.getIndex() );
            }
        })( this, s.moveParams ), 10);
    },

    startSlider: function( direction, moveDesicion, index ) {
        var s = this.settings;
        if ( s.state == "SLIDER_BUSY")
            return;

        if ( moveDesicion == ControlMode.MOVE_WITH_INDEX ) {
            if ( index != undefined ) {
                s.offset = IndexObject.getOffset( index );
            }
            this.stopSlider();
            this.moveSlide( direction );
        } else if ( moveDesicion == ControlMode.AUTO ) {
            s.intervalSet =
                setInterval((function( context ) {
                    return function() {
                        context.moveSlide( "next" );
                    }
                })( this ), s.interval);
            s.autoState = "STARTED";
        } else {
            s.offset = 0;
            this.stopSlider();
            this.moveSlide( direction );
        }
    },

    notify: function( message, args ) {
        var s = this.settings;
        if ( message == CallbackRes.CALLBACK_FINISHED ) {
            s.state = "SLIDER_FREE";
            if ( s.autoState == "STOPPED" && s.autoMode )
                this.startSlider( "next", ControlMode.AUTO );
        }
        else if ( message == CallbackRes.MOVE )
            this.moveSlide( args );
    },

    stopSlider: function() {
        var s = this.settings;
        if ( s.autoMode  && s.autoState == "STARTED") {
            clearInterval( s.intervalSet );
            s.autoState = "STOPPED";
        }
    }
};