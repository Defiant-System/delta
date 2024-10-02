
Impact.SoundManager = Impact.Class.extend({
	clips: {},
	volume: 1,
	format: null,
	
	init: function() {
		// Quick sanity check if the Browser supports the Audio tag
		if (!Impact.Sound.enabled || !window.Audio ) {
			Impact.Sound.enabled = false;
			return;
		}
		
		// Probe sound formats and determine the file extension to load
		var probe = new Audio();
		for( var i = 0; i < Impact.Sound.use.length; i++ ) {
			var format = Impact.Sound.use[i];
			if (probe.canPlayType(format.mime) ) {
				this.format = format;
				break;
			}
		}
		
		// No compatible format found? -> Disable sound
		if (!this.format ) {
			Impact.Sound.enabled = false;
		}

		// Create WebAudio Context
		if (Impact.Sound.enabled && Impact.Sound.useWebAudio ) {
			this.audioContext = new AudioContext();
			this.boundWebAudioUnlock = this.unlockWebAudio.bind(this);
			Impact.system.canvas.addEventListener('touchstart', this.boundWebAudioUnlock, false);
			Impact.system.canvas.addEventListener('mousedown', this.boundWebAudioUnlock, false);
		}
	},
	
	unlockWebAudio: function() {
		Impact.system.canvas.removeEventListener('touchstart', this.boundWebAudioUnlock, false);
		Impact.system.canvas.removeEventListener('mousedown', this.boundWebAudioUnlock, false);
		
		// create empty buffer
		var buffer = this.audioContext.createBuffer(1, 1, 22050);
		var source = this.audioContext.createBufferSource();
		source.buffer = buffer;

		source.connect(this.audioContext.destination);
		source.start(0);
	},

	load: function( path, multiChannel, loadCallback ) {
		if (multiChannel && Impact.Sound.useWebAudio ) {
			// Requested as Multichannel and we're using WebAudio?
			return this.loadWebAudio( path, multiChannel, loadCallback );
		}
		else {
			// Oldschool HTML5 Audio - always used for Music
			return this.loadHTML5Audio( path, multiChannel, loadCallback );
		}
	},

	loadWebAudio: function( path, multiChannel, loadCallback ) {
		// Path to the soundfile with the right extension (.ogg or .mp3)
		var realPath = Impact.prefix + path.replace(/[^\.]+$/, this.format.ext) + Impact.nocache;

		if (this.clips[path] ) {
			return this.clips[path];
		}

		var audioSource = new Impact.Sound.WebAudioSource();
		this.clips[path] = audioSource;

		var request = new XMLHttpRequest();
		request.open('GET', realPath, true);
		request.responseType = 'arraybuffer';


		var that = this;
		request.onload = function(ev) {
			that.audioContext.decodeAudioData(request.response, 
				function(buffer) {
					audioSource.buffer = buffer;
					if (loadCallback ) {
						loadCallback( path, true, ev );
					}
				}, 
				function(ev) {
					if (loadCallback ) {
						loadCallback( path, false, ev );
					}
				}
			);
		};
		request.onerror = function(ev) {
			if (loadCallback ) {
				loadCallback( path, false, ev );
			}
		};
		request.send();

		return audioSource;
	},
	
	loadHTML5Audio: function( path, multiChannel, loadCallback ) {
		
		// Path to the soundfile with the right extension (.ogg or .mp3)
		var realPath = Impact.prefix + path.replace(/[^\.]+$/, this.format.ext) + Impact.nocache;
		
		// Sound file already loaded?
		if (this.clips[path] ) {
			// Loaded as WebAudio, but now requested as HTML5 Audio? Probably Music?
			if (this.clips[path] instanceof Impact.Sound.WebAudioSource ) {
				return this.clips[path];
			}
			
			// Only loaded as single channel and now requested as multichannel?
			if (multiChannel && this.clips[path].length < Impact.Sound.channels ) {
				for( var i = this.clips[path].length; i < Impact.Sound.channels; i++ ) {
					var a = new Audio( realPath );
					a.load();
					this.clips[path].push( a );
				}
			}
			return this.clips[path][0];
		}
		
		var clip = new Audio( realPath );
		if (loadCallback ) {
			
			// The canplaythrough event is dispatched when the browser determines
			// that the sound can be played without interuption, provided the
			// download rate doesn't change.
			// Mobile browsers stubbornly refuse to preload HTML5, so we simply
			// ignore the canplaythrough event and immediately "fake" a successful
			// load callback
			if (Impact.ua.mobile ) {
				setTimeout(function(){
					loadCallback( path, true, null );
				}, 0);
			}
			else {
				clip.addEventListener( 'canplaythrough', function cb(ev){
					clip.removeEventListener('canplaythrough', cb, false);
					loadCallback( path, true, ev );
				}, false );

				clip.addEventListener( 'error', function(ev){
					loadCallback( path, false, ev );
				}, false);
			}
		}
		clip.preload = 'auto';
		clip.load();
		
		
		this.clips[path] = [clip];
		if (multiChannel ) {
			for( var i = 1; i < Impact.Sound.channels; i++ ) {
				var a = new Audio(realPath);
				a.load();
				this.clips[path].push( a );
			}
		}
		
		return clip;
	},
	
	
	get: function( path ) {
		// Find and return a channel that is not currently playing	
		var channels = this.clips[path];

		// Is this a WebAudio source? We only ever have one for each Sound
		if (channels && channels instanceof Impact.Sound.WebAudioSource ) {
			return channels;
		}

		// Oldschool HTML5 Audio - find a channel that's not currently 
		// playing or, if all are playing, rewind one
		for( var i = 0, clip; clip = channels[i++]; ) {
			if (clip.paused || clip.ended ) {
				if (clip.ended ) {
					clip.currentTime = 0;
				}
				return clip;
			}
		}
		
		// Still here? Pause and rewind the first channel
		channels[0].pause();
		channels[0].currentTime = 0;
		return channels[0];
	}
});



