
Number.zeroes = '000000000000';

Number.prototype.zeroFill = function(d) {
	var s = this.toString();
	return Number.zeroes.substr(0, d - s.length) + s;
};

let XType = Impact.Game.extend({
	menu: null,
	mode: 0,
	font: new Impact.Font('media/fonts/tungsten-48.png'),
	fontSmall: new Impact.Font('media/fonts/tungsten-18.png'),
	backdrop: new Impact.Image('media/background/backdrop.png'),
	grid: new Impact.Image('media/background/grid.png'),
	music: new Impact.Sound('media/music/xtype.ogg',false),
	title: new Impact.Image('media/xtype-title.png'),
	pauseButton: new Impact.Image('media/pause-button.png'),
	madeWithImpact: new Impact.Image('media/made-with-impact.png'),
	instructions: new Impact.Image('media/instructions-' + (Impact.ua.mobile ? 'mobile' : 'desktop') + '.png'),
	score: 0,
	lives: 3,
	level: {
		level: 0,
		support: 1,
		plasma: 0,
		missile: 0
	},
	stickLeft: null,
	stickRight: null,
	init: function() {
		var bgmap = new Impact.BackgroundMap(620,[[1]],this.grid);
		bgmap.repeat = true;
		this.backgroundMaps.push(bgmap);
		if (!Impact.ua.mobile) {
			Impact.input.bind(Impact.KEY.MOUSE1, 'shoot');
			Impact.input.bind(Impact.KEY.UP_ARROW, 'up');
			Impact.input.bind(Impact.KEY.DOWN_ARROW, 'down');
			Impact.input.bind(Impact.KEY.LEFT_ARROW, 'left');
			Impact.input.bind(Impact.KEY.RIGHT_ARROW, 'right');
			Impact.input.bind(Impact.KEY.W, 'up');
			Impact.input.bind(Impact.KEY.S, 'down');
			Impact.input.bind(Impact.KEY.A, 'left');
			Impact.input.bind(Impact.KEY.D, 'right');
			Impact.input.bind(Impact.KEY.ENTER, 'ok');
			Impact.input.bind(Impact.KEY.ESC, 'menu');
			Impact.music.volume = 0.6;
			Impact.music.add(this.music);
		} else {
			var radius = 60;
			var margin = 20;
			var y = Impact.system.height - radius - margin;
			var x1 = radius + margin;
			var x2 = Impact.system.width - radius - margin;
			this.stickLeft = new Impact.AnalogStick(x1,y,radius,30);
			this.stickRight = new Impact.AnalogStick(x2,y,radius,30);
		}
		this.reset();
		this.setTitle();
		XType.initialized = true;
	},
	reset: function() {
		this.heart = null;
		this.lastKillTimer = new Impact.Timer(-2);
		this.entities = [];
		this.entitiesSortedByPosTypeA = [];
		this.entitiesSortedByPosTypeB = [];
		this.score = 0,
		this.lives = 3,
		this.level = {
			level: 0,
			support: 1,
			plasma: 0,
			missile: 0
		};
	},
	setGame: function() {
		// window.scrollTo(0, 0);
		Impact.music.play();
		Impact.system.canvas.style.cursor = '';
		this.menu = null;
		this.initTimer = new Impact.Timer(3);
		this.lastKillTimer.reset();
		if (!Impact.ua.mobile) {
			this.crosshair = this.spawnEntity(EntityCrosshair, 0, 0);
		}
		this.bossEndTimer = null;
		this.player = this.spawnEntity(EntityPlayer, Impact.system.width / 2, Impact.system.height + 24);
		this.mode = XType.MODE.GAME;
	},
	setTitle: function() {
		this.reset();
		this.mode = XType.MODE.TITLE;
		this.menu = new TitleMenu();
		Impact.$('#scoreBox').style.display = 'none';
	},
	setGameOver: function() {
		if (this.score > 0) {
			var name = this.getCookie('scoreName');
			if (name) {
				Impact.$('#scoreName').value = name;
			}
			Impact.$('#scoreBox').style.display = 'block';
			Impact.$('#scoreForm').style.display = 'block';
			Impact.$('#scoreResponse').style.display = 'none';
		}
		if (Impact.ua.android) {
			Impact.$('#scoreButton').focus();
		}
		this.mode = XType.MODE.GAME_OVER;
		this.menu = new GameOverMenu();
	},
	toggleMenu: function() {
		if (this.mode == XType.MODE.TITLE) {
			if (this.menu instanceof TitleMenu) {
				this.menu = new PauseMenu();
			} else {
				this.menu = new TitleMenu();
			}
		} else {
			if (this.menu) {
				Impact.system.canvas.style.cursor = '';
				this.menu = null;
			} else {
				this.menu = new PauseMenu();
			}
		}
	},
	checkBoss: function() {
		if (!this.heart && !this.initTimer) {
			if (!this.bossEndTimer) {
				this.bossEndTimer = new Impact.Timer(2);
			} else if (this.bossEndTimer && this.bossEndTimer.delta() > 0) {
				this.bossEndTimer = null;
				this.spawnBoss();
			}
		}
	},
	spawnBoss: function() {
		this.heart = this.spawnEntity(EntityEnemyHeart, Impact.system.width / 2, 0);
		this.level.level += 1;
		this.level.support += 1;
		this.level.plasma += this.level.level % 2 ? 0 : 1;
		this.level.missile += this.level.level % 2 ? 1 : 0;
		for (var i = 0; i < this.level.support; i++) {
			this.spawEntityRandom(EntityEnemyArm);
		}
		for (i = 0; i < this.level.missile; i++) {
			this.spawEntityRandom(EntityEnemyMissilebox);
		}
		for (i = 0; i < this.level.plasma; i++) {
			this.spawEntityRandom(EntityEnemyPlasmabox);
		}
		this.mirrorChildren(this.heart, this.heart);
		this.heart.update();
		var ents = this.getEntitiesByType(EntityEnemyArm);
		var maxY = 0;
		for (i = 0; i < ents.length; i++) {
			maxY = Math.max(ents[i].pos.y, maxY);
		}
		this.heart.pos.y = -maxY - 120;
		this.heart.vel.y = 70;
		this.heart.update();
	},
	mirrorChildren: function(src, dest) {
		var l = src.children.length
		for (var i = 0; i < l; i++) {
			var srcEnt = src.children[i];
			var settings = {
				angle: -srcEnt.ownAngle
			};
			var destEnt = dest.addChild(srcEnt.entityType, -srcEnt.nodeOffset.x, srcEnt.nodeOffset.y, settings);
			this.mirrorChildren(srcEnt, destEnt);
		}
	},
	spawEntityRandom: function(type) {
		var ents = this.getEntitiesByType(EntityEnemyArm);
		ents.push(this.heart);
		for (var i = 0; i < 20; i++) {
			var e = ents.random();
			if (!e.attachmentPoints || !e.attachmentPoints.length) {
				continue;
			}
			if (type == EntityEnemyArm && e instanceof EntityEnemyArm && e.attachmentPoints.length != 3 && e.parentNode instanceof EntityEnemyHeart) {
				continue;
			}
			e.attachChild(type);
			return;
		}
	},
	update: function() {
		if (!this.menu && (Impact.input.pressed('menu') || (Impact.ua.mobile && Impact.input.pressed('shoot') && Impact.input.mouse.x < 100 && Impact.input.mouse.y < 100))) {
			this.toggleMenu();
		}
		if (this.menu) {
			this.backgroundMaps[0].scroll.y -= 100 * Impact.system.tick;
			this.menu.update();
			if (this.mode == XType.MODE.TITLE && Impact.input.pressed('shoot') && Impact.input.mouse.x > Impact.system.width - 154 && Impact.input.mouse.y > Impact.system.height - 56) {
				// window.location = 'http://impactjs.com/';
			}
			if (!(this.menu instanceof GameOverMenu)) {
				return;
			}
		}
		this.parent();
		this.backgroundMaps[0].scroll.y -= 100 * Impact.system.tick;
		if (this.mode == XType.MODE.GAME) {
			this.checkBoss();
		}
	},
	loseLive: function() {
		this.lives--;
		if (this.lives > 0) {
			this.player = this.spawnEntity(EntityPlayer, Impact.system.width / 2, Impact.system.height + 24);
			this.livesRemainingTimer = new Impact.Timer(2);
		} else {
			this.setGameOver();
		}
	},
	draw: function() {
		this.backdrop.draw(0, 0);
		var d = this.lastKillTimer.delta();
		Impact.system.context.globalAlpha = d < 0 ? d * -3 + 0.3 : 0.3;
		for (var i = 0; i < this.backgroundMaps.length; i++) {
			this.backgroundMaps[i].draw();
		}
		Impact.system.context.globalAlpha = 1;
		if (d < 0.5) {
			this._rscreen.x = Math.random() * 10 * (d - 0.5);
			this._rscreen.y = Math.random() * 10 * (d - 0.5);
		} else {
			this._rscreen.x = this._rscreen.y = 0;
		}
		Impact.system.context.globalCompositeOperation = 'lighter';
		for (var i = 0; i < this.entities.length; i++) {
			this.entities[i].draw();
		}
		Impact.system.context.globalCompositeOperation = 'source-over';
		if (this.mode == XType.MODE.GAME) {
			this.drawUI();
		} else if (this.mode == XType.MODE.TITLE) {
			this.drawTitle();
		}
		if (this.menu) {
			this.menu.draw();
		}
	},
	drawUI: function() {
		if (Impact.ua.mobile) {
			this.stickLeft.draw();
			this.stickRight.draw();
			this.pauseButton.draw(16, 10);
		}
		this.font.draw(this.score.zeroFill(6), Impact.system.width - 32, 32, Impact.Font.ALIGN.RIGHT);
		if (this.bossEndTimer) {
			var d = -this.bossEndTimer.delta();
			var a = d > 1.7 ? d.map(2, 1.7, 0, 1) : d < 1 ? d.map(1, 0, 1, 0) : 1;
			var xs = Impact.system.width / 2;
			var ys = Impact.system.height / 3 + (d < 1 ? Math.cos(1 - d).map(1, 0, 0, 250) : 0);
			var b = this.level.level;
			this.font.alpha = a;
			this.font.draw('Stage ' + b + ' Clear', xs, ys, Impact.Font.ALIGN.CENTER);
			this.font.alpha = 1;
		}
		if (this.livesRemainingTimer) {
			var d2 = -this.livesRemainingTimer.delta();
			var a2 = d2 > 1.7 ? d2.map(2, 1.7, 0, 1) : (d2 < 1 ? d2 : 1);
			var xs2 = Impact.system.width / 2;
			var ys2 = Impact.system.height / 3 + (d2 < 1 ? Math.cos(1 - d2).map(1, 0, 0, 250) : 0);
			this.font.alpha = Math.max(a2, 0);
			if (this.lives > 1) {
				this.font.draw(this.lives + ' Ships Remaining', xs2, ys2, Impact.Font.ALIGN.CENTER);
			} else {
				this.font.draw(this.lives + ' Ship Remaining', xs2, ys2, Impact.Font.ALIGN.CENTER);
			}
			this.font.alpha = 1;
			if (d2 < 0) {
				this.livesRemainingTimer = null;
			}
		}
		if (this.initTimer) {
			var initTime = this.initTimer.delta();
			if (initTime > 0) {
				this.initTimer = null;
				this.spawnBoss();
			}
			Impact.system.context.globalAlpha = initTime.map(-0.5, 0, 1, 0).limit(0, 1);
			if (Impact.ua.mobile) {
				this.instructions.draw(100, Impact.system.height - 210);
			} else {
				this.instructions.draw(25, 260);
			}
			Impact.system.context.globalAlpha = 1;
		}
	},
	drawTitle: function() {
		var xs = Impact.system.width / 2;
		var ys = Impact.system.height / 4;
		this.title.draw(96, 96);
		var xc = 8;
		var yc = Impact.system.height - 40;
		Impact.system.context.globalAlpha = 0.6;
		this.fontSmall.draw('Dominic Szablewski: Graphics & Programming', xc, yc);
		if (Impact.Sound.enabled) {
			this.fontSmall.draw('Andreas Loesch: Music', xc, yc + 20);
		}
		Impact.system.context.globalAlpha = 1;
		this.madeWithImpact.draw(Impact.system.width - 154, Impact.system.height - 56);
	},
	entitiesSortedByPosTypeA: [],
	entitiesSortedByPosTypeB: [],
	sortByYPos: function(a, b) {
		return a.pos.y - b.pos.y;
	},
	sortByYPosSize: function(a, b) {
		return (a.pos.y + a.size.y) - (b.pos.y + b.size.y);
	},
	spawnEntity: function(type, x, y, settings) {
		var entityClass = typeof (type) === 'string' ? Impact.global[type] : type;
		if (!entityClass) {
			throw ("Can't spawn entity of type " + type);
		}
		var ent = new (entityClass)(x,y,settings || {});
		this.entities.push(ent);
		if (ent.name) {
			this.namedEntities[ent.name] = ent;
		}
		if (ent.type || ent.checkAgainst) {
			if (ent.type == Impact.Entity.TYPE.A || (ent.checkAgainst & Impact.Entity.TYPE.B)) {
				this.entitiesSortedByPosTypeA.push(ent);
			} else {
				this.entitiesSortedByPosTypeB.push(ent);
			}
		}
		return ent;
	},
	removeEntity: function(ent) {
		if (ent.name) {
			delete this.namedEntities[ent.name];
		}
		if (ent.type || ent.checkAgainst) {
			if (ent.type == Impact.Entity.TYPE.A || (ent.checkAgainst & Impact.Entity.TYPE.B)) {
				this.entitiesSortedByPosTypeA.erase(ent);
			} else {
				this.entitiesSortedByPosTypeB.erase(ent);
			}
		}
		ent._killed = true;
		ent.checkAgainst = Impact.Entity.TYPE.NONE;
		ent.collides = Impact.Entity.COLLIDES.NEVER;
		this._deferredKill.push(ent);
	},
	checkEntities: function() {
		var seB = this.entitiesSortedByPosTypeA;
		var seA = this.entitiesSortedByPosTypeB;
		seA.sort(this.sortByYPosSize);
		seB.sort(this.sortByYPos);
		var c1 = 0
		  , c2 = 0;
		var k = 0
		  , e1 = null
		  , e2 = null
		  , my = 0
		  , noskip = true;
		for (var i = 0; i < seA.length; i++) {
			e1 = seA[i];
			noskip = true;
			my = e1.pos.y + e1.size.y;
			for (var j = k; j < seB.length && (e2 = seB[j]) && (e2.pos.y < my); j++) {
				if (noskip && e2.pos.y + e2.size.y < e1.pos.y) {
					k = j;
				} else {
					noskip = false;
				}
				if (e1.touches(e2)) {
					Impact.Entity.checkPair(e1, e2);
				}
			}
		}
	},
	submitScore: function() {
		var name = Impact.$('#scoreName').value;
		if (!name)
			return;
		Impact.$('#scoreName').blur();
		Impact.$('#scoreForm').style.display = 'none';
		Impact.$('#scoreResponse').style.display = 'block';
		Impact.$('#scoreResponse').innerHTML = 'Sending...';
		this.setCookie('scoreName', name, 100);
		var so = {
			stage: this.level.level,
			score: Math.floor(this.score),
			name: name
		};
		so.sh = (so.score + so.stage) ^ 0x8d525a2f;
		this.xhr('scores/index.php', so, this.scoreResponse.bind(this));
	},
	scoreResponse: function(data) {
		if (data.success) {
			Impact.$('#scoreResponse').innerHTML = 'Your Rank: #' + data.rank;
		} else {
			Impact.$('#scoreResponse').innerHTML = 'Failed. Sorry.';
		}
	},
	xhr: function(url, data, callback) {
		var post = [];
		if (data) {
			for (var key in data) {
				post.push(key + '=' + encodeURIComponent(data[key]));
			}
		}
		var postString = post.join('&');
		var xhr = new XMLHttpRequest();
		if (callback) {
			xhr.onreadystatechange = function() {
				if (xhr.readyState == 4) {
					callback(JSON.parse(xhr.responseText));
				}
			}
			;
		}
		xhr.open('POST', url);
		xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
		xhr.send(postString);
	},
	setCookie: function(name, value, days) {
		days = days || 1;
		var expire = new Date();
		expire.setTime(Date.now() + 3600000 * 24 * days);
		document.cookie = name + "=" + escape(value) + ";expires=" + expire.toGMTString();
	},
	getCookie: function(name) {
		var re = new RegExp('[; ]' + name + '=([^\\s;]*)');
		var match = (' ' + document.cookie).match(re);
		if (name && match) {
			return unescape(match[1]);
		} else {
			return null;
		}
	}
});

