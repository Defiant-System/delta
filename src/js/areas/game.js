
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
			total,
			el;
		// console.log(event);
		switch (event.type) {
			// custom events
			case "set-lives":
				// reset seats
				Self.els.lives.data({ count: event.value });
				break;
			case "update-score":
				// Self.els.score.html(event.value.toString().padStart(6, "0"));

				// player bankroll ticker
				value = +Self.els.score.text();
				total = +event.value;
				// Self.settings.hiscore = event.value;
				// ticker
				Self.els.score
					.css({
						"--value": value,
						"--total": total,
					})
					.cssSequence("ticker", "animationend", el => {
						// update score content
						el.removeClass("ticker")
							.html(total.toString().padStart(6, "0"))
							.cssProp({ "--value": "", "--total": "" });
					});
				break;
			case "end-fireworks":
				APP.content.removeClass("show-fireworks");
				APP.dispatch({ type: "show-view-start" });
				break;
		}
	}
}
