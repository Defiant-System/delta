
let EntityCrosshair = Impact.Entity.extend({
	bgSheet: new Impact.AnimationSheet("~/icons/sprite-crosshair-1.png", 32, 32),
	animSheet: new Impact.AnimationSheet('~/icons/sprite-crosshair-2.png', 32, 32),
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
		this.bg = new Impact.Animation(this.bgSheet,1,[0]);
	},
	update: function() {
		this.pos.x = Impact.input.mouse.x;
		this.pos.y = Impact.input.mouse.y;
		this.currentAnim.angle -= 2 * Impact.system.tick;
	},
	draw: function() {
		this.parent();
		this.bg.draw(this.pos.x - 16, this.pos.y - 16);
	}
});
