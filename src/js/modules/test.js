
let Test = {
	init(APP) {
		// return;
		
		// this.tmp = {};
		// this.tmp.cvs = window.find(".game-view canvas.tmp");
		// this.tmp.cvs.attr({ width: 480, height: 720 });
		// this.tmp.ctx = this.tmp.cvs[0].getContext("2d");

		// APP.start.dispatch({ type: "new-game" });
		APP.dispatch({ type: "show-view-game" });

		// setTimeout(() => Bg.dispatch({ type: "explode", x: 300, y: 300 }), 1000);
		APP.content.on("mousedown", e => {
			Bg.dispatch({ type: "explode", x: e.offsetX, y: e.offsetY })
		});

		// APP.content.data({ show: "game-view" });

		// setTimeout(() => APP.dispatch({ type: "toggle-pause" }), 3000);

	}
};
