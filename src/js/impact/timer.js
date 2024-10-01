
Impact.Timer = Impact.Class.extend({
	target: 0,
	base: 0,
	last: 0,
	pausedAt: 0,
	
	init: function( seconds ) {
		this.base = Impact.Timer.time;
		this.last = Impact.Timer.time;
		
		this.target = seconds || 0;
	},
	
	
	set: function( seconds ) {
		this.target = seconds || 0;
		this.base = Impact.Timer.time;
		this.pausedAt = 0;
	},
	
	
	reset: function() {
		this.base = Impact.Timer.time;
		this.pausedAt = 0;
	},
	
	
	tick: function() {
		var delta = Impact.Timer.time - this.last;
		this.last = Impact.Timer.time;
		return (this.pausedAt ? 0 : delta);
	},
	
	
	delta: function() {
		return (this.pausedAt || Impact.Timer.time) - this.base - this.target;
	},


	pause: function() {
		if( !this.pausedAt ) {
			this.pausedAt = Impact.Timer.time;
		}
	},


	unpause: function() {
		if( this.pausedAt ) {
			this.base += Impact.Timer.time - this.pausedAt;
			this.pausedAt = 0;
		}
	}
});

Impact.Timer._last = 0;
Impact.Timer.time = Number.MIN_VALUE;
Impact.Timer.timeScale = 1;
Impact.Timer.maxStep = 0.05;

Impact.Timer.step = function() {
	var current = Date.now();
	var delta = (current - Impact.Timer._last) / 1000;
	Impact.Timer.time += Math.min(delta, Impact.Timer.maxStep) * Impact.Timer.timeScale;
	Impact.Timer._last = current;
};
