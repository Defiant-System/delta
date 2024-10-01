
let Utils = {
	toRad() {
		return (this / 180) * Math.PI;
	},
	toDeg() {
		return (this * 180) / Math.PI;
	},
	toInt() {
		return (this | 0);
	}
};
