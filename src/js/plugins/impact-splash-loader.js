
Impact.ImpactSplashLoader = Impact.Loader.extend({
	endTime: 0,
	fadeToWhiteTime: 200,
	fadeToGameTime: 800,
	logoWidth: 340,
	logoHeight: 120,
	init: function(gameClass, resources) {
		this.logo = new Image();
		this.logo.src = 'media/impact.png';
		this.parent(gameClass, resources);
	},
	end: function() {
		this.parent();
		this.endTime = Date.now();
		Impact.system.setDelegate(this);
	},
	run: function() {
		var t = Date.now() - this.endTime;
		var alpha = 1;
		if (t < this.fadeToWhiteTime) {
			this.draw();
			alpha = t.map(0, this.fadeToWhiteTime, 0, 1);
		} else if (t < this.fadeToGameTime) {
			Impact.game.run();
			alpha = t.map(this.fadeToWhiteTime, this.fadeToGameTime, 1, 0);
		} else {
			Impact.system.setDelegate(Impact.game);
			return;
		}
		Impact.system.context.fillStyle = 'rgba(255,255,255,' + alpha + ')';
		Impact.system.context.fillRect(0, 0, Impact.system.realWidth, Impact.system.realHeight);
	},
	draw: function() {
		this._drawStatus += (this.status - this._drawStatus) / 5;
		var ctx = Impact.system.context;
		var w = Impact.system.realWidth;
		var h = Impact.system.realHeight;
		var scale = w / this.logoWidth / 3;
		var center = (w - this.logoWidth * scale) / 2;
		ctx.fillStyle = 'rgba(0,0,0,0.8)';
		ctx.fillRect(0, 0, w, h);
		ctx.save();
		ctx.translate(center, h / 2.5);
		ctx.scale(scale, scale);
		ctx.lineWidth = '3';
		ctx.strokeStyle = 'rgb(255,255,255)';
		ctx.strokeRect(25, this.logoHeight + 40, 300, 20);
		ctx.fillStyle = 'rgb(255,255,255)';
		ctx.fillRect(30, this.logoHeight + 45, 290 * this._drawStatus, 10);
		if (this.logo.width) {
			ctx.drawImage(this.logo, 0, 0);
		}
		ctx.restore();
	}
});
