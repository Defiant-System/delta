
Impact.Font = Impact.Image.extend({
	widthMap: [],
	indices: [],
	firstChar: 32,
	alpha: 1,
	letterSpacing: 1,
	lineSpacing: 0,
	
	
	onload: function( ev ) {
		this._loadMetrics( this.data );
		this.parent( ev );
		this.height -= 2; // last 2 lines contain no visual data
	},


	widthForString: function( text ) {
		// Multiline?
		if (text.indexOf('\n') !== -1 ) {
			var lines = text.split( '\n' );
			var width = 0;
			for( var i = 0; i < lines.length; i++ ) {
				width = Math.max( width, this._widthForLine(lines[i]) );
			}
			return width;
		}
		else {
			return this._widthForLine( text );
		}
	},

	
	_widthForLine: function( text ) {
		var width = 0;
		for( var i = 0; i < text.length; i++ ) {
			width += this.widthMap[text.charCodeAt(i) - this.firstChar];
		}
		if (text.length > 0 ) {
			width += this.letterSpacing * (text.length - 1);
		}
		return width;
	},


	heightForString: function( text ) {
		return text.split('\n').length * (this.height + this.lineSpacing);
	},
	
	
	draw: function( text, x, y, align ) {
		if (typeof(text) != 'string' ) {
			text = text.toString();
		}
		
		// Multiline?
		if (text.indexOf('\n') !== -1 ) {
			var lines = text.split( '\n' );
			var lineHeight = this.height + this.lineSpacing;
			for( var i = 0; i < lines.length; i++ ) {
				this.draw( lines[i], x, y + i * lineHeight, align );
			}
			return;
		}
		
		if (align == Impact.Font.ALIGN.RIGHT || align == Impact.Font.ALIGN.CENTER ) {
			var width = this._widthForLine( text );
			x -= align == Impact.Font.ALIGN.CENTER ? width/2 : width;
		}
		

		if (this.alpha !== 1 ) {
			Impact.system.context.globalAlpha = this.alpha;
		}

		for( var i = 0; i < text.length; i++ ) {
			var c = text.charCodeAt(i);
			x += this._drawChar( c - this.firstChar, x, y );
		}

		if (this.alpha !== 1 ) {
			Impact.system.context.globalAlpha = 1;
		}
		Impact.Image.drawCount += text.length;
	},
	
	
	_drawChar: function( c, targetX, targetY ) {
		if (!this.loaded || c < 0 || c >= this.indices.length ) { return 0; }
		
		var scale = Impact.system.scale;
		var charX = this.indices[c] * scale;
		var charY = 0;
		var charWidth = this.widthMap[c] * scale;
		var charHeight = this.height * scale;
		
		Impact.system.context.drawImage( 
			this.data,
			charX, charY,
			charWidth, charHeight,
			Impact.system.getDrawPos(targetX), Impact.system.getDrawPos(targetY),
			charWidth, charHeight
		);
		
		return this.widthMap[c] + this.letterSpacing;
	},
	
	
	_loadMetrics: function( image ) {
		// Draw the bottommost line of this font image into an offscreen canvas
		// and analyze it pixel by pixel.
		// A run of non-transparent pixels represents a character and its width
		
		this.widthMap = [];
		this.indices = [];
		
		var px = Impact.getImagePixels( image, 0, image.height-1, image.width, 1 );
		
		var currentWidth = 0;
		for( var x = 0; x < image.width; x++ ) {
			var index = x * 4 + 3; // alpha component of this pixel
			if (px.data[index] > 127 ) {
				currentWidth++;
			}
			else if (px.data[index] < 128 && currentWidth ) {
				this.widthMap.push( currentWidth );
				this.indices.push( x-currentWidth );
				currentWidth = 0;
			}
		}
		this.widthMap.push( currentWidth );
		this.indices.push( x-currentWidth );
	}
});


Impact.Font.ALIGN = {
	LEFT: 0,
	RIGHT: 1,
	CENTER: 2
};
