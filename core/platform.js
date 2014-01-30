var platform = platform || {};

$(function(){
	// run app
	var desktop = new platform.Desktop({id:'default'});

	new platform.DesktopView({ model: desktop });
});