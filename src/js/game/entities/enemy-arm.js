
let EntityEnemyArm = EntityEnemy.extend({
	size: {
		x: 44,
		y: 44
	},
	offset: {
		x: 2,
		y: 2
	},
	isBoss: true,
	image: new Impact.Image('~/icons/sprite-enemy-arm.png'),
	health: 70,
	killScore: 50,
	explodeParticles: 5,
	attachmentPoints: [
		{ x: -8, y: 42, angle: 20 },
		{ x: 38, y: 12, angle: -70 },
		{ x: -38, y: 12, angle: 70 }
	],
	init: function(x, y, settings) {
		// scale entity
		this.size.x *= Game.scale;
		this.size.y *= Game.scale;
		this.offset.x *= Game.scale;
		this.offset.y *= Game.scale;
		this.attachmentPoints.map(p => {
			p.x *= Game.scale;
			p.y *= Game.scale;
		});

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
