
Impact.ImpactSplashLoader = Impact.Loader.extend({
	init: function(gameClass, resources) {
		this.parent(gameClass, resources);
	},
	end: function() {
		this.parent();
		Impact.system.setDelegate(this);
	},
	run: function() {
		Impact.system.setDelegate(Impact.game);
		Impact.system.stopRunLoop();
	},
	draw: function() {}
});
