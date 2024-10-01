
Impact.AnimationSheet = Impact.Class.extend({
	width: 8,
	height: 8,
	image: null,
	
	init: function( path, width, height ) {
		this.width = width;
		this.height = height;
		
		this.image = new Impact.Image( path );
	}
});



Impact.Animation = Impact.Class.extend({
	sheet: null,
	timer: null,
	
	sequence: [],	
	flip: {x: false, y: false},
	pivot: {x: 0, y: 0},
	
	frameTime: 0,
	frame: 0,
	tile: 0,
	stop: false,
	loopCount: 0,
	alpha: 1,
	angle: 0,
	
	
	init: function( sheet, frameTime, sequence, stop ) {
		this.sheet = sheet;
		this.pivot = {x: sheet.width/2, y: sheet.height/2 };
		this.timer = new Impact.Timer();

		this.frameTime = frameTime;
		this.sequence = sequence;
		this.stop = !!stop;
		this.tile = this.sequence[0];
	},
	
	
	rewind: function() {
		this.timer.set();
		this.loopCount = 0;
		this.frame = 0;
		this.tile = this.sequence[0];
		return this;
	},
	
	
	gotoFrame: function( f ) {
		// Offset the timer by one tenth of a millisecond to make sure we
		// jump to the correct frame and circumvent rounding errors
		this.timer.set( this.frameTime * -f - 0.0001 );
		this.update();
	},
	
	
	gotoRandomFrame: function() {
		this.gotoFrame( Math.floor(Math.random() * this.sequence.length) );
	},
	
	
	update: function() {
		var frameTotal = Math.floor(this.timer.delta() / this.frameTime);
		this.loopCount = Math.floor(frameTotal / this.sequence.length);
		if( this.stop && this.loopCount > 0 ) {
			this.frame = this.sequence.length - 1;
		}
		else {
			this.frame = frameTotal % this.sequence.length;
		}
		this.tile = this.sequence[ this.frame ];
	},
	
	
	draw: function( targetX, targetY ) {
		var bbsize = Math.max(this.sheet.width, this.sheet.height);
		
		// On screen?
		if(
		   targetX > Impact.system.width || targetY > Impact.system.height ||
		   targetX + bbsize < 0 || targetY + bbsize < 0
		) {
			return;
		}
		
		if( this.alpha != 1) {
			Impact.system.context.globalAlpha = this.alpha;
		}
		
		if( this.angle == 0 ) {		
			this.sheet.image.drawTile(
				targetX, targetY,
				this.tile, this.sheet.width, this.sheet.height,
				this.flip.x, this.flip.y
			);
		}
		else {
			Impact.system.context.save();
			Impact.system.context.translate(
				Impact.system.getDrawPos(targetX + this.pivot.x),
				Impact.system.getDrawPos(targetY + this.pivot.y)
			);
			Impact.system.context.rotate( this.angle );
			this.sheet.image.drawTile(
				-this.pivot.x, -this.pivot.y,
				this.tile, this.sheet.width, this.sheet.height,
				this.flip.x, this.flip.y
			);
			Impact.system.context.restore();
		}
		
		if( this.alpha != 1) {
			Impact.system.context.globalAlpha = 1;
		}
	}
});
