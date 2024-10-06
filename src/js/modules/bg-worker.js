
let Anim = {
	init() {
		// setTimeout(() => { this.paused = true }, 300);
	},
	dispatch(event) {
		let Self = Anim,
			value;
		// console.log(event.type);
		switch (event.type) {
			case "start":
				Self.cvs = event.canvas;
				Self.ctx = Self.cvs.getContext("2d");
				Self.dispatch({ type: "create-scene" });
				Self.paused = true;
				Self.active = "lines";
				Self.draw();
				break;
			case "pause":
				Self.paused = true;
				break;
			case "resume":
				if (Self.paused && Self.ctx) {
					Self.paused = false;
					Self.draw();
				}
				break;
			case "set-active-mode":
				// Self.active = event.mode;
				console.log( event.mode );
				Self.alpha = { from: 1, to: 0, step: -.025, mode: event.mode };
				break;
			case "create-scene":
				// grid
				Self.grid = {
					margin: { x: 19, y: 20 },
					size: 22,
					points: [],
					forces: [],
				};
				Self.grid.yl = Math.round(((Self.cvs.height - Self.grid.margin.y) / Self.grid.size));
				Self.grid.xl = Math.round(((Self.cvs.width - Self.grid.margin.x) / Self.grid.size));
				for (let y=0; y<Self.grid.yl; y++) {
					// insert row
					Self.grid.points[y] = [];
					for (let x=0; x<Self.grid.xl; x++) {
						// insert column (point)
						let pX = (x * Self.grid.size) + Self.grid.margin.x,
							pY = (y * Self.grid.size) + Self.grid.margin.y;
						Self.grid.points[y].push(new Point(pX, pY));
					}
				}

				// lines
				Self.lines = {
					perlin: new ClassicalNoise(),
					variation: .0027,
					amp: 560,
					maxLines: 37,
					variators: [],
					startY: Self.cvs.height >> 1,
				};

				for (let i=0, u=0; i<Self.lines.maxLines; i++, u+=.025) {
					Self.lines.variators[i] = u;
				}
				break;
			case "explode":
				Self.grid.forces.push(new Explode(event.x, event.y, event.force));
				break;
		}
	},
	update(Self) {
		let w = Self.cvs.width,
			h = Self.cvs.height;

		switch (Self.active) {
			case "lines":
				break;
			case "grid":
				// update forces
				Self.grid.forces.map(item => item.update());
				// update points
				Self.grid.points.map(row => {
					row.map(p => {
						// apply force on point
						Self.grid.forces.map(f => {
							let dx = f.x - p.x,
								dy = f.y - p.y,
								d2 = dx**2 + dy**2;
							if (d2 <= f.radius) {
								p.x -= dx / 7;
								p.y -= dy / 7;
							}
						});
						// resist entropy
						let dxo = p.x - p.xo,
							dyo = p.y - p.yo;
						p.x -= dxo / 21;
						p.y -= dyo / 21;
					});
				});
				break;
		}
	},
	draw() {
		let Self = Anim,
			cvs = Self.cvs,
			ctx = Self.ctx,
			TAU = Math.PI * 2;
		// clear react
		ctx.clearRect(0, 0, cvs.width, cvs.height);

		if (Self.alpha) {
			Self.alpha.from += Self.alpha.step;
			// console.log( Self.alpha.from );
			ctx.globalAlpha = Self.alpha.from;

			if (Self.alpha.from <= Self.alpha.to && Self.alpha.mode) {
				Self.active = Self.alpha.mode;
				// reverse fade
				Self.alpha = { from: 0, to: 1, step: .025 };
			} else if (Self.alpha.from >= Self.alpha.to && !Self.alpha.mode) {
				// done fading
				delete Self.alpha;
			}
		}

		switch (Self.active) {
			case "grid":
				ctx.save();
				ctx.translate(.5, .5);
				ctx.strokeStyle = "#7788dd44";
				// horizontal lines
				Self.grid.points.map(row => {
					ctx.beginPath();
					ctx.moveTo(row[0].x, row[0].y);
					row.map(p => ctx.lineTo(p.x, p.y));
					ctx.stroke();
					ctx.closePath();
				});
				// vertical lines
				for (let x=0, xl=Self.grid.xl; x<xl; x++) {
					ctx.beginPath();
					ctx.moveTo(Self.grid.points[0][x].x, Self.grid.points[0][x].y);
					for (let y=0, yl=Self.grid.yl; y<yl; y++) {
						ctx.lineTo(Self.grid.points[y][x].x, Self.grid.points[y][x].y);
					}
					ctx.stroke();
					ctx.closePath();
				}
				ctx.restore();
				break;
			case "lines":
				// lines
				ctx.strokeStyle = `#aaddff33`;
				for (let i=0; i<=Self.lines.maxLines; i++) {
					ctx.beginPath();
					ctx.moveTo(-5, Self.startY);

					for (let x=0; x<cvs.width; x++) {
						let y = Self.lines.perlin.noise(x * Self.lines.variation + Self.lines.variators[i], x * Self.lines.variation, 0);
						ctx.lineTo(x, Self.lines.startY + Self.lines.amp * y);
					}
					ctx.stroke();
					ctx.closePath();
					// wavines
					Self.lines.variators[i] += .00075;
				}
				break;
		}

		// next tick
		if (!Self.paused) {
			Self.update(Self);
			requestAnimationFrame(Self.draw);
		}
	}
};

