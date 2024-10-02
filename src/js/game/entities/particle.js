
let EntityParticles = Impact.Class.extend({
	type: Impact.Entity.TYPE.NONE,
	checkAgainst: Impact.Entity.TYPE.NONE,
	collides: Impact.Entity.COLLIDES.NEVER,
	lifetime: 5,
	fadetime: 1,
	_vel: null,
	_pos: null,
	vel: {
		x: 0,
		y: 0
	},
	image: null,
	alpha: 1,
	count: 10,
	init: function(x, y, settings) {
		this.count = settings.count || this.count;
		var l = this.count * 2;
		x -= this.image.width / 2;
		y -= this.image.height / 2;
		this._vel = Array(l);
		this._pos = Array(l);
		for (var i = 0; i < l; i += 2) {
			this._vel[i] = (Math.random() * 2 - 1) * this.vel.x;
			this._vel[i + 1] = (Math.random() * 2 - 1) * this.vel.y;
			this._pos[i] = x;
			this._pos[i + 1] = y;
		}
		this.idleTimer = new Impact.Timer();
	},
	update: function() {
		if (this.idleTimer.delta() > this.lifetime) {
			Impact.game.removeEntity(this);
			return;
		}
		this.alpha = this.idleTimer.delta().map(this.lifetime - this.fadetime, this.lifetime, 1, 0);
	},
	draw: function() {
		var l = this.count * 2;
		var p = this._pos
		  , v = this._vel
		  , t = Impact.system.tick
		  , ctx = Impact.system.context
		  , img = this.image.data
		  , sx = Impact.game._rscreen.x
		  , sy = Impact.game._rscreen.y;
		Impact.system.context.globalAlpha = this.alpha;
		for (var i = 0; i < l; i += 2) {
			p[i] += v[i] * t;
			p[i + 1] += v[i + 1] * t;
			ctx.drawImage(img, p[i] + sx, p[i + 1] + sy);
		}
		Impact.system.context.globalAlpha = 1;
	},
	erase: function() {}
});
