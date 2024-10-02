
let EntityEnemyArm = EntityEnemy.extend({
	size: {
		x: 44,
		y: 44
	},
	offset: {
		x: 2,
		y: 2
	},
	image: new Impact.Image('media/sprites/arm.png'),
	health: 70,
	killScore: 50,
	explodeParticles: 5,
	attachmentPoints: [{
		x: -8,
		y: 42,
		angle: 20
	}, {
		x: 32,
		y: 6,
		angle: -70
	}, {
		x: -32,
		y: 6,
		angle: 70
	}],
	init: function(x, y, settings) {
		this.parent(x, y - 18, settings);
		this.moveTimer = new Impact.Timer();
		this.angle = Math.PI / 2;
		this.startAngle = this.ownAngle;
	},
	update: function() {
		this.parent();
		this.ownAngle = this.startAngle + Math.cos(this.moveTimer.delta()) * 0.05;
	}
});
