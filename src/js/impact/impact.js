
/*
 * Impact.js by Dominic Szablewski
 * dominic.szablewski@gmail.com
 * https://github.com/phoboslab/impact
 */


if (!Array.prototype.erase) {
	Array.prototype.erase = function(item) {
		for (var i = this.length; i--; ) {
			if (this[i] === item) {
				this.splice(i, 1);
			}
		}
		return this;
	};
}

if (!Array.prototype.random) {
	Array.prototype.random = function() {
		return this[Math.floor(Math.random() * this.length)];
	};
}

if (!Number.prototype.limit) {
	Number.prototype.limit = function(min, max) {
		return Math.min(max, Math.max(min, this));
	};
}

if (!Number.prototype.round) {
	Number.prototype.round = function(precision) {
		precision = Math.pow(10, precision || 0);
		return Math.round(this * precision) / precision;
	};
}

if (!Number.prototype.floor) {
	Number.prototype.floor = function() {
		return Math.floor(this);
	};
}

if (!Number.prototype.ceil) {
	Number.prototype.ceil = function() {
		return Math.ceil(this);
	};
}

if (!Number.prototype.map) {
	Number.prototype.map = function(istart, istop, ostart, ostop) {
		return ostart + (ostop - ostart) * ((this - istart) / (istop - istart));
	};
}


let Impact = {
	game: null,
	debug: null,
	version: "1.25k", // k-suffix indicates changes for Karaqu
	global: window,
	modules: {},
	resources: [],
	ready: false,
	baked: false,
	nocache: "",
	ua: {},
	prefix: "",
	lib: "lib/",
	_current: null,
	_loadQueue: [],
	
	$: function( selector ) {
		return selector.charAt(0) == '#'
			? document.getElementById( selector.substr(1) )
			: document.getElementsByTagName( selector );
	},
	
	$new: function( name ) {
		return document.createElement( name );
	},
	
	copy: function( object ) {
		if(
		   !object || typeof(object) != 'object' ||
		   object instanceof HTMLElement ||
		   object instanceof Impact.Class
		) {
			return object;
		}
		else if (object instanceof Array ) {
			var c = [];
			for( var i = 0, l = object.length; i < l; i++) {
				c[i] = Impact.copy(object[i]);
			}
			return c;
		}
		else {
			var c = {};
			for( var i in object ) {
				c[i] = Impact.copy(object[i]);
			}
			return c;
		}
	},
	
	merge: function( original, extended ) {
		for( var key in extended ) {
			var ext = extended[key];
			if(
				typeof(ext) != 'object' ||
				ext instanceof HTMLElement ||
				ext instanceof Impact.Class ||
				ext === null
			) {
				original[key] = ext;
			}
			else {
				if (!original[key] || typeof(original[key]) != 'object' ) {
					original[key] = (ext instanceof Array) ? [] : {};
				}
				Impact.merge( original[key], ext );
			}
		}
		return original;
	},

	ksort: function( obj ) {
		if (!obj || typeof(obj) != 'object' ) {
			return [];
		}
		
		var keys = [], values = [];
		for( var i in obj ) {
			keys.push(i);
		}
		
		keys.sort();
		for( var i = 0; i < keys.length; i++ ) {
			values.push( obj[keys[i]] );
		}
		
		return values;
	},

	// Ah, yes. I love vendor prefixes. So much fun!
	setVendorAttribute: function( el, attr, val ) {
		var uc = attr.charAt(0).toUpperCase() + attr.substr(1);
		el[attr] = el['ms'+uc] = el['moz'+uc] = el['webkit'+uc] = el['o'+uc] = val;
	},

	getVendorAttribute: function( el, attr ) {
		var uc = attr.charAt(0).toUpperCase() + attr.substr(1);
		return el[attr] || el['ms'+uc] || el['moz'+uc] || el['webkit'+uc] || el['o'+uc];
	},

	normalizeVendorAttribute: function( el, attr ) {
		var prefixedVal = ig.getVendorAttribute( el, attr );
		if (!el[attr] && prefixedVal ) {
			el[attr] = prefixedVal;
		}
	},

	// This function normalizes getImageData to extract the real, actual
	// pixels from an image. The naive method recently failed on retina
	// devices with a backgingStoreRatio != 1
	getImagePixels: function( image, x, y, width, height ) {
		var canvas = Impact.$new('canvas');
		canvas.width = image.width;
		canvas.height = image.height;
		var ctx = canvas.getContext('2d');
		
		// Try to draw pixels as accurately as possible
		Impact.System.SCALE.CRISP(canvas, ctx);

		var ratio = Impact.getVendorAttribute( ctx, 'backingStorePixelRatio' ) || 1;
		Impact.normalizeVendorAttribute( ctx, 'getImageDataHD' );

		var realWidth = image.width / ratio,
			realHeight = image.height / ratio;

		canvas.width = Math.ceil( realWidth );
		canvas.height = Math.ceil( realHeight );

		ctx.drawImage( image, 0, 0, realWidth, realHeight );
		
		return (ratio === 1)
			? ctx.getImageData( x, y, width, height )
			: ctx.getImageDataHD( x, y, width, height );
	},

	module: function( name ) {
		if (Impact._current ) {
			throw( "Module '"+Impact._current.name+"' defines nothing" );
		}
		if (Impact.modules[name] && Impact.modules[name].body ) {
			throw( "Module '"+name+"' is already defined" );
		}
		
		Impact._current = {name: name, requires: [], loaded: false, body: null};
		Impact.modules[name] = Impact._current;
		Impact._loadQueue.push(Impact._current);
		return ig;
	},

	defines: function( body ) {
		Impact._current.body = body;
		Impact._current = null;
		Impact._initDOMReady();
	},
	
	addResource: function( resource ) {
		Impact.resources.push( resource );
	},

	_boot: function() {
		// Probe user agent string
		Impact.ua.pixelRatio = window.devicePixelRatio || 1;
		Impact.ua.viewport = {
			width: window.innerWidth,
			height: window.innerHeight
		};
		Impact.ua.screen = {
			width: window.screen.availWidth * Impact.ua.pixelRatio,
			height: window.screen.availHeight * Impact.ua.pixelRatio
		};
	},
	
	_initDOMReady: function() {
		console.log( "_initDOMReady" );
	}
};