Impact.Music = Impact.Class.extend({
	tracks: [],
	namedTracks: {},
	currentTrack: null,
	currentIndex: 0,
	random: false,
	
	_volume: 1,
	_loop: false,
	_fadeInterval: 0,
	_fadeTimer: null,
	_endedCallbackBound: null,
	
	
	init: function() {
		this._endedCallbackBound = this._endedCallback.bind(this);
		
		Object.defineProperty(this,"volume", { 
			get: this.getVolume.bind(this),
			set: this.setVolume.bind(this)
		});
		
		Object.defineProperty(this,"loop", { 
			get: this.getLooping.bind(this),
			set: this.setLooping.bind(this)
		});
	},
	
	
	add: function( music, name ) {
		if (!Impact.Sound.enabled ) {
			return;
		}
		
		var path = music instanceof Impact.Sound ? music.path : music;
		
		var track = Impact.soundManager.load(path, false);

		// Did we get a WebAudio Source? This is suboptimal; Music should be loaded
		// as HTML5 Audio so it can be streamed
		if (track instanceof Impact.Sound.WebAudioSource ) {
			// Since this error will likely occur at game start, we stop the game
			// to not produce any more errors.
			Impact.system.stopRunLoop();
			throw(
				"Sound '"+path+"' loaded as Multichannel but used for Music. " +
				"Set the multiChannel param to false when loading, e.g.: new Impact.Sound(path, false)"
			);
		}

		track.loop = this._loop;
		track.volume = this._volume;
		track.addEventListener( 'ended', this._endedCallbackBound, false );
		this.tracks.push( track );
		
		if (name ) {
			this.namedTracks[name] = track;
		}
		
		if (!this.currentTrack ) {
			this.currentTrack = track;
		}
	},
	
	
	next: function() {
		if (!this.tracks.length ) { return; }
		
		this.stop();
		this.currentIndex = this.random
			? Math.floor(Math.random() * this.tracks.length)
			: (this.currentIndex + 1) % this.tracks.length;
		this.currentTrack = this.tracks[this.currentIndex];
		this.play();
	},
	
	
	pause: function() {
		if (!this.currentTrack ) { return; }
		this.currentTrack.pause();
	},
	
	
	stop: function() {
		if (!this.currentTrack ) { return; }
		this.currentTrack.pause();
		this.currentTrack.currentTime = 0;
	},
	
	
	play: function( name ) {
		// If a name was provided, stop playing the current track (if any)
		// and play the named track
		if (name && this.namedTracks[name] ) {
			var newTrack = this.namedTracks[name];
			if (newTrack != this.currentTrack ) {
				this.stop();
				this.currentTrack = newTrack;
			}
		}
		else if (!this.currentTrack ) { 
			return; 
		}
		this.currentTrack.play();
	},
	
		
	getLooping: function() {
		return this._loop;
	},
	
	
	setLooping: function( l ) {
		this._loop = l;
		for( var i in this.tracks ) {
			this.tracks[i].loop = l;
		}
	},	
		
	
	getVolume: function() {
		return this._volume;
	},
	
	
	setVolume: function( v ) {
		this._volume = v.limit(0,1);
		for( var i in this.tracks ) {
			this.tracks[i].volume = this._volume;
		}
	},
	
	
	fadeOut: function( time ) {
		if (!this.currentTrack ) { return; }
		
		clearInterval( this._fadeInterval );
		this._fadeTimer = new Impact.Timer( time );
		this._fadeInterval = setInterval( this._fadeStep.bind(this), 50 );
	},
	
	
	_fadeStep: function() {
		var v = this._fadeTimer.delta()
			.map(-this._fadeTimer.target, 0, 1, 0)
			.limit( 0, 1 )
			* this._volume;
		
		if (v <= 0.01 ) {
			this.stop();
			this.currentTrack.volume = this._volume;
			clearInterval( this._fadeInterval );
		}
		else {
			this.currentTrack.volume = v;
		}
	},
	
	_endedCallback: function() {
		if (this._loop ) {
			this.play();
		}
		else {
			this.next();
		}
	}
});



