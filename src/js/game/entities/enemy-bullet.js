
let EntityEnemyBullet = EntityEnemy.extend({
	size: {
		x: 16,
		y: 16
	},
	offset: {
		x: 2,
		y: 4
	},
	image: new Impact.Image("~/icons/sprite-enemy-bullet.png"),
	explodeParticles: 3,
	killTimerTime: 0,
	health: 10,
	speed: 170,
	killScore: 0,
	hitScore: 0
});
