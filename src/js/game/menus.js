
let MenuItem = Impact.Class.extend({
	getText: function() {
		return 'none'
	},
	left: function() {},
	right: function() {},
	ok: function() {},
	click: function() {
		Impact.system.canvas.style.cursor = 'auto';
		this.ok();
	}
});

let Menu = Impact.Class.extend({
	clearColor: null,
	name: null,
	font: new Impact.Font('media/fonts/tungsten-48.png'),
	fontSelected: new Impact.Font('media/fonts/tungsten-48-orange.png'),
	fontTitle: new Impact.Font('media/fonts/tungsten-48.png'),
	current: 0,
	itemClasses: [],
	items: [],
	init: function() {
		this.y = Impact.system.height / 4 + 160;
		for (var i = 0; i < this.itemClasses.length; i++) {
			this.items.push(new this.itemClasses[i]());
		}
	},
	update: function() {
		if (Impact.input.pressed('up')) {
			this.current--;
		}
		if (Impact.input.pressed('down')) {
			this.current++;
		}
		this.current = this.current.limit(0, this.items.length - 1);
		if (Impact.input.pressed('left')) {
			this.items[this.current].left();
		}
		if (Impact.input.pressed('right')) {
			this.items[this.current].right();
		}
		var margin = Impact.ua.mobile ? this.font.height / 2 : 0;
		var ys = this.y;
		var xs = Impact.system.width / 2;
		var hoverItem = null;
		for (var i = 0; i < this.items.length; i++) {
			var item = this.items[i];
			var w = this.font.widthForString(item.getText()) / 2 + margin;
			if (Impact.input.mouse.x > xs - w && Impact.input.mouse.x < xs + w && Impact.input.mouse.y > ys - margin && Impact.input.mouse.y < ys + this.font.height + margin) {
				hoverItem = item;
				this.current = i;
			}
			ys += this.font.height + 20;
		}
		if (hoverItem) {
			Impact.system.canvas.style.cursor = 'pointer';
			if (Impact.input.pressed('shoot')) {
				hoverItem.click();
			}
		} else {
			Impact.system.canvas.style.cursor = 'auto';
		}
		if (Impact.input.pressed('ok')) {
			this.items[this.current].ok();
		}
	},
	draw: function() {
		if (this.clearColor) {
			Impact.system.context.fillStyle = this.clearColor;
			Impact.system.context.fillRect(0, 0, Impact.system.width, Impact.system.height);
		}
		var xs = Impact.system.width / 2;
		var ys = this.y;
		if (this.name) {
			this.fontTitle.draw(this.name, xs, ys - 160, Impact.Font.ALIGN.CENTER);
		}
		for (var i = 0; i < this.items.length; i++) {
			var t = this.items[i].getText();
			if (i == this.current) {
				this.fontSelected.draw(t, xs, ys, Impact.Font.ALIGN.CENTER);
			} else {
				this.font.draw(t, xs, ys, Impact.Font.ALIGN.CENTER);
			}
			ys += this.font.height + 20;
		}
	}
});

let MenuItemSoundVolume = MenuItem.extend({
	getText: function() {
		return 'Sound Volume: < ' + (Impact.soundManager.volume * 100).round() + '% >';
	},
	left: function() {
		Impact.soundManager.volume = (Impact.soundManager.volume - 0.1).limit(0, 1);
	},
	right: function() {
		Impact.soundManager.volume = (Impact.soundManager.volume + 0.1).limit(0, 1);
	},
	click: function() {
		if (Impact.input.mouse.x > 336) {
			this.right();
		} else {
			this.left();
		}
	}
});

let MenuItemMusicVolume = MenuItem.extend({
	getText: function() {
		return 'Music Volume: < ' + (Impact.music.volume * 100).round() + '% >';
	},
	left: function() {
		Impact.music.volume = (Impact.music.volume - 0.1).limit(0, 1);
	},
	right: function() {
		Impact.music.volume = (Impact.music.volume + 0.1).limit(0, 1);
	},
	click: function() {
		if (Impact.input.mouse.x > 336) {
			this.right();
		} else {
			this.left();
		}
	}
});

let MenuItemResume = MenuItem.extend({
	getText: function() {
		return 'Resume';
	},
	ok: function() {
		Impact.game.toggleMenu();
	}
});

let MenuItemBlank = MenuItem.extend({
	getText: function() {
		return '';
	}
});

