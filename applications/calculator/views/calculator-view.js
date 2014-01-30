var calculator = calculator || {};

$(function(){
	calculator.CalculatorView = Backbone.View.extend({
		events: {
			'click': 'performCommand',
			'mouseup': 'unpressElement',
			'mouseout': 'unpressElement',
			'mousedown': 'pressElement'
		},

		layout: {
			columns: 4,
			rows: 5,
			margin: 4, // px
		},

		defaultFont: {
			size: 0,
			name: 'Poiret One',
			color: '#FFFFFF',
			textAlign: 'center',
			textBaseline: 'middle'
		},

		displayFont: {
			size: 0,
			name: 'Poiret One',
			color: '#FFFFFF',
			textAlign: 'left',
			textBaseline: 'middle'
		},

		// graphics options needed for animation element states
		graphicsOptions: {
			shadowOffsetX: 2,
			shadowOffsetY: 2,
			shadowBlur: 2,
			shadowColor: '#3A3A3A'
		},
		
		initialize: function() {
			this.refreshContentAreaSize();
			this.drawContext = this.$el.get(0).getContext("2d");
			this.render();

			// keyboard control
			var view = this;
			$(document).on( 'keydown', function( event ) {
				view.checkPressElement( event );
			});

			$(document).on( 'keyup', function( event ) {
				view.checkUnpressElement( event );
			});

			$(window).on( 'resize', function( event ) {
				view.refreshContentAreaSize();
				view.render();
			});
		},

		render: function() {
			this.calculateCellSize();
			this.calculateFontSize();
			this.calculateElementsPositions();

			this.drawElements();

			this.listenTo( this.model, 'change:displayValue', this.setDisplayValue );
		},

		performCommand: function( event ) {
			var activeElement = this.getActiveElement( event );

			// when control pressed
			if( activeElement ) {
				var command = this.model.commands.findWhere({id:activeElement.get('commandId')});
				this.model.performCommand( command );
			}
		},

		pressElement: function( event ) {
			var activeElement = this.getActiveElement( event );

			if( activeElement && !activeElement.get( 'isPressed' ) ) {
				activeElement.set( 'isPressed', true );
				this.setPressElementStyle( activeElement );
			}
		},

		setPressElementStyle: function( element ) {
			var currentGraphicsOptions = element.get( 'graphicsOptions' );
			var isActiveAnimation = false;
			for( optionName in currentGraphicsOptions ) {
				if( currentGraphicsOptions[ optionName ] > 0 ) {
					currentGraphicsOptions[ optionName ] -= 1;
					this.drawContext[ optionName ] = currentGraphicsOptions[ optionName ];
					isActiveAnimation = true;
				}
				else {
					isActiveAnimation = false;
				}
			}

			this.drawContext.globalAlpha = 0.7;

			this.drawElement( element );

			// animate
			if( isActiveAnimation ) {
				var view = this;
				this.setNextFrame( function() {
					view.setPressElementStyle( element );
				} );
			}						
		},

		unpressElement: function() {
			var view = this;

			// unpress all pressed elements
			var pressedElements = this.model.elements.where({ isPressed: true });
			pressedElements.forEach( function( element ) {
				element.set( 'isPressed', false );
				view.setUnpressElementStyle( element );
			});
		},

		setUnpressElementStyle: function( element ) {
			var currentGraphicsOptions = element.get( 'graphicsOptions' );
			var defaultGraphicsOptions = this.graphicsOptions;
			var isActiveAnimation = false;
			for( optionName in currentGraphicsOptions ) {
				if( currentGraphicsOptions[ optionName ] < defaultGraphicsOptions[ optionName ] ) {
					currentGraphicsOptions[ optionName ] += 1;
					this.drawContext[ optionName ] = currentGraphicsOptions[ optionName ];
					isActiveAnimation = true;
				}
				else {
					isActiveAnimation = false;
				}
			}

			this.drawContext.globalAlpha = 1;

			this.drawElement( element );

			// animate
			if( isActiveAnimation ) {
				var view = this;
				this.setNextFrame( function() {
					view.setUnpressElementStyle( element );
				} );
			}
		},

		checkPressElement: function( event ) {
			if( event.keyCode ) {
				this.checkElementState( event, true );
			}	
		},

		checkUnpressElement: function( event ) {
			if( event.keyCode ) {
				this.checkElementState( event, false );
			}		
		},

		checkElementState: function( event, isPressed ) {
			var keyCode = event.keyCode;
			var isShiftPressed = event.shiftKey;

			var condition = isShiftPressed ? { altKeyCode: keyCode } : { keyCode: keyCode };
			var command = this.model.commands.findWhere( condition );

			if( !command ) {
				var condition = !isShiftPressed ? { altKeyCode: keyCode } : { keyCode: keyCode };
				var command = this.model.commands.findWhere( condition );
			}

			if( command ) {
				var commandElement = this.model.elements.findWhere({ commandId: command.get('id') });
				if( commandElement ) {
					commandElement.set( 'isPressed', isPressed );
					isPressed ? this.setPressElementStyle( commandElement ) : this.setUnpressElementStyle( commandElement );
				}

				if( isPressed ) {
					this.model.performCommand( command );
				}
			}
		},

		getActiveElement: function( event ) {
			var offsetX = event.offsetX || 0;
			var offsetY = event.offsetY || 0;

			var calculatorView = this;
			var activeElement = null;
			this.model.elements.each( function( element ) {
				if( offsetX > element.get( 'left' ) && offsetY > element.get( 'top' ) ) {
					if( offsetX < (element.get( 'left' ) + element.get( 'width' )) && offsetY < (element.get( 'top' ) + element.get( 'height' )) ) {
						activeElement = element;
					}
				}
			});

			if( activeElement && !activeElement.isDisplay() ) {
				return activeElement;
			}
		},

		setDisplayValue: function( model, value ) {
			var display = this.model.elements.getDisplay();
			this.drawElement( display, value );
		},

		calculateCellSize: function() {
			var contentAreaSize = {
				width: this.$el.width(),
				height: this.$el.height(),
			}

			var totalHorizMargin = (this.layout.columns - 1) * this.layout.margin;
			var totalVertMargin = (this.layout.rows - 1) * this.layout.margin;

			var cellSize = {
				width: Math.floor( (contentAreaSize.width - totalHorizMargin - 1) / this.layout.columns),
				height: Math.floor( (contentAreaSize.height - totalVertMargin - 1) / this.layout.rows),
			}

			this.cellSize = cellSize;
		},

		calculateFontSize: function() {
			var cellSize = this.cellSize;

			// calculate fonts sizes
			this.defaultFont.size = Math.floor(( cellSize.width < cellSize.height ?  cellSize.width : cellSize.height ) * 0.5);
			this.displayFont.size = Math.floor( this.defaultFont.size * 0.7 );
		},

		calculateElementsPositions: function() {
			var cellSize = this.cellSize;

			var commandsPositions = [];
			var currentRow = 0, currentColumn = 0;
			var calculatorView = this;
			this.model.commands.each( function( command ) {
				var elementSize = command.id == 'display' ? calculatorView.layout.columns - 1 : 1;

				commandsPositions.push({
					commandId: command.get( 'id' ),
					left: currentColumn * (cellSize.width + calculatorView.layout.margin),
					top: currentRow * (cellSize.height + calculatorView.layout.margin),
					width: cellSize.width * elementSize + (elementSize - 1) * calculatorView.layout.margin,
					height: cellSize.height,
					graphicsOptions: jQuery.extend({},calculatorView.graphicsOptions)
				});

				currentColumn += elementSize;
				if( currentColumn != 0 && ( currentColumn % calculatorView.layout.columns == 0 ) ) {
					currentColumn = 0;
					currentRow++;
				}
			});
			calculatorView.model.elements.reset( commandsPositions );
		},

		drawElements: function() {
			var calculatorView = this;
			this.model.elements.each( function( element ) {
				calculatorView.drawElement( element );
			});
		},

		drawElement: function( element, label ) {
			var command = this.model.commands.findWhere({id:element.get('commandId')});

			// clear element
			this.drawContext.fillStyle = command.get( 'color' );
			this.drawContext.clearRect(
				element.get( 'left' ), 
				element.get( 'top' ), 
				element.get( 'width' ) + this.layout.margin,
				element.get( 'height' ) + this.layout.margin
			);

			// set graphics options
			var currentGraphicsOptions = element.get( 'graphicsOptions' );
			for( optionName in currentGraphicsOptions ) {
				this.drawContext[ optionName ] = currentGraphicsOptions[ optionName ];
			}

			if( element.isDisplay() ) {
				this.drawContext.globalAlpha = 1;
			}

			// draw element
			this.drawContext.fillRect(
				element.get( 'left' ), 
				element.get( 'top' ), 
				element.get( 'width' ), 
				element.get( 'height' )
			);

			// draw element label
			this.drawElementLabel( 
				(label ? label : command.get( 'title' )), 
				element
			);
		},

		drawElementLabel: function( label, element ) {
			var font = element.isDisplay() ? this.displayFont : this.defaultFont;

			this.drawContext.fillStyle = font.color;
			this.drawContext.textAlign = font.textAlign;
			this.drawContext.textBaseline = font.textBaseline;
			this.drawContext.font = font.size + "px " + font.name;

			if( !element.isDisplay() ) {
				var textLeft = element.get( 'left' ) + element.get( 'width' ) / 2;
			}
			else {
				var textLeft = element.get( 'left' ) + this.layout.margin;
			}

			var textWidth = this.drawContext.measureText( label ).width + this.layout.margin * 2;
			if( textWidth > element.get( 'width' ) && element.isDisplay() ) {
				label = 'MAX';
			}
			
			var textTop = element.get( 'top' ) + element.get( 'height' ) / 2;

			this.drawContext.fillText( label, textLeft, textTop );
		},

		// animation delay
		setNextFrame: function(callback) {
			setTimeout(callback, 1000 / 60);
		},

		refreshContentAreaSize: function() {
			var $container = this.$el.parent();

			// set content area size
			this.$el.attr( 'width', $container.width() );
			this.$el.attr( 'height', $container.height() );
		}
	});
});