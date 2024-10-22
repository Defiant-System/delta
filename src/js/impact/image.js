
Impact.Image = Impact.Class.extend({
	data: null,
	width: 0,
	height: 0,
	loaded: false,
	failed: false,
	loadCallback: null,
	path: "",
	
	
	staticInstantiate: function( path ) {
		return Impact.Image.cache[path] || null;
	},
	
	
	init: function( path ) {
		this.path = path;
		this.load();
	},
	
	
	load: function( loadCallback ) {
		if (this.loaded ) {
			if (loadCallback ) {
				loadCallback( this.path, true );
			}
			return;
		}
		else if (!this.loaded && Impact.ready ) {
			this.loadCallback = loadCallback || null;
			
			this.data = new Image();
			this.data.onload = this.onload.bind(this);
			this.data.onerror = this.onerror.bind(this);
			this.data.src = Impact.prefix + this.path + Impact.nocache;
		} else {
			Impact.addResource( this );
		}
		
		Impact.Image.cache[this.path] = this;
	},
	
	
	reload: function() { 
		this.loaded = false;
		this.data = new Image();
		this.data.onload = this.onload.bind(this);
		this.data.src = this.path + '?' + Date.now();
	},
	
	
	onload: function( event ) {
		this.width = this.data.width;
		this.height = this.data.height;
		this.loaded = true;
		
		if ( Impact.system.scale > 1 ) {
			this.resize( Impact.system.scale );
		} else if ( Impact.system.scale < 1 ) {
			this.smaller( Impact.system.scale );
		}
		
		if (this.loadCallback ) {
			this.loadCallback( this.path, true );
		}
	},
	
	
	onerror: function( event ) {
		this.failed = true;
		
		if (this.loadCallback ) {
			this.loadCallback( this.path, false );
		}
	},
	
	
	smaller: function( scale ) {
		var widthScaled = this.width * scale;
		var heightScaled = this.height * scale;

		var scaled = Impact.$new('canvas');
		scaled.width = widthScaled;
		scaled.height = heightScaled;

		var scaledCtx = scaled.getContext('2d');
		scaledCtx.drawImage(this.data, 0, 0, this.width, this.height, 0, 0, widthScaled, heightScaled);
		
		this.data = scaled;
	},
	
	
	resize: function( scale ) {
		// Nearest-Neighbor scaling
		
		// The original image is drawn into an offscreen canvas of the same size
		// and copied into another offscreen canvas with the new size. 
		// The scaled offscreen canvas becomes the image (data) of this object.

		var origPixels = Impact.getImagePixels( this.data, 0, 0, this.width, this.height );
		var widthScaled = this.width * scale;
		var heightScaled = this.height * scale;

		var scaled = Impact.$new('canvas');
		scaled.width = widthScaled;
		scaled.height = heightScaled;
		var scaledCtx = scaled.getContext('2d');
		var scaledPixels = scaledCtx.getImageData( 0, 0, widthScaled, heightScaled );
			
		for( var y = 0; y < heightScaled; y++ ) {
			for( var x = 0; x < widthScaled; x++ ) {
				var index = (Math.floor(y / scale) * this.width + Math.floor(x / scale)) * 4;
				var indexScaled = (y * widthScaled + x) * 4;
				scaledPixels.data[ indexScaled ] = origPixels.data[ index ];
				scaledPixels.data[ indexScaled+1 ] = origPixels.data[ index+1 ];
				scaledPixels.data[ indexScaled+2 ] = origPixels.data[ index+2 ];
				scaledPixels.data[ indexScaled+3 ] = origPixels.data[ index+3 ];
			}
		}
		scaledCtx.putImageData( scaledPixels, 0, 0 );
		this.data = scaled;
	},
	
	
	draw: function( targetX, targetY, sourceX, sourceY, width, height ) {
		if (!this.loaded ) { return; }
		
		var scale = 1;
		sourceX = sourceX ? sourceX * scale : 0;
		sourceY = sourceY ? sourceY * scale : 0;
		width = (width ? width : this.width) * scale;
		height = (height ? height : this.height) * scale;
		
		Impact.system.context.drawImage( 
			this.data, sourceX, sourceY, width, height,
			Impact.system.getDrawPos(targetX), 
			Impact.system.getDrawPos(targetY),
			width, height
		);
		
		Impact.Image.drawCount++;
	},
	
	
	drawTile: function( targetX, targetY, tile, tileWidth, tileHeight, flipX, flipY ) {
		tileHeight = tileHeight ? tileHeight : tileWidth;
		
		if (!this.loaded || tileWidth > this.width || tileHeight > this.height ) { return; }
		
		var scale = 1;
		var tileWidthScaled = Math.floor(tileWidth * scale);
		var tileHeightScaled = Math.floor(tileHeight * scale);
		
		var scaleX = flipX ? -1 : 1;
		var scaleY = flipY ? -1 : 1;
		
		if (flipX || flipY ) {
			Impact.system.context.save();
			Impact.system.context.scale( scaleX, scaleY );
		}
		Impact.system.context.drawImage( 
			this.data, 
			( Math.floor(tile * tileWidth) % this.width ) * scale,
			( Math.floor(tile * tileWidth / this.width) * tileHeight ) * scale,
			tileWidthScaled,
			tileHeightScaled,
			Impact.system.getDrawPos(targetX) * scaleX - (flipX ? tileWidthScaled : 0), 
			Impact.system.getDrawPos(targetY) * scaleY - (flipY ? tileHeightScaled : 0),
			tileWidthScaled,
			tileHeightScaled
		);
		if (flipX || flipY ) {
			Impact.system.context.restore();
		}
		
		Impact.Image.drawCount++;
	}
});

Impact.Image.drawCount = 0;
Impact.Image.cache = {};
Impact.Image.reloadCache = function() {
	for( var path in Impact.Image.cache ) {
		Impact.Image.cache[path].reload();
	}
};
