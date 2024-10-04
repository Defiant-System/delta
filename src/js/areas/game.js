
// xwing.game

{
	init() {
		// fast references
		this.els = {
			el: window.find(".game-view"),
			lives: window.find(".hud .lives"),
			score: window.find(".hud .score"),
		};
	},
	dispatch(event) {
		let APP = xwing,
			Self = APP.game,
			value,
			el;
		// console.log(event);
		switch (event.type) {
			// custom events
			case "set-lives":
				// reset seats
				Self.els.lives.data({ count: event.value });
				break;
		}
	}
}
