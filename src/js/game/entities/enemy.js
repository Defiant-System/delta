
let EntityEnemy = Impact.Entity.extend({
	speed: 0,
	hitTimer: null,
	dead: false,
	angle: 0,
	killScore: 10,
	hitScore: 10,
	children: [],
	parentNode: null,
	nodeOffset: {
		x: 0,
		y: 0
	},
	pivot: {
		x: 0,
		y: 0
	},
	maxVel: {
		x: 1000,
		y: 1000
	},
	explodeParticles: 10,
	attachmentPoints: [],
	type: Impact.Entity.TYPE.B,
	checkAgainst: Impact.Entity.TYPE.A,
	killTimerTime: 0.3,
	init: function(x, y, settings) {
		this.parent(x, y, settings);
		this.hitTimer = new Impact.Timer(0);
		this.dieTimer = new Impact.Timer(0);
		this.ownAngle = this.angle;
	},
	angleToPoint: function(x, y) {
		return Math.atan2(y - (this.pos.y + this.size.y / 2), x - (this.pos.x + this.size.x / 2));
	},
	update: function() {
		if (!this.isChild) {
			this.vel.x = Math.cos(this.angle) * this.speed;
			this.vel.y = Math.sin(this.angle) * this.speed;
			this.parent();
			if (this.pos.x < -this.image.width || this.pos.x > Impact.system.width + 10 || this.pos.y > Impact.system.height + 10 || this.pos.y < -this.image.height - 30) {
				this.kill();
			}
		}
	},
	attachChild: function(entityClass) {
		var ap = this.attachmentPoints.shift();
		var c = this.addChild(entityClass, ap.x, ap.y, {
			angle: (ap.angle * Math.PI) / 180
		});
		return c;
	},
	addChild: function(entityClass, x, y, settings) {
		var c = Impact.game.spawnEntity(entityClass, 0, 0, settings);
		c.entityType = entityClass;
		c.nodeOffset.x = x;
		c.nodeOffset.y = y;
		c.isChild = true;
		c.parentNode = this;
		this.children.push(c);
		return c;
	},
	updateChildren: function() {
		if (!this.children.length) return;
		var sv = Math.sin(this.angle - Math.PI / 2),
			cv = Math.cos(this.angle - Math.PI / 2);
		for (var i = 0; i < this.children.length; i++) {
			var c = this.children[i];
			var cx = c.nodeOffset.x,
				cy = c.nodeOffset.y;
			c.pos.x = this.pos.x + cv * cx - sv * cy - c.size.x / 2 + this.size.x / 2;
			c.pos.y = this.pos.y + cv * cy + sv * cx - c.size.y / 2 + this.size.y / 2;
			c.angle = this.angle + c.ownAngle;
			c.updateChildren();
		}
	},
	// ORIGINAL
	// draw2: function() {
	// 	var sx = this.image.width / 2,
	// 		sy = this.image.height / 2;

	// 	Impact.system.context.save();
	// 	Impact.system.context.globalCompositeOperation = "source-over";
	// 	Impact.system.context.translate(this.pos.x - Impact.game._rscreen.x - this.offset.x + sx, this.pos.y - Impact.game._rscreen.y - this.offset.y + sy);
	// 	Impact.system.context.rotate(this.angle - Math.PI / 2);
	// 	Impact.system.context.drawImage(this.image.data, -sx, -sy);
	// 	Impact.system.context.restore();
	// },
	draw: function() {
		var sx = this.image.width / 2,
			sy = this.image.height / 2;
		
		if (!this.isBoss) {
			Impact.system.context.save();
			Impact.system.context.globalCompositeOperation = "source-over";
			Impact.system.context.translate(this.pos.x - Impact.game._rscreen.x - this.offset.x + sx, this.pos.y - Impact.game._rscreen.y - this.offset.y + sy);
			Impact.system.context.rotate(this.angle - Math.PI / 2);
			Impact.system.context.drawImage(this.image.data, -sx, -sy);
			Impact.system.context.restore();
		} else if (this.isBoss) {
			Impact.game.off1.ctx.save();
			Impact.game.off1.ctx.translate(this.pos.x - Impact.game._rscreen.x - this.offset.x + sx, this.pos.y - Impact.game._rscreen.y - this.offset.y + sy);
			Impact.game.off1.ctx.rotate(this.angle - Math.PI / 2);
			Impact.game.off1.ctx.drawImage(this.image.data, -sx, -sy);
			Impact.game.off1.ctx.restore();

			if (this.isRoot) {
				Impact.system.context.drawImage(Impact.game.off1.cvs[0], 0, 0);
				Impact.game.off1.cvs.attr({ width: Impact.system.width });
			}
		}
	},
	// draw3: function() {
	// 	var sx = this.image.width / 2,
	// 		sy = this.image.height / 2;
		
	// 	if (!this.isBoss) {
	// 		Impact.system.context.save();
	// 		Impact.system.context.globalCompositeOperation = "source-over";
	// 		Impact.system.context.translate(this.pos.x - Impact.game._rscreen.x - this.offset.x + sx, this.pos.y - Impact.game._rscreen.y - this.offset.y + sy);
	// 		Impact.system.context.rotate(this.angle - Math.PI / 2);
	// 		Impact.system.context.drawImage(this.image.data, -sx, -sy);
	// 		Impact.system.context.restore();
	// 	} else if (this.isBoss) {
	// 		Impact.game.off1.ctx.save();
	// 		Impact.game.off1.ctx.translate(this.pos.x - Impact.game._rscreen.x - this.offset.x + sx, this.pos.y - Impact.game._rscreen.y - this.offset.y + sy);
	// 		Impact.game.off1.ctx.rotate(this.angle - Math.PI / 2);
	// 		Impact.game.off1.ctx.drawImage(this.image.data, -sx, -sy);
	// 		Impact.game.off1.ctx.restore();

	// 		if (this.isRoot) {
	// 			let dArr = [-1,-1, 0,-1, 1,-1, -1,0, 1,0, -1,1, 0,1, 1,1], // offset array
	// 				s = 1,  // thickness scale
	// 				i = 0,  // iterator
	// 				x = 5,  // final position
	// 				y = 5,
	// 				w = Impact.system.width,
	// 				h = Impact.system.height;

	// 			Impact.game.off2.cvs.attr({ width: w });

	// 			// draw images at offsets from the array scaled by s
	// 			for(; i<dArr.length; i+=2) {
	// 				Impact.game.off2.ctx.drawImage(Impact.game.off1.cvs[0], x + dArr[i]*s, y + dArr[i+1]*s);
	// 			}

	// 			// fill with color
	// 			Impact.game.off2.ctx.globalCompositeOperation = "source-in";
	// 			Impact.game.off2.ctx.fillStyle = "#fff";
	// 			Impact.game.off2.ctx.fillRect(0, 0, w, h);

	// 			Impact.game.off2.ctx.globalCompositeOperation = "source-over";
	// 			Impact.game.off2.ctx.drawImage(Impact.game.off1.cvs[0], x, y);

	// 			Impact.system.context.drawImage(Impact.game.off2.cvs[0], 0, 0);
	// 			Impact.game.off1.cvs.attr({ width: w });
	// 		}
	// 	}
	// },
	receiveDamage: function(amount, other) {
		var childTookDamage = false;
		if (this.health <= 10 && this.children.length) {
			for (var i = 0; i < this.children.length; i++) {
				childTookDamage = this.children[i].receiveSilentDamage(amount);
				if (childTookDamage)
					break;
			}
		}
		if (!childTookDamage) {
			this.parent(amount);
		}
		this.hitTimer.set(0.3);
		Impact.game.score += this.hitScore;
		if (this.health <= 0) {
			// play sound fx
			window.audio.play("explosion");
			this.explode();
			Impact.game.lastKillTimer.set(this.killTimerTime);
			Impact.game.score += this.killScore;
			// update hud
			xwing.game.dispatch({ type: "update-score", value: Impact.game.score });
		} else {
			var px = other.pos.x - other.size.x / 2;
			var py = other.pos.y - other.size.y / 2;
			Impact.game.spawnEntity(EntityExplosionParticleLargeSlow, px, py, { count: 1 });
		}
	},
	receiveSilentDamage: function(amount) {
		if (this.health <= 10 && this.children.length) {
			for (var i = 0; i < this.children.length; i++) {
				var childTookDamage = this.children[i].receiveSilentDamage(amount);
				if (childTookDamage) {
					return true;
				}
			}
		} else if (this.health > 10) {
			this.health -= amount;
			return true;
		}
		return false;
	},
	explode: function() {
		var px = this.pos.x + this.size.x / 2;
		var py = this.pos.y + this.size.y / 2;
		Impact.game.spawnEntity(EntityExplosionParticleLarge, px, py, { count: this.explodeParticles });
		// grid explosion
		let force = Math.clamp(this.explodeParticles / 10, .9, 2.35);
		Bg.dispatch({ type: "explode", x: px, y: py, force });
	},
	kill: function(killedByParent) {
		for (var i = 0; i < this.children.length; i++) {
			this.children[i].explode();
			this.children[i].kill(true);
		}
		if (killedByParent) {
			Impact.game.score += this.killScore;
		}
		if (this.parentNode && !killedByParent) {
			this.parentNode.children.erase(this);
		}
		this.parent();
	},
	check: function(other) {
		if (!other.shieldTimer) {
			other.kill();
			this.kill();
		} else {
			this.receiveDamage(1000, other);
		}
	}
});

let EntityExplosionParticleLarge = EntityParticles.extend({
	lifetime: 1,
	fadetime: 1,
	vel: {
		x: 150,
		y: 150
	},
	image: new Impact.Image("~/icons/sprite-enemy-explosion.png")
});

let EntityExplosionParticleLargeSlow = EntityParticles.extend({
	lifetime: 1,
	fadetime: 1,
	vel: {
		x: 20,
		y: 20
	},
	image: new Impact.Image("~/icons/sprite-enemy-explosion.png")
});
