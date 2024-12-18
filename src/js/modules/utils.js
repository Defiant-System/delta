
let Utils = {
	toRad(v) {
		return (v / 180) * Math.PI;
	},
	toDeg(v) {
		return (v * 180) / Math.PI;
	},
	toInt(v) {
		return (v | 0);
	},
	// get a random number within a range
	random(min, max) {
		return Math.random() * ( max - min ) + min;
	},
	createCanvas(w, h) {
		let cvs = $(document.createElement("canvas")),
			ctx = cvs[0].getContext("2d", { willReadFrequently: true });
		cvs.prop({ width: w || 1, height: h || 1 });
		return { cvs, ctx };
	}
};
