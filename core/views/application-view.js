var platform = platform || {};

$(function(){
	platform.ApplicationWindowView = Backbone.View.extend({
		parentView: {},

		templateWindow: _.template($('#application-window-template').html()),

		events: {
			'click [data-action="close"]': 'close',
			'mousedown [data-cont="header"]': 'setActive',
			'mousedown [data-action="move"]': 'startMove'
		},

		isDrag: false,
		onDragCursorOffset: {},

		initialize: function( options ) {
			this.parentView = options.parentView;

			var appView = this;
			$(window).on( 'mouseup', function( event ) {
				appView.stopMove( event );
			});

			$(window).on( 'resize', function( event ) {
				appView.render( true );
			});

			this.parentView.$el.on( 'mousemove', function( event ) {
				appView.move( event );
			});

			this.render();
		},

		render: function( withoutTemplate ) {
			withoutTemplate == withoutTemplate || false;

			var appWindowId = '#' + this.model.id + '-window';

			if( !withoutTemplate ) {
				this.parentView.$el.append(
					this.templateWindow({
						id: this.model.get('id'),
						content: this.model.get('content'),
						title: this.model.get('name'),
						version: this.model.get('version')
					})
				);

				// set element
				this.setElement( appWindowId );
			}

			// switch to current window
			this.setActive();

			// set center positions
			this.setPosition(
				this.parentView.$el.width() / 2 - this.$el.width() / 2,
				this.parentView.$el.height() / 2 - this.$el.height() / 2
			);

			// cache window size
			this.windowSize = {
				width: this.$el.width(),
				height: this.$el.height()
			};

			// cache display size
			this.displaySize = {
				width:  this.parentView.$el.width(),
				height:  this.parentView.$el.height(),
			};

			// cache display offset
			this.displayOffset = this.parentView.$el.offset();

			// this.$el.find( 'canvas' ).attr( 'width', this.$el.find( '[data-cont="content"]' ).width() );


			return this;
		},

		startMove: function( event ) {
			this.isDrag = true;
			this.$el.css( 'opacity', 0.7 );
			
			// save cursor position
			this.onDragCursorOffset = {
				left: event.offsetX,
				top: event.offsetY
			};
		},

		move: function( event ) {
			if( this.isDrag ) {
				var nextPositionX = event.clientX - this.onDragCursorOffset.left - this.displayOffset.left;
				if( nextPositionX < 0 ) {
					nextPositionX = 0;
				}

				if( nextPositionX + this.windowSize.width > this.displaySize.width ) {
					nextPositionX = this.displaySize.width - this.windowSize.width;
				}

				var nextPositionY = event.clientY - this.onDragCursorOffset.top - this.displayOffset.top;

				if( nextPositionY < 0 ) {
					nextPositionY = 0;
				}

				if( nextPositionY + this.windowSize.height > this.displaySize.height ) {
					nextPositionY = this.displaySize.height - this.windowSize.height;
				}

				if( nextPositionX != this.currentPosition.left || nextPositionY != this.currentPosition.top ) {
					this.setPosition( nextPositionX, nextPositionY );
				}
			}
		},

		stopMove: function( event ) {
			if( this.isDrag ) {
				this.isDrag = false;
				this.$el.css( 'opacity', 1 );
			}
		},

		setPosition: function( x, y ) {
			this.$el.css( 'left', x + 'px' );
			this.$el.css( 'top', y + 'px' );

			// cache current position
			this.currentPosition = this.$el.position();
		},

		setActive: function() {
			// reset active state for all window
			this.parentView.$el.find( '[data-cont="window"]' ).removeClass( 'active' );
			
			// set active state for current window
			this.$el.addClass( 'active' );
		},

		close: function() {
			this.$el.remove();
		}
	});
});