let PauseMenu = Menu.extend({
	init: function() {
		if (Impact.Sound.enabled) {
			this.itemClasses.push(MenuItemSoundVolume);
			this.itemClasses.push(MenuItemMusicVolume);
		}
		this.itemClasses.push(MenuItemResume);
		if (Impact.game.mode == XType.MODE.GAME) {
			this.itemClasses.push(MenuItemBlank);
			this.itemClasses.push(MenuItemBack);
		}
		this.parent();
	},
	name: 'Menu',
	clearColor: 'rgba(0,0,0,0.9)'
});

let MenuItemPlay = MenuItem.extend({
	getText: function() {
		return 'Start Game!';
	},
	ok: function() {
		Impact.game.setGame();
	}
});

let MenuItemScores = MenuItem.extend({
	getText: function() {
		return 'Highscores';
	},
	ok: function() {
		Impact.game.mode = XType.MODE.SCORES;
		Impact.game.menu = new MenuScores();
	}
});

let MenuItemSoundMenu = MenuItem.extend({
	getText: function() {
		return 'Sound Menu/Pause (ESC Key)';
	},
	ok: function() {
		Impact.game.toggleMenu();
	}
});

let TitleMenu = Menu.extend({
	init: function() {
		this.itemClasses.push(MenuItemPlay);
		if (Impact.Sound.enabled) {
			this.itemClasses.push(MenuItemSoundMenu);
		}
		this.itemClasses.push(MenuItemScores);
		this.parent();
	}
});

let MenuScores = Menu.extend({
	loaded: '',
	mode: 'Desktop',
	init: function() {
		Impact.$('#scores').style.display = 'block';
		if (!MenuScores.initialized) {
			Impact.$('#scoresBack').onclick = this.cancel.bind(this);
			Impact.$('#showScoresDesktop').onclick = this.loadDesktop.bind(this);
			Impact.$('#showScoresMobile').onclick = this.loadMobile.bind(this);
			MenuScores.initialized = true;
		}
		this.loadMode(Impact.ua.mobile ? 'Mobile' : 'Desktop');
	},
	loadDesktop: function() {
		this.loadMode('Desktop');
		return false;
	},
	loadMobile: function() {
		this.loadMode('Mobile');
		return false;
	},
	loadMode: function(mode) {
		this.mode = mode;
		Impact.$('#showScoresDesktop').className = '';
		Impact.$('#showScoresMobile').className = '';
		Impact.$('#showScores' + mode).className = 'active';
		Impact.$('#scoresTable').innerHTML = '';
		Impact.$('#scoreNotice').innerHTML = 'Loading...';
		Impact.game.xhr('scores/index.php', {
			mode: mode
		}, this.loadCallback.bind(this));
	},
	cancel: function() {
		Impact.$('#scores').style.display = 'none';
		Impact.game.setTitle();
		return false;
	},
	loadCallback: function(scores) {
		if (!scores.length) {
			Impact.$('#scoreNotice').innerHTML = 'No Scores Found.';
			return;
		}
		var html = '<table id="scoresTable"><tr class="head"><td></td><td>Name</td>' + '<td class="score">Score</td><td class="stage">Stage</td><td class="platform">Platform</td></tr>';
		for (var i = 0; i < scores.length; i++) {
			var s = scores[i];
			html += '<tr>' + '<td class="rank">' + (i + 1) + '.</td>' + '<td>' + this.escapeHTML(s.name) + '</a>' + '</td>' + '<td class="score">' + s.score + '</td>' + '<td class="stage">' + s.stage + '</td>' + '<td class="platform">' + s.platform + '</td>' + '</tr>';
		}
		html += '</table>';
		Impact.$('#scoresTable').innerHTML = html;
		Impact.$('#scoreNotice').innerHTML = '';
	},
	escapeHTML: function(s) {
		return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
	},
	draw: function() {},
	update: function() {}
});

MenuScores.initialized = false;

let MenuItemBack = MenuItem.extend({
	getText: function() {
		return 'Back to Title';
	},
	ok: function() {
		Impact.game.setTitle();
	}
});

let GameOverMenu = Menu.extend({
	init: function() {
		this.parent();
		this.y = 500;
	},
	itemClasses: [MenuItemBack],
	draw: function() {
		var ypos = 100;
		this.fontTitle.draw('Game Over', Impact.system.width / 2, ypos, Impact.Font.ALIGN.CENTER);
		this.fontTitle.draw('Score: ' + Impact.game.score.zeroFill(6), Impact.system.width / 2, ypos + 60, Impact.Font.ALIGN.CENTER);
		this.parent();
	}
});
