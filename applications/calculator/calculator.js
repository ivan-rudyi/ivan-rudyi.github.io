var calculator = calculator || {};

$(function(){
	// run app

	// ...create app
	var calculatorModel = new calculator.Calculator;

	// ...render app view
	new calculator.CalculatorView({ model: calculatorModel, el: $('#calculator-app') });
});