
let EntityEnemyHeart = EntityEnemy.extend({
	size: {
		x: 64,
		y: 64
	},
	offset: {
		x: 0,
		y: 12
	},
	isBoss: true,
	isRoot: true,
	image: new Impact.Image("~/icons/sprite-enemy-heart.png"),
	health: 400,
	bullets: 16,
	killScore: 10000,
	moveTarget: {
		x: 0,
		y: 0
	},
	angleTarget: {
		x: 0,
		y: 0
	},
	explodeParticles: 40,
	killTimerTime: 0.3,
	attachmentPoints: [
		{ x: 40, y: 42, angle: -45 },
		{ x: 44, y: -20, angle: -110 }
	],
	init: function(x, y, settings) {
		this.parent(x, y - 18, settings);
		this.shootTimer = new Impact.Timer(2);
		this.angle = Math.PI / 2;
		this.moveTimer = new Impact.Timer(4);
		this.angleTarget = {
			x: Impact.system.width / 2,
			y: Impact.system.height / 2
		};
		this.moveTarget = {
			x: Impact.system.width / 2,
			y: Impact.system.height / 6
		};
	},
	speed: 20,
	maxVel: {
		x: 60,
		y: 70
	},
	friction: {
		x: 20,
		y: 20
	},
	update: function() {
		if (this.moveTimer.delta() > 0) {
			this.moveTarget = {
				x: (Math.random().map(0, 1, Impact.system.width / 3, Impact.system.width - Impact.system.width / 3)),
				y: (Math.random().map(0, 1, Impact.system.height / 8, Impact.system.height / 6))
			};
			this.moveTimer.set(Math.random() * 6 + 12);
			this.angleTarget = {
				x: Impact.game.player.pos.x,
				y: Impact.game.player.pos.y
			};
		}
		var a = (this.angle - this.angleToPoint(this.angleTarget.x, this.angleTarget.y)) * Impact.system.tick;
		this.angle -= a;
		if (Math.abs(this.pos.x - this.moveTarget.x) > 20) {
			this.accel.x = (this.pos.x - this.moveTarget.x) < 0 ? this.speed : -this.speed;
		} else {
			this.accel.x = 0;
		}
		if (Math.abs(this.pos.y - this.moveTarget.y) > 20) {
			this.accel.y = (this.pos.y - this.moveTarget.y) < 0 ? this.speed : -this.speed;
		} else {
			this.accel.y = 0;
		}
		this.last.x = this.pos.x;
		this.last.y = this.pos.y;
		this.vel.x = this.getNewVelocity(this.vel.x, this.accel.x, this.friction.x, this.maxVel.x);
		this.vel.y = this.getNewVelocity(this.vel.y, this.accel.y, this.friction.y, this.maxVel.y);
		this.pos.x += this.vel.x * Impact.system.tick;
		this.pos.y += this.vel.y * Impact.system.tick;
		if (this.children.length == 0 && this.shootTimer.delta() > 0) {
			var inc = 140 / (this.bullets - 1);
			var a2 = 20;
			var radius = 22;
			for (var i = 0; i < this.bullets; i++) {
				var angle = a2 * Math.PI / 180;
				var x = this.pos.x + 24 + Math.cos(angle) * radius;
				var y = this.pos.y + 44 + Math.sin(angle) * radius;
				Impact.game.spawnEntity(EntityEnemyBullet, x, y, {
					angle: angle
				});
				a2 += inc;
			}
			this.shootTimer.reset();
		}
		this.updateChildren();
	},
	kill: function() {
		this.parent();
		Impact.game.spawnEntity(EntityExplosionHuge, this.pos.x, this.pos.y);
		Impact.game.heart = null;
	}
});

let EntityExplosionHuge = Impact.Entity.extend({
	lifetime: 1,
	fadetime: 1,
	alpha: 0,
	img: new Impact.Image("~/sprites/explosion-huge.jpg",512,512),
	init: function(x, y, settings) {
		this.parent(x, y, settings);
		this.idleTimer = new Impact.Timer();
	},
	update: function() {
		if (this.idleTimer.delta() > this.lifetime) {
			this.kill();
			return;
		}
		this.alpha = this.idleTimer.delta().map(this.lifetime - this.fadetime, this.lifetime, 1, 0);
	},
	draw: function() {
		var ctx = Impact.system.context;
		ctx.save();
		var scale = this.alpha.map(0, 1, 10, 0);
		ctx.translate(this.pos.x - Impact.game._rscreen.x, this.pos.y - Impact.game._rscreen.y);
		ctx.scale(scale, scale);
		ctx.globalAlpha = this.alpha;
		this.img.draw(-256, -256);
		ctx.globalAlpha = 1;
		Impact.system.context.restore();
	}
});
