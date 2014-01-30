var calculator = calculator || {};

$(function(){
	calculator.Commands = Backbone.Collection.extend({
		model: calculator.Command,
	});
});