
let EntityCrosshair = Impact.Entity.extend({
	animSheet: new Impact.AnimationSheet('~/icons/sprite-crosshair-1.png', 32, 32),
	size: {
		x: 2,
		y: 2
	},
	offset: {
		x: 16,
		y: 16
	},
	type: Impact.Entity.TYPE.NONE,
	init: function(x, y, settings) {
		this.parent(x, y, settings);
		this.addAnim('idle', 60, [0]);
	},
	update: function() {
		this.pos.x = Impact.input.mouse.x;
		this.pos.y = Impact.input.mouse.y;
		this.currentAnim.angle -= 3 * Impact.system.tick;
	}
});
