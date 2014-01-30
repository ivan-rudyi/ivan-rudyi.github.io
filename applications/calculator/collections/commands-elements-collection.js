var calculator = calculator || {};

$(function(){
	calculator.Elements = Backbone.Collection.extend({
		model: calculator.Element,

		getDisplay: function() {
			return this.findWhere( {commandId: 'display'} );
		}
	});

	// define emplty list of elements
	calculator.elements = new calculator.Elements([]);
});