var calculator = calculator || {};

$(function(){

	/**
	 * Model for represent calculator
	 *
	 * @property string displayValue	displayed on screen value
	 * @property string operation 	 	
	 * @property string operand 		first number
	 * @property string accumulator		second number
	 * @property boolean isSequence 	internal state, used for concatenate numbers
	 */
	calculator.Calculator = Backbone.Model.extend({
		defaults: {
			displayValue: '0',
			operation: null,
			operand: 0,
			accumulator: 0,
			isSequence: true 
		},

		initialize: function() {

			// define available commands
			this.commands = new calculator.Commands([
				{ id: 'display', title: '0', type: 'display', index: 0, color: '#3299BB' },
				{ id: 'c', title: 'C', type: 'sumbol', index: 1, color: '#3299BB', keyCode: 46 },

				{ id: '7', title: '7', type: 'number', index: 2, keyCode: 55, altKeyCode: 103 },
				{ id: '8', title: '8', type: 'number', index: 3, keyCode: 56, altKeyCode: 104 },
				{ id: '9', title: '9', type: 'number', index: 4, keyCode: 57, altKeyCode: 105 },
				{ id: '/', title: '/', type: 'operation', index: 5, color: '#FF8500', keyCode: 191, altKeyCode: 111 },

				{ id: '4', title: '4', type: 'number', index: 6, keyCode: 52, altKeyCode: 100 },
				{ id: '5', title: '5', type: 'number', index: 7, keyCode: 53, altKeyCode: 101 },
				{ id: '6', title: '6', type: 'number', index: 8, keyCode: 54, altKeyCode: 102 },
				{ id: '*', title: '*', type: 'operation', index: 9, color: '#FF8500', keyCode: 106, altKeyCode: 56 },

				{ id: '1', title: '1', type: 'number', index: 10, keyCode: 49, altKeyCode: 97 },
				{ id: '2', title: '2', type: 'number', index: 11, keyCode: 50, altKeyCode: 98 },
				{ id: '3', title: '3', type: 'number', index: 12, keyCode: 51, altKeyCode: 99 },
				{ id: '-', title: '-', type: 'operation', index: 13, color: '#FF8500', keyCode: 189, altKeyCode: 109 },

				{ id: '.', title: '.', type: 'sumbol', index: 14, keyCode: 190, altKeyCode: 110 },
				{ id: '0', title: '0', type: 'number', index: 15, keyCode: 48, altKeyCode: 96 },
				{ id: '=', title: '=', type: 'sumbol', index: 16, keyCode: 187, altKeyCode: 13 },
				{ id: '+', title: '+', type: 'operation', index: 17, color: '#FF8500', keyCode: 187, altKeyCode: 107 },
			]);

			// define empty list of elemetns positions
			this.elements = new calculator.Elements([]);
		},

		performCommand: function( command ) {
			var commandId = command.get( 'id' );

			// set operation
			if( command.isOperation() ) {
				this.set( 'operation', command );
				this.set( 'isSequence', false );
			}

			// clear
			if( command.isClear() ) {
				this.set( this.defaults );
			}

			// set number
			if( command.isNumber() ) {
				var activeOperandName = this.get( 'operation' ) ? 'accumulator' : 'operand';

				if( this.get( 'isSequence' ) ) {
					var currentDisplayVal = this.get( 'displayValue' ) == '0' ? '' : this.get( 'displayValue' );
					this.set( 'displayValue', currentDisplayVal + commandId );
				}
				else {
					this.set( 'displayValue', commandId );
				}

				this.set( activeOperandName, parseFloat( this.get( 'displayValue' ) ) );

				this.set( 'isSequence', true );
			}

			// set dot
			if( command.isDot() ) {
				var currentDisplayVal = this.get( 'displayValue' );

				// if the value does not contain dot
				if( !(~currentDisplayVal.indexOf(".")) ) {
					this.set( 'displayValue', currentDisplayVal + commandId );
				}
			}

			// calculate result
			if( command.isResult() ) {
				this.calculateResult();
			}
		},

		calculateResult: function() {
			var operation = this.get( 'operation' );
			if( !operation ) {
				return this;
			}

			var operand =  this.get( 'operand' );
			var accumulator = this.get( 'accumulator' );

			if( isNaN( operand ) || isNaN( accumulator ) ) {
				this.set( this.defaults );
				return this;
			}

			switch( operation.get( 'id' ) ) {
				case '+' : {
					operand = operand + accumulator;
					break;
				}
				case '-' : {
					operand = operand - accumulator;
					break;
				}
				case '*' : {
					operand = operand * accumulator;
					break;
				}
				case '/' : {
					if( accumulator != 0 ) {
						operand = operand / accumulator;
					}
					else {
						operand = accumulator;
					}

					break;
				}
				default: {
					break;
				}
			}

			// round value
			operand = Math.round( operand * 100000 ) / 100000;

			this.set( 'operand', operand );
			this.set( 'displayValue', operand );
		}

	});
});