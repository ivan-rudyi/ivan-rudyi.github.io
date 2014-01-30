var platform = platform || {};

$(function(){
	platform.Application = Backbone.Model.extend({

		open: function() {
			if( this.has( 'content' ) ) {
				this.trigger( 'application:ready', {application: this} );
			}
			else {
				this.load();
			}
		},

		load: function() {
			var appModel = this;

			$.ajax({
				type: 'GET',
				url: appModel.get( 'url' ),
				success: function( data, textStatus, jqXHR ) {
					appModel.set( 'content', data );
					appModel.trigger( 'application:ready', {application: appModel} );
				},
				error: function( jqXHR, textStatus, errorThrown ) {
					alert( 'Application is unavailable' );
				}
			});
		}

	});
});