XType.MODE = {
	TITLE: 0,
	GAME: 1,
	GAME_OVER: 2,
	SCORES: 3
};

XType.paused = false;

XType.startGame = function() {
	Impact.Sound.channels = 2;
	Impact.System.drawMode = Impact.System.DRAW.SUBPIXEL;
	var width = 480;
	var height = 720;
	if (Impact.ua.mobile) {
		Impact.Sound.enabled = false;
		var wpw = window.innerWidth * Impact.ua.pixelRatio;
		var wph = window.innerHeight * Impact.ua.pixelRatio;
		var scale = width / wpw;
		height = wph * scale;
		Impact.internalScale = scale * Impact.ua.pixelRatio;
		var canvas = Impact.$('#canvas');
		canvas.style.width = Math.floor(window.innerWidth) + 'px';
		canvas.style.height = Math.floor(window.innerHeight) + 'px';
		Impact.$('#scoreBox').style.width = Math.floor(window.innerWidth) + 'px';
		Impact.$('#scoreBox').style.top = (240 / Impact.internalScale) + 'px';
		Impact.$('#scores').style.width = (410 / Impact.internalScale) + 'px';
		Impact.$('#scores').style.height = Math.floor(window.innerHeight) + 'px';
	} else {
		Impact.$('#canvas').className = 'desktop';
		Impact.$('#making-of').style.display = 'block';
		Impact.$('#scoreBox').style.bottom = 0;
		Impact.$('#scores').style.bottom = 0;
	}
	Impact.$('#scoreForm').onsubmit = function() {
		if (Impact.game) {
			Impact.game.submitScore();
		}
		return false;
	}
	Impact.main('#canvas', XType, 60, width, height, 1, Impact.ImpactSplashLoader);
};

XType.checkOrientation = function() {
	var isPortrait = XType.isPortrait();
	if (isPortrait === XType.wasPortrait) {
		return;
	}
	XType.wasPortrait = isPortrait;
	Impact.$('#loading').style.display = 'none';
	if (isPortrait) {
		Impact.$('#canvas').style.display = 'block';
		Impact.$('#rotate').style.display = 'none';
		if (XType.initialized && XType.paused) {
			Impact.system.startRunLoop();
			XType.paused = false;
		} else if (!XType.initialized) {
			// window.scrollTo(0, 0);
			setTimeout(XType.startGame, 1);
		}
	} else {
		if (XType.initialized) {
			Impact.system.stopRunLoop();
			XType.paused = true;
		}
		Impact.$('#canvas').style.display = 'none';
		Impact.$('#rotate').style.display = 'block';
	}
};

window.XType.wasPortrait = -1;

window.XType.isPortrait = function() {
	return (!Impact.ua.mobile || window.innerHeight > window.innerWidth);
};

// window.addEventListener('orientationchange', XType.checkOrientation, false);

// window.addEventListener('resize', XType.checkOrientation, false);

window.XType.checkOrientation();