Impact.Sound = Impact.Class.extend({
	path: "",
	volume: 1,
	currentClip: null,
	multiChannel: true,
	_loop: false,
	
	
	init: function( path, multiChannel ) {
		this.path = path;
		this.multiChannel = (multiChannel !== false);

		Object.defineProperty(this,"loop", { 
			get: this.getLooping.bind(this),
			set: this.setLooping.bind(this)
		});
		
		this.load();
	},

	getLooping: function() {
		return this._loop;
	},

	setLooping: function( loop ) {
		this._loop = loop;

		if (this.currentClip ) {
			this.currentClip.loop = loop;
		}
	},	
	
	load: function( loadCallback ) {
		if (!Impact.Sound.enabled ) {
			if (loadCallback ) {
				loadCallback( this.path, true );
			}
			return;
		}
		
		if (Impact.ready ) {
			Impact.soundManager.load( this.path, this.multiChannel, loadCallback );
		}
		else {
			Impact.addResource( this );
		}
	},
	
	
	play: function() {
		if (!Impact.Sound.enabled ) {
			return;
		}
		
		this.currentClip = Impact.soundManager.get( this.path );
		this.currentClip.loop = this._loop;
		this.currentClip.volume = Impact.soundManager.volume * this.volume;
		this.currentClip.play();
	},
	
	
	stop: function() {
		if (this.currentClip ) {
			this.currentClip.pause();
			this.currentClip.currentTime = 0;
		}
	}
});


Impact.Sound.WebAudioSource = Impact.Class.extend({
	sources: [],
	gain: null,
	buffer: null,
	_loop: false,

	init: function() {
		this.gain = Impact.soundManager.audioContext.createGain();
		this.gain.connect(Impact.soundManager.audioContext.destination);

		Object.defineProperty(this,"loop", { 
			get: this.getLooping.bind(this),
			set: this.setLooping.bind(this)
		});

		Object.defineProperty(this,"volume", { 
			get: this.getVolume.bind(this),
			set: this.setVolume.bind(this)
		});
	},

	play: function() {
		if (!this.buffer ) { return; }
		var source = Impact.soundManager.audioContext.createBufferSource();
		source.buffer = this.buffer;
		source.connect(this.gain); 
		source.loop = this._loop;

		// Add this new source to our sources array and remove it again
		// later when it has finished playing.
		var that = this;
		this.sources.push(source);
		source.onended = function(){ that.sources.erase(source); };

		source.start(0);
	},

	pause: function() {
		for( var i = 0; i < this.sources.length; i++ ) {
			try{
				this.sources[i].stop();
			} catch(err){}
		}
	},

	getLooping: function() {
		return this._loop;
	},

	setLooping: function( loop ) {
		this._loop = loop;

		for( var i = 0; i < this.sources.length; i++ ) {
			this.sources[i].loop = loop;
		}
	},

	getVolume: function() {
		return this.gain.gain.value;
	},

	setVolume: function( volume ) {
		this.gain.gain.value = volume;
	}
});


Impact.Sound.FORMAT = {
	MP3: {ext: 'mp3', mime: 'audio/mpeg'},
	M4A: {ext: 'm4a', mime: 'audio/mp4; codecs=mp4a.40.2'},
	OGG: {ext: 'ogg', mime: 'audio/ogg; codecs=vorbis'},
	WEBM: {ext: 'webm', mime: 'audio/webm; codecs=vorbis'},
	CAF: {ext: 'caf', mime: 'audio/x-caf'}
};
Impact.Sound.use = [Impact.Sound.FORMAT.OGG, Impact.Sound.FORMAT.MP3];
Impact.Sound.channels = 4;
Impact.Sound.enabled = false;

// Impact.normalizeVendorAttribute(window, 'AudioContext');
Impact.Sound.useWebAudio = !!window.AudioContext;
