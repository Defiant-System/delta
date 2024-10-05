
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
			case "create-scene":
				// grid
				Self.grid = {
					margin: 30,
					size: 30,
					points: [],
					forces: [],
				};

				Self.grid.yl = ((Self.cvs.height - Self.grid.margin) / Self.grid.size) | 1;
				Self.grid.xl = ((Self.cvs.width - Self.grid.margin) / Self.grid.size) | 1;
				for (let y=0; y<Self.grid.yl; y++) {
					// insert row
					Self.grid.points[y] = [];
					for (let x=0; x<Self.grid.xl; x++) {
						// insert column (point)
						let pX = (x * Self.grid.size) + Self.grid.margin,
							pY = (y * Self.grid.size) + Self.grid.margin;
						Self.grid.points[y].push(new Point(pX, pY));
					}
				}
				break;
		}
	},
	update(Self) {
		let w = Self.cvs.width,
			h = Self.cvs.height;
	},
	draw() {
		let Self = Anim,
			cvs = Self.cvs,
			ctx = Self.ctx,
			TAU = Math.PI * 2;
		// clear react
		ctx.clearRect(0, 0, cvs.width, cvs.height);

		ctx.save();
		ctx.translate(.5, .5);
		ctx.strokeStyle = "#7788cc55";

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
	}
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
	constructor(x, y) {
		this.x = x;
		this.y = y;
	}
}

class Implode {
	constructor(x, y) {
		this.x = x;
		this.y = y;
	}
}

