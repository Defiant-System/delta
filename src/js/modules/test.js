
let Test = {
	init(APP) {
		// return;
		
		
		// return APP.content.addClass("show-fireworks");

		APP.start.dispatch({ type: "new-game" });
		// APP.dispatch({ type: "show-view-game" });

		setTimeout(() => {
			// APP.dispatch({ type: "toggle-pause" });
			Impact.game.setGameOver();
		}, 1000);

		setTimeout(() => {
			APP.game.dispatch({ type: "to-start-view" });
		}, 2000);

		// setTimeout(() => Bg.dispatch({ type: "explode", x: 300, y: 300 }), 1000);
		// APP.content.on("mousedown", e => {
		// 	Bg.dispatch({ type: "explode", x: e.offsetX, y: e.offsetY, force: 1.5 })
		// });

		// APP.content.attr({ class: `show-game-over` });

		// APP.content.data({ show: "game-view" });

		// setTimeout(() => APP.dispatch({ type: "toggle-pause" }), 1000);

	}
};