// auto call init
Anim.init();

// forward message / event
self.onmessage = event => Anim.dispatch(event.data);



// simple utils
let Utils = {
	// get a random number within a range
	random(min, max) {
		return Math.random() * ( max - min ) + min;
	},
	// calculate the distance between two points
	calculateDistance(p1x, p1y, p2x, p2y) {
		let xDistance = p1x - p2x,
			yDistance = p1y - p2y;
		return Math.sqrt((xDistance ** 2) + (yDistance ** 2));
	},
};


class Point {
	constructor(x, y) {
		this.x = x;
		this.y = y;
		this.xo = x;
		this.yo = y;
		this.vx = 0;
		this.vy = 0;
	}
}


class Explode {
	constructor(x, y, f=1) {
		this.x = x;
		this.y = y;
		this.v = 2.25;
		this.force = 50 * f;
		this.decay = 50 * f;
	}

	update() {
		this.decay--;
		this.radius = this.decay ** this.v;
		if (this.acc >= this.force) {
			let grid = Anim.grid,
				index = grid.forces.findIndex(e => e == this);
			grid.forces.splice(index, 1);
		}
	}
}

class ClassicalNoise {
	constructor(r) {
		if (r == undefined) r = Math;
		this.grad3 = [[1,1,0],[-1,1,0],[1,-1,0],[-1,-1,0], 
					 [1,0,1],[-1,0,1],[1,0,-1],[-1,0,-1], 
					 [0,1,1],[0,-1,1],[0,1,-1],[0,-1,-1]]; 
		this.p = [];
		for (let i=0; i<256; i++) {
			this.p[i] = Math.floor(r.random()*256);
		}
		// To remove the need for index wrapping, double the permutation table length 
		this.perm = []; 
		for(let i=0; i<512; i++) {
			this.perm[i]=this.p[i & 255];
		}
	}

	dot(g, x, y, z) { 
		return g[0]*x + g[1]*y + g[2]*z; 
	}

	mix(a, b, t) { 
		return (1.0-t)*a + t*b; 
	}

	fade(t) { 
		return t*t*t*(t*(t*6.0-15.0)+10.0); 
	}

	// Classic Perlin noise, 3D version 
	noise(x, y, z) { 
		// Find unit grid cell containing point 
		let X = Math.floor(x); 
		let Y = Math.floor(y); 
		let Z = Math.floor(z); 
		
		// Get relative xyz coordinates of point within that cell 
		x = x - X; 
		y = y - Y; 
		z = z - Z; 
		
		// Wrap the integer cells at 255 (smaller integer period can be introduced here) 
		X = X & 255; 
		Y = Y & 255; 
		Z = Z & 255;
		
		// Calculate a set of eight hashed gradient indices 
		let gi000 = this.perm[X+this.perm[Y+this.perm[Z]]] % 12; 
		let gi001 = this.perm[X+this.perm[Y+this.perm[Z+1]]] % 12; 
		let gi010 = this.perm[X+this.perm[Y+1+this.perm[Z]]] % 12; 
		let gi011 = this.perm[X+this.perm[Y+1+this.perm[Z+1]]] % 12; 
		let gi100 = this.perm[X+1+this.perm[Y+this.perm[Z]]] % 12; 
		let gi101 = this.perm[X+1+this.perm[Y+this.perm[Z+1]]] % 12; 
		let gi110 = this.perm[X+1+this.perm[Y+1+this.perm[Z]]] % 12; 
		let gi111 = this.perm[X+1+this.perm[Y+1+this.perm[Z+1]]] % 12; 
		
		// The gradients of each corner are now: 
		// g000 = grad3[gi000]; 
		// g001 = grad3[gi001]; 
		// g010 = grad3[gi010]; 
		// g011 = grad3[gi011]; 
		// g100 = grad3[gi100]; 
		// g101 = grad3[gi101]; 
		// g110 = grad3[gi110]; 
		// g111 = grad3[gi111]; 
		// Calculate noise contributions from each of the eight corners 
		let n000= this.dot(this.grad3[gi000], x, y, z); 
		let n100= this.dot(this.grad3[gi100], x-1, y, z); 
		let n010= this.dot(this.grad3[gi010], x, y-1, z); 
		let n110= this.dot(this.grad3[gi110], x-1, y-1, z); 
		let n001= this.dot(this.grad3[gi001], x, y, z-1); 
		let n101= this.dot(this.grad3[gi101], x-1, y, z-1); 
		let n011= this.dot(this.grad3[gi011], x, y-1, z-1); 
		let n111= this.dot(this.grad3[gi111], x-1, y-1, z-1); 
		// Compute the fade curve value for each of x, y, z 
		let u = this.fade(x); 
		let v = this.fade(y); 
		let w = this.fade(z); 
		 // Interpolate along x the contributions from each of the corners 
		let nx00 = this.mix(n000, n100, u); 
		let nx01 = this.mix(n001, n101, u); 
		let nx10 = this.mix(n010, n110, u); 
		let nx11 = this.mix(n011, n111, u); 
		// Interpolate the four results along y 
		let nxy0 = this.mix(nx00, nx10, v); 
		let nxy1 = this.mix(nx01, nx11, v); 
		// Interpolate the two last results along z 
		let nxyz = this.mix(nxy0, nxy1, w); 

		return nxyz;
	}
}

