var platform = platform || {};

$(function(){
	platform.Applications = Backbone.Collection.extend({
		model: platform.Application,
	});


});