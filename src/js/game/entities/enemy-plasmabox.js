
let EntityEnemyPlasmabox = EntityEnemy.extend({
	size: {
		x: 44,
		y: 44
	},
	offset: {
		x: 2,
		y: 2
	},
	image: new Impact.Image('media/sprites/plasmabox.png'),
	health: 180,
	reloadTime: 4,
	bullets: 32,
	explodeParticles: 10,
	killScore: 400,
	init: function(x, y, settings) {
		this.parent(x, y - 18, settings);
		this.moveTimer = new Impact.Timer();
		this.angle = Math.PI / 2;
		this.startAngle = this.ownAngle;
		this.shootTimer = new Impact.Timer(Math.random() * this.reloadTime * 2);
	},
	update: function() {
		this.parent();
		if (this.shootTimer.delta() > 0) {
			var inc = 360 / (this.bullets - 1);
			var a = 0;
			var radius = 0;
			for (var i = 0; i < this.bullets; i++) {
				var angle = a * Math.PI / 180;
				var x = this.pos.x + 18;
				var y = this.pos.y + 18;
				Impact.game.spawnEntity(EntityEnemyPlasmaBullet, x, y, {
					angle: angle
				});
				a += inc;
			}
			this.shootTimer.set(this.reloadTime);
		}
	}
});

let EntityEnemyPlasmaBullet = EntityEnemy.extend({
	size: {
		x: 8,
		y: 8
	},
	offset: {
		x: 28,
		y: 28
	},
	image: new Impact.Image('media/sprites/pbullet.png'),
	health: 10,
	speed: 10,
	maxSpeed: 160,
	type: Impact.Entity.TYPE.NONE,
	update: function() {
		this.speed = Math.min(this.maxSpeed, this.speed + Impact.system.tick * 100);
		this.vel.x = Math.cos(this.angle) * this.speed;
		this.vel.y = Math.sin(this.angle) * this.speed;
		this.pos.x += this.vel.x * Impact.system.tick;
		this.pos.y += this.vel.y * Impact.system.tick;
		if (this.pos.x > Impact.system.width + 200 || this.pos.y > Impact.system.height + 200 || this.pos.x < -200 || this.pos.y < -200) {
			this.kill();
		}
	},
	draw: function() {
		Impact.system.context.drawImage(this.image.data, this.pos.x - Impact.game._rscreen.x - this.offset.x, this.pos.y - Impact.game._rscreen.y - this.offset.y);
	}
});
