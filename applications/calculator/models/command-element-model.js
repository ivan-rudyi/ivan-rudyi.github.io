var calculator = calculator || {};

$(function(){

	/**
	 * Model for represent the graphic element according to commands
	 *
	 * @property string commandId	Identifier of corresponding command
	 * @property integer left 	 	Offset horizontally position of element on display
	 * @property integer top 		Offset vertically position of element on display
	 * @property integer keyCode	Keyboard key code for press element
	 * @property integer width
	 * @property integer height
	 * @property integer isPressed	current state
	 * @property object graphicOptions
	 */
	calculator.Element = Backbone.Model.extend({
		defaults: {
			commandId: '',
			left: 0,
			top: 0,
			width: 0,
			height: 0,
			isPressed: false,
			graphicOptions: {},
		},

		isDisplay: function() {
			return this.get( 'commandId' ) == 'display';
		},
	});
});