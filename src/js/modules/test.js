
let Test = {
	init(APP) {
		// return;
		
		
		// return APP.content.addClass("show-fireworks");

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
