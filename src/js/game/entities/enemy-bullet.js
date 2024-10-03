
let EntityEnemyBullet = EntityEnemy.extend({
	size: {
		x: 20,
		y: 24
	},
	offset: {
		x: 12,
		y: 28
	},
	image: new Impact.Image("~/icons/sprite-enemy-bullet.png"),
	explodeParticles: 3,
	killTimerTime: 0,
	health: 10,
	speed: 170,
	killScore: 0,
	hitScore: 0
});
