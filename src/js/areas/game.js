
// xwing.game

{
	init() {
		// fast references
		this.els = {
			el: window.find(".game-view"),
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
			case "set-opponents":
				// reset seats
				break;
		}
	}
}
