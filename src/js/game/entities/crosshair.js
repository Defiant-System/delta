
let EntityCrosshair = Impact.Entity.extend({
	bgSheet: new Impact.AnimationSheet("~/icons/sprite-crosshair-1.png", 48, 48),
	animSheet: new Impact.AnimationSheet("~/icons/sprite-crosshair-2.png", 48, 48),
	size: {
		x: 2,
		y: 2
	},
	offset: {
		x: 24,
		y: 24
	},
	fade: {
		out: false,
		alpha: 1
	},
	type: Impact.Entity.TYPE.NONE,
	init: function(x, y, settings) {
		// scale entity
		this.offset.x = Math.round(this.bgSheet.width / 2);
		this.offset.y = Math.round(this.bgSheet.height / 2);
		
		this.def = {
			x: (window.innerWidth - 24) >> 1,
			y: (window.innerHeight - 103) >> 1,
		};
		this.parent(x, y, settings);
		this.addAnim("idle", 1, [0]);
		this.bg = new Impact.Animation(this.bgSheet, 1, [0]);

		if (Game.scale === .9) {
			this.currentAnim.pivot.x = 19.5;
			this.currentAnim.pivot.y = 19.5;
		}
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
		this.currentAnim.angle += 4.5 * Impact.system.tick;
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
