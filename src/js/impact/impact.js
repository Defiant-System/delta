
let Impact = {
	game: null,
	debug: null,
	version: "1.24",
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

	ksort: function( obj ) {
		if( !obj || typeof(obj) != 'object' ) {
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
		if( Impact._current ) {
			throw( "Module '"+Impact._current.name+"' defines nothing" );
		}
		if( Impact.modules[name] && Impact.modules[name].body ) {
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


Impact.main = function( canvasId, gameClass, fps, width, height, scale, loaderClass ) {
	Impact.system = new Impact.System( canvasId, fps, width, height, scale || 1 );
	Impact.input = new Impact.Input();
	Impact.soundManager = new Impact.SoundManager();
	Impact.music = new Impact.Music();
	Impact.ready = true;
	
	var loader = new (loaderClass || Impact.Loader)( gameClass, Impact.resources );
	loader.load();
};





