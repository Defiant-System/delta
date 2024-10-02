
Impact.AnalogStick = Impact.Class.extend({
	stickSize: 30,
	baseSize: 70,
	stickColor: 'rgba(255,255,255,0.3)',
	baseColor: 'rgba(255,255,255,0.3)',
	pos: {
		x: 0,
		y: 0
	},
	input: {
		x: 0,
		y: 0
	},
	pressed: false,
	angle: 0,
	amount: 0,
	_touchId: null,
	init: function(x, y, baseSize, stickSize) {
		this.pos = {
			x: x,
			y: y
		};
		this.baseSize = baseSize || this.baseSize;
		this.stickSize = stickSize || this.stickSize;
		this.max = this.baseSize - this.stickSize / 3;
		Impact.system.canvas.addEventListener('touchstart', this.touchStart.bind(this), false);
		document.addEventListener('touchmove', this.touchMove.bind(this), false);
		document.addEventListener('touchend', this.touchEnd.bind(this), false);
		Impact.input.isUsingMouse = true;
	},
	touchStart: function(ev) {
		ev.preventDefault();
		if (this.pressed) {
			return;
		}
		for (var i = 0; i < ev.touches.length; i++) {
			var touch = ev.touches[i];
			var ip = Impact.input;
			ip.mouse.x = touch.pageX * Impact.internalScale;
			ip.mouse.y = touch.pageY * Impact.internalScale;
			ip.actions['shoot'] = true;
			if (!ip.locks['shoot']) {
				ip.presses['shoot'] = true;
				ip.locks['shoot'] = true;
			}
			var xd = this.pos.x - touch.pageX * Impact.internalScale;
			var yd = this.pos.y - touch.pageY * Impact.internalScale;
			if (Math.sqrt(xd * xd + yd * yd) < this.baseSize) {
				this.pressed = true;
				this._touchId = touch.identifier;
				this._moved(touch);
				return;
			}
		}
	},
	touchMove: function(ev) {
		ev.preventDefault();
		for (var i = 0; i < ev.changedTouches.length; i++) {
			if (ev.changedTouches[i].identifier == this._touchId) {
				this._moved(ev.changedTouches[i]);
				return;
			}
		}
	},
	_moved: function(touch) {
		var x = touch.pageX * Impact.internalScale - this.pos.x;
		var y = touch.pageY * Impact.internalScale - this.pos.y;
		this.angle = Math.atan2(x, -y);
		this.amount = Math.min(1, Math.sqrt(x * x + y * y) / this.max);
		this.input.x = Math.sin(this.angle) * this.amount;
		this.input.y = -Math.cos(this.angle) * this.amount;
	},
	touchEnd: function(ev) {
		Impact.input.delayedKeyup['shoot'] = true;
		for (var i = 0; i < ev.changedTouches.length; i++) {
			if (ev.changedTouches[i].identifier == this._touchId) {
				this.pressed = false;
				this.input.x = 0;
				this.input.y = 0;
				this.amount = 0;
				this._touchId = null;
				return;
			}
		}
	},
	draw: function() {
		var ctx = Impact.system.context;
		ctx.beginPath();
		ctx.arc(this.pos.x, this.pos.y, this.baseSize, 0, (Math.PI * 2), true);
		ctx.lineWidth = 3;
		ctx.strokeStyle = this.baseColor;
		ctx.stroke();
		ctx.beginPath();
		ctx.arc(this.pos.x + this.input.x * this.max, this.pos.y + this.input.y * this.max, this.stickSize, 0, (Math.PI * 2), true);
		ctx.fillStyle = this.stickColor;
		ctx.fill();
	}
});
