var platform = platform || {};

$(function(){
	platform.Desktop = Backbone.Model.extend({

		initialize: function() {
			var desktop = this;

			desktop.applications = new platform.Applications;
			desktop.applications.on("reset", function(models, options) {});

			// collection models must be preloaded without using fetch
			// http://backbonejs.org/#FAQ-bootstrap
			$.getJSON('applications/list.json', function (json) {
				desktop.applications.reset( json );
			});
		}

	});
});