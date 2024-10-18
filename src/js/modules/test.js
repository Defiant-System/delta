
let Test = {
	init(APP) {
		// test / debug flag
		Test.debug = true;

		// return;

		// pause background worker
		// setTimeout(() => Bg.dispatch({ type: "pause" }), 300);
		// karaqu.joystick({ theme: "dark", right: "stick" });
		
		
		// return APP.content.addClass("show-fireworks");

		// APP.start.dispatch({ type: "new-game" });
		// APP.dispatch({ type: "show-view-game" });

		// setTimeout(() => Bg.dispatch({ type: "set-active-mode", mode: "grid" }), 1000);
		setTimeout(() => APP.start.dispatch({ type: "new-game" }), 300);
		// setTimeout(() => {
		// 	APP.content.find(".good-work")
		// 		.cssSequence("show", "animationend", el => {
		// 			console.log(el);
		// 		});
		// }, 1500);
		setTimeout(() => APP.dispatch({ type: "toggle-pause" }), 5000);

		// setTimeout(() => Impact.game.setGameOver(), 1000);
		// setTimeout(() => APP.game.dispatch({ type: "to-start-view" }), 2000);

		// setTimeout(() => Bg.dispatch({ type: "explode", x: 300, y: 300 }), 1000);
		// APP.content.on("mousedown", e => {
		// 	Bg.dispatch({ type: "explode", x: e.offsetX, y: e.offsetY, force: 1.5 })
		// });

		// APP.content.attr({ class: `show-game-over` });
		// APP.content.data({ show: "game-view" });

		// setTimeout(() => APP.dispatch({ type: "toggle-pause" }), 2000);

	}
};
