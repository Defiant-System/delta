
let Utils = {
	toRad() {
		return (this / 180) * Math.PI;
	},
	toDeg() {
		return (this * 180) / Math.PI;
	},
	toInt() {
		return (this | 0);
	},
	createCanvas(w, h) {
		let cvs = $(document.createElement("canvas")),
			ctx = cvs[0].getContext("2d", { willReadFrequently: true });
		cvs.prop({ width: w || 1, height: h || 1 });
		return { cvs, ctx };
	}
};
