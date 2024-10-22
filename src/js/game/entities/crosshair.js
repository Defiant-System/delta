
let EntityCrosshair = Impact.Entity.extend({
	bgSheet: new Impact.AnimationSheet("~/icons/sprite-crosshair-1.png", 48, 48),
	animSheet: new Impact.AnimationSheet("~/icons/sprite-crosshair-2.png", 48, 48),
	size: {
		x: 2,
		y: 2
	},
	offset: {
		x: 16,
		y: 16
	},
	fade: {
		out: false,
		alpha: 1
	},
	type: Impact.Entity.TYPE.NONE,
	init: function(x, y, settings) {
		// scale entity
		this.size.x *= Impact.system.scale;
		this.size.y *= Impact.system.scale;
		this.offset.x *= Impact.system.scale;
		this.offset.y *= Impact.system.scale;
		
		// this.bgSheet.width *= Impact.System.scale;
		// this.bgSheet.height *= Impact.System.scale;
		// this.animSheet.width *= Impact.System.scale;
		// this.animSheet.height *= Impact.System.scale;

		this.def = {
			x: (window.innerWidth - 24) >> 1,
			y: (window.innerHeight - 103) >> 1,
		};
		this.parent(x, y, settings);
		this.addAnim("idle", 60, [0]);
		this.bg = new Impact.Animation(this.bgSheet, 1, [0]);
	},
	dispose: function() {
		this.fade.out = true;
	},
	update: function() {
		if (this.fade.out) {
			this.fade.alpha -= .05;
			if (this.fade.alpha <= 0) {
				Impact.game.removeEntity(this);
				return;
			}
		}
		this.pos.x = Impact.input.mouse.x || this.def.x;
		this.pos.y = Impact.input.mouse.y || this.def.y;
		this.currentAnim.angle += .5 * Impact.system.tick;
	},
	draw: function() {
		var ctx = Impact.system.context;
		ctx.save();
		ctx.globalAlpha = this.fade.alpha;

		this.parent();
		this.bg.draw(this.pos.x - this.offset.x, this.pos.y - this.offset.y);

		ctx.restore();
	}
});