var next = 1,
	anims = {};
Impact.setAnimation = function(callback, element) {
	var current = next++;
	anims[current] = true;
	var animate = function() {
		if (!anims[current]) {
			return;
		}
		window.requestAnimationFrame(animate, element);
		callback();
	};
	window.requestAnimationFrame(animate, element);
	return current;
};

Impact.clearAnimation = function(id) {
	delete anims[id];
};

var initializing = false,
	fnTest = /xyz/.test(function() {
		xyz;
	}) ? /\bparent\b/ : /.*/;

var inject = function(prop) {
	var proto = this.prototype;
	var parent = {};
	for (var name in prop) {
		if (typeof (prop[name]) == "function" && typeof (proto[name]) == "function" && fnTest.test(prop[name])) {
			parent[name] = proto[name];
			proto[name] = (function(name, fn) {
				return function() {
					var tmp = this.parent;
					this.parent = parent[name];
					var ret = fn.apply(this, arguments);
					this.parent = tmp;
					return ret;
				}
				;
			}
			)(name, prop[name]);
		} else {
			proto[name] = prop[name];
		}
	}
};

Impact.Class = function() {};

Impact.Class.extend = function(prop) {
	var parent = this.prototype;
	initializing = true;
	var prototype = new this();
	initializing = false;
	for (var name in prop) {
		if (typeof (prop[name]) == "function" && typeof (parent[name]) == "function" && fnTest.test(prop[name])) {
			prototype[name] = (function(name, fn) {
				return function() {
					var tmp = this.parent;
					this.parent = parent[name];
					var ret = fn.apply(this, arguments);
					this.parent = tmp;
					return ret;
				}
				;
			}
			)(name, prop[name]);
		} else {
			prototype[name] = prop[name];
		}
	}
	function Class() {
		if (!initializing) {
			if (this.staticInstantiate) {
				var obj = this.staticInstantiate.apply(this, arguments);
				if (obj) {
					return obj;
				}
			}
			for (var p in this) {
				if (typeof (this[p]) == 'object') {
					this[p] = Impact.copy(this[p]);
				}
			}
			if (this.init) {
				this.init.apply(this, arguments);
			}
		}
		return this;
	}
	Class.prototype = prototype;
	Class.prototype.constructor = Class;
	Class.extend = Impact.Class.extend;
	Class.inject = inject;
	return Class;
};


Impact.main = function( canvas, gameClass, fps, width, height, scale, loaderClass ) {
	Impact.system = new Impact.System( canvas, fps, width, height, scale || 1 );
	Impact.input = new Impact.Input();
	// Impact.soundManager = new Impact.SoundManager();
	// Impact.music = new Impact.Music();
	Impact.ready = true;
	
	var loader = new (loaderClass || Impact.Loader)( gameClass, Impact.resources );
	loader.load();

};





