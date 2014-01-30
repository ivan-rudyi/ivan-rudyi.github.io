var calculator = calculator || {};

$(function(){

	/**
	 * Model for represent commands
	 *
	 * @property string id 			Command unique sumbol
	 * @property string	title 		Display name
	 * @property string type		Type of command, available values operation|number|sumbol
	 * @property integer index		Position relative to other commands
	 * @property string color		HEX element background color
	 * @property string keyCode		keyboard key code
	 * @property string altKeyCode	keyboard alternative key code
	 */
	calculator.Command = Backbone.Model.extend({

		defaults: {
			id: '',
			title: '',
			type: 'number',
			index: 0,
			color: '#444444'
		},

		isOperation: function() {
			return this.get( 'type' ) == 'operation';
		},

		isClear: function() {
			return this.get( 'id' )  == 'c';
		},

		isResult: function() {
			return this.get( 'id' )  == '=';
		},

		isDot: function() {
			return this.get( 'id' )  == '.';
		},

		isNumber: function() {
			return this.get( 'type' ) == 'number';
		},
	});
});