var SCONTROL = (function() {
    var ControlMode = {
        CALLBACK_FINISHED: 1,
        MOVE: 2,
        MOVE_WITH_INDEX: 3,
        MOUSE_ENTER: 4,
        MOUSE_LEAVE: 5
    },

    IndexObject = {

        settings: {
            indexLength: 0,
            index: 0,
            offset: 0
        },

        init: function( length ) {
            IndexObject.settings.indexLength = length - 1;
        },

        incrementIndex: function() {
            var s = IndexObject.settings;
            s.index++;
            if ( s.index > s.indexLength )
                s.index = 0;
        },

        decrementIndex: function() {
            var s = IndexObject.settings;
            s.index--;
            if (s.index < 0)
                s.index = s.indexLength;
        },

        updateIndex: function( next ) {
            if ( next == "next" )
                IndexObject.incrementIndex();
            else
                IndexObject.decrementIndex();
        },

        getIndex: function() {
            return IndexObject.settings.index;
        },

        getOffset: function( value ) {
            var s = IndexObject.settings;
            if ( value < 0 || value > s.indexLength )
                s.offset = 0;
            else
                s.offset = Math.abs( s.index - value );
            return s.offset;
        }
    },

    Control = {

        settings: {
            moveParams: {
                next: "next"
            },
            autoMode: false,
            renderList: null,
            offset: 0,
            interval: 0,
            intervalSet: 0
        },

        init: function( renderList, autoMode, interval ) {
            Control.settings.renderList = renderList;
            Control.settings.autoMode = autoMode;
            Control.settings.interval = interval;
            Control.setState( Control.states.SLIDER_FREE, "SLIDER_FREE" );
            if ( Control.settings.autoMode )
                Control.startSlider( "next" );
        },

        states: {
            SLIDER_BUSY: function( direction, moveDesicion ) {
                switch ( moveDesicion ) {
                    case ControlMode.CALLBACK_FINISHED:
                        Control.setState( Control.states.SLIDER_FREE, "SLIDER_FREE" );
                        Control.startSlider( "next" );
                        break;
                    case ControlMode.MOVE:
                    case ControlMode.MOVE_WITH_INDEX:
                        break;
                    default:
                        console.log("ERROR: Received invalid state transition " + moveDesicion +
                                    " in SLIDER_BUSY"  );
                }
            },

            SLIDER_SKIP: function( direction, moveDesicion ) {
                var s = Control.settings;

                switch ( moveDesicion ) {
                    case ControlMode.SKIP:
                        /* Make sure to update offset before
                           any animation is performed */
                        s.offset--;
                        if ( s.offset > 0 ) {
                            Control.moveSlide( direction );
                        } else {
                            Control.setState( Control.states.SLIDER_BUSY, "SLIDER_BUSY" );
                            Control.moveSlide( direction );
                        }
                        break;
                    case  ControlMode.CALLBACK_FINISHED:
                        Control.setState( Control.states.SLIDER_FREE, "SLIDER_FREE" );
                        Control.startSlider( "next" );
                        break;
                    default:
                        console.log("ERROR: Received invalid state transition " + moveDesicion +
                                    " in SLIDER_SKIP"  );
                }
            },

            /* This state acts like a freeze of all slider auto functionality,
               that is why we have 'moving' variable as part of memoization
               in order to preserve functionality that should be done while mouseenter
               event is on. If any new preserving states need to be handled here add it as
               memoized elements. */
            SLIDER_HOVER: function( direction, moveDesicion ) {
                var s = Control.settings;

                switch ( moveDesicion ) {
                    case ControlMode.MOUSE_LEAVE:
                        Control.setState( Control.states.SLIDER_FREE, "SLIDER_FREE" );
                        Control.startSlider();
                        break;
                    case ControlMode.MOVE:
                        if ( Control.states.SLIDER_HOVER.moving == undefined )
                            Control.states.SLIDER_HOVER.moving = true;
                        else if ( Control.states.SLIDER_HOVER.moving )
                            return;
                        else
                            Control.states.SLIDER_HOVER.moving = true;
                        Control.moveSlide( direction );
                        break;
                    case ControlMode.CALLBACK_FINISHED:
                        Control.states.SLIDER_HOVER.moving = false;
                        break;
                    default:
                        console.log("ERROR: Received invalid state transition " + moveDesicion +
                                    " in SLIDER_HOVER"  );
                }
            },

            SLIDER_FREE: function( direction, moveDesicion ) {
                var s = Control.settings;
                switch ( moveDesicion ) {
                    case ControlMode.MOVE:
                        Control.setState( Control.states.SLIDER_BUSY, "SLIDER_BUSY" );
                        Control.stopSlider();
                        Control.moveSlide( direction );
                        break;
                    case ControlMode.MOVE_WITH_INDEX:
                        Control.setState( Control.states.SLIDER_SKIP, "SLIDER_SKIP" );
                        Control.stopSlider();
                        /* We call state here since we need the offset calculation to start
                           immediately. */
                        Control.state( direction, ControlMode.SKIP );
                        break;
                    case ControlMode.MOUSE_ENTER:
                        Control.setState( Control.states.SLIDER_HOVER, "SLIDER_HOVER" );
                        Control.stopSlider( true );
                        break;
                    case ControlMode.CALLBACK_FINISHED:
                        break;
                    default:
                        console.log("ERROR: Received invalid state transition " + moveDesicion +
                                    " in SLIDER_FREE"  );
                }
            }
        },

        notify: function( direction, moveDesicion, index ) {
            var s = Control.settings;
            if ( s.offset <= 0 )
                s.offset = index != undefined ? IndexObject.getOffset( index ) : 0;

            Control.state( direction, moveDesicion );
        },

        moveSlide: function( direction ) {
            var s = Control.settings;

            s.moveParams.next = direction;
            IndexObject.updateIndex( s.moveParams.next );
            s.state = "SLIDER_BUSY";
            /* Allow some time for the sliding to take affect. */
            setTimeout((function( renderList ) {
                return function() {
                    renderList.forEach(function( renderElement ) {
                        renderElement.render();
                    });
                }
            })( s.renderList ), 10);
        },

        startSlider: function( direction ) {
            var s = Control.settings;
            if ( s.autoMode ) {
                s.intervalSet =
                    setInterval((function( context ) {
                        return function() {
                            context.moveSlide( direction );
                        }
                    })( Control ), s.interval );
            }
        },

        stopSlider: function( ) {
            var s = Control.settings;
            if ( s.autoMode ) {
                clearInterval( s.intervalSet );
            }
        },

        setState: function( state, stateStr ) {
            Control.state = state;
            Control.settings.stateStr = stateStr;
        },

        checkState: function( state ) {
            return Control.settings.stateStr == state;
        },

        getMoveParams: function() {
            return Control.settings.moveParams;
        }
    },

    init = function( controlConfig ) {
        IndexObject.init( controlConfig.length );
        Control.init( controlConfig.renderList,
                      controlConfig.autoMode,
                      controlConfig.interval );
    };

    return {
        init: init,
        getIndex: IndexObject.getIndex,
        getOffset: IndexObject.getOffset,
        checkState: Control.checkState,
        notify: Control.notify,
        getMoveParams: Control.getMoveParams,
        ControlMode: ControlMode
    };
})();