var platform = platform || {};

$(function(){
	platform.DesktopView = Backbone.View.extend({
		events: {
			"click > canvas": "openApllication",
			'mouseup > canvas': 'unpressShortcut',
			'mouseout > canvas': 'unpressShortcut',
			'mousedown > canvas': 'pressShortcut'
		},

		desktopTemplate: _.template($('#desktop-template').html()),

		shortcutConfig: {
			width: 64,
			height: 64,
			iconWidth: 64,
			iconHeight: 64,
		},

		initialize: function() {
			this.listenTo(this.model.applications, 'reset', this.render);

			this.shortcutConfig.offsetLeft = Math.floor(( this.shortcutConfig.height - this.shortcutConfig.iconHeight ) / 2);
			this.shortcutConfig.offsetTop = Math.floor(( this.shortcutConfig.width - this.shortcutConfig.iconWidth ) / 2);
		},

		render: function() {
			$('#platform').html(
				this.desktopTemplate({ 'id': this.model.id })
			);

			// set element after it is generated from template
			this.setElement( '#' + this.model.id + '-desktop' );

			// set content area size
			this.refreshContentAreaSize();

			this.$content = this.$el.children();
			this.drawContext = this.$content.get(0).getContext("2d");
			
			// add shortcuts of apllications on desktop
			this.renderShortcuts();

			return this;
		},

		renderShortcuts: function() {
			$content = this.$content;

			var contentSize = {
				width: this.$content.width(),
				height: this.$content.height(),
			}

			var countShortcutsPerRow = Math.floor( contentSize.width / this.shortcutConfig.width );
			var currentRow = 0;

			var desktopView = this;
			this.model.applications.each(function(application, index) {
				currentColumn = index % countShortcutsPerRow;
				if( ( index != 0 ) && ( currentColumn == 0 ) ) {
					currentRow += 1;
				}

				var currentShortcut = {
					left: desktopView.shortcutConfig.width * currentColumn,
					top: desktopView.shortcutConfig.height * currentRow
				};

				// TODO move shorcut position attributes from application, make collection for shortcuts
				application.set( 'shortcutId', currentShortcut.left + 'x' + currentShortcut.top );
				application.set( 'shortcutPosition', currentShortcut );

				desktopView.drawShortcut( application );
			});
		},

		drawShortcut: function( application ) {
			var desktopView = this;

			// preload image
			application.iconImage = new Image;
			$(application.iconImage).attr('src', application.get( 'icon' ) );
			
			// on load application shortcut display it
			application.iconImage.onload = (function(){
				var shortcutPosition = application.get( 'shortcutPosition' );

				desktopView.drawContext.fillStyle="#FFFFFF";
				desktopView.drawContext.clearRect(
					shortcutPosition.left + desktopView.shortcutConfig.offsetLeft, 
					shortcutPosition.top + desktopView.shortcutConfig.offsetTop, 
					$(application.iconImage).get(0).naturalWidth,
					$(application.iconImage).get(0).naturalHeight
				);


				desktopView.drawContext.drawImage( 
					application.iconImage, 
					shortcutPosition.left + desktopView.shortcutConfig.offsetLeft,  
					shortcutPosition.top + desktopView.shortcutConfig.offsetTop
				);
			});
		},

		getActiveApllication: function( event ) {
			var offsetX = event.offsetX || 0;
			var offsetY = event.offsetY || 0;
			currentShortcut = {
				left: (offsetX - offsetX % this.shortcutConfig.width),
				top: (offsetY - offsetY % this.shortcutConfig.height)
			};

			application = this.model.applications.findWhere({
				shortcutId: currentShortcut.left + 'x' + currentShortcut.top
			});


			return application;
		},

		openApllication: function( event ) {
			application = this.getActiveApllication( event );

			if( application ) {
				this.listenToOnce( application, 'application:ready', this.openApplicationWindow );
				application.open();
			}
		},

		openApplicationWindow: function( options ) {
			var application = options.application;

			// create window if it is not exists
			var appWindowId = '#' + application.id + '-window';
			if( this.$content.parent().find( appWindowId ).length < 1 ) {
				new platform.ApplicationWindowView({ model: application, parentView: this });
			}
		},

		unpressShortcut: function( event ) {
			application = this.getActiveApllication( event );

			if( application ) {
				this.drawContext.globalAlpha = 1;
				
				// change state without animation
				this.drawShortcut( application );
			}
		},

		pressShortcut: function( event ) {
			application = this.getActiveApllication( event );

			if( application ) {
				this.drawContext.globalAlpha = 0.7;

				// change state without animation
				this.drawShortcut( application );
			}
		},

		refreshContentAreaSize: function() {
			var $contentArea = this.$el.children();

			$contentArea.attr( 'width', this.$el.width() );
			$contentArea.attr( 'height', this.$el.height() );
		}
	});
});