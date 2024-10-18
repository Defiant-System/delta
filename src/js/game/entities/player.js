
let EntityPlayer = Impact.Entity.extend({
	animSheet: new Impact.AnimationSheet("~/icons/sprite-ship.png", 48, 48),
	shieldAnimSheet: new Impact.AnimationSheet("~/icons/sprite-shield.png", 76, 76),
	size: {
		x: 24,
		y: 24
	},
	offset: {
		x: 24,
		y: 24
	},
	angle: -Math.PI / 2,
	targetAngle: -Math.PI / 2,
	xfriction: {
		x: 800,
		y: 800
	},
	maxVel: {
		x: 300,
		y: 300
	},
	speed: 110,
	// soundShoot: new Impact.Sound("media/sounds/plasma-burst.ogg"),
	// soundExplode: new Impact.Sound("media/sounds/explosion.ogg"),
	type: Impact.Entity.TYPE.A,
	init: function(x, y, settings) {
		this.parent(x, y, settings);
		this.addAnim("idle", 60, [0]);
		this.addAnim("shoot", 0.05, [3, 2, 1, 0], true);
		this.shield = new Impact.Animation(this.shieldAnimSheet, 1, [0]);
		this.shieldTimer = new Impact.Timer(2);
		this.lastShootTimer = new Impact.Timer(0);
		this.crosshair = Impact.game.crosshair;
		// this.soundShoot.volume = 0.7;
		Impact.game.player = this;
	},
	draw: function() {
		this.parent();
		if (this.shieldTimer) {
			this.shield.alpha = this.shieldTimer.delta().map(-0.5, 0, 0.5, 0).limit(0, 0.5);
			this.shield.draw(this.pos.x - 38 - Impact.game._rscreen.x, this.pos.y - 38 - Impact.game._rscreen.y);
		}
	},
	update: function() {
		if (this.shieldTimer) {
			this.shield.angle += .25 * Impact.system.tick;

			var d = this.shieldTimer.delta();
			if (d > 0) {
				this.shieldTimer = null;
			} else if (d < -1) {
				this.vel.y = d.map(-2, -1, -200, 0);
				this.parent();
				return;
			}
		}
		if (this.currentAnim.loopCount > 0) {
			this.currentAnim = this.anims.idle;
		}
		if (this.crosshair) {
			this.handleDesktopInput();
		} else {
			this.handleTouchInput();
		}
		this.currentAnim.angle = this.angle + Math.PI / 2;
		this.parent();
		if (this.pos.x < 0) {
			this.pos.x = 0;
		} else if (this.pos.x > Impact.system.width) {
			this.pos.x = Impact.system.width;
		}
		if (this.pos.y < 0) {
			this.pos.y = 0;
		} else if (this.pos.y > Impact.system.height) {
			this.pos.y = Impact.system.height;
		}
	},
	handleDesktopInput: function() {
		if (Impact.input.state("left")) {
			this.vel.x = -this.speed;
		} else if (Impact.input.state("right")) {
			this.vel.x = this.speed;
		} else {
			this.vel.x = 0;
		}
		if (Impact.input.state("up")) {
			this.vel.y = -this.speed;
		} else if (Impact.input.state("down")) {
			this.vel.y = this.speed;
		} else {
			this.vel.y = 0;
		}
		this.angle = this.angleTo(this.crosshair);
		var isShooting = Impact.input.state("shoot");
		if (isShooting && this.lastShootTimer.delta() > 0) {
			this.shoot();
			this.lastShootTimer.set(0.05);
		}
		if (isShooting && !this.wasShooting) {
			// play sound fx
			window.audio.play("plasma");
			this.wasShooting = true;
		} else if (this.wasShooting && !isShooting) {
			// stop sound fx
			window.audio.stop("plasma");
			this.wasShooting = false;
		}
	},
	handleTouchInput: function() {
		// var lstick = Impact.game.stickLeft;
		// this.vel.x = lstick.input.x * this.speed;
		// this.vel.y = lstick.input.y * this.speed;
		
		var isShooting = Impact.input.state("shoot");
		if (isShooting) {
			if (this.lastShootTimer.delta() > 0) {
				this.shoot();
				this.lastShootTimer.set(0.075);
			}
			if (!this.wasShooting) {
				// play sound fx
				window.audio.play("plasma");
				this.wasShooting = true;
			}
		} else if (this.wasShooting && !isShooting) {
			// stop sound fx
			window.audio.stop("plasma");
			this.wasShooting = false;
		}
	},
	// handleTouchInput_: function() {
	// 	var lstick = Impact.game.stickLeft;
	// 	this.vel.x = lstick.input.x * this.speed;
	// 	this.vel.y = lstick.input.y * this.speed;
	// 	var rstick = Impact.game.stickRight;
	// 	if (rstick.amount) {
	// 		this.angle = rstick.angle - Math.PI / 2;
	// 		if (this.lastShootTimer.delta() > 0) {
	// 			this.shoot();
	// 			this.lastShootTimer.set(0.05);
	// 		}
	// 	}
	// },
	kill: function() {
		// stop sound fx
		window.audio.stop("plasma");
		// play sound fx
		window.audio.play("blow-up");
		// grid explosion
		Bg.dispatch({ type: "explode", x: this.pos.x, y: this.pos.y, force: 1.35 });

		Impact.game.lastKillTimer.set(0.5);
		Impact.game.spawnEntity(EntityExplosionParticleBlue, this.pos.x, this.pos.y, { count: 40 });
		this.pos.y = Impact.system.height + 300;
		this.parent();
		Impact.game.loseLive();
	},
	shoot: function() {
		// this.currentAnim = this.anims.shoot.rewind();
		var angle = this.angle + Math.random() * 0.1 - 0.05;
		Impact.game.spawnEntity(EntityPlasma, this.pos.x - 1, this.pos.y - 1, { angle });
	}
});

let EntityPlasma = Impact.Entity.extend({
	speed: 1000,
	maxVel: {
		x: 1000,
		y: 1000
	},
	image: new Impact.Image("~/icons/sprite-plasma.png"),
	size: {
		x: 4,
		y: 4
	},
	offset: {
		x: 47,
		y: 47
	},
	checkAgainst: Impact.Entity.TYPE.B,
	init: function(x, y, settings) {
		this.parent(x, y, settings);
		this.vel.x = Math.cos(this.angle) * this.speed;
		this.vel.y = Math.sin(this.angle) * this.speed;
	},
	update: function() {
		this.pos.x += this.vel.x * Impact.system.tick;
		this.pos.y += this.vel.y * Impact.system.tick;
		if (this.pos.x > Impact.system.width + 200 || this.pos.y > Impact.system.height + 200 || this.pos.x < -200 || this.pos.y < -200) {
			this.kill();
		}
	},
	draw: function() {
		Impact.system.context.save();
		Impact.system.context.translate(this.pos.x - Impact.game._rscreen.x, this.pos.y - Impact.game._rscreen.y);
		Impact.system.context.rotate(this.angle + Math.PI / 2);
		Impact.system.context.drawImage(this.image.data, -this.offset.x, -this.offset.y);
		Impact.system.context.restore();
	},
	check: function(other) {
		if (other instanceof EntityEnemy) {
			other.receiveDamage(10, this);
			this.kill();
		}
	}
});

let EntityExplosionParticleBlue = EntityParticles.extend({
	lifetime: 1,
	fadetime: 1,
	vel: {
		x: 360,
		y: 360
	},
	image: new Impact.Image("~/icons/sprite-blue-explosion.png")
});
