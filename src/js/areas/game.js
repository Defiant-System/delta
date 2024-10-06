
// xwing.game

{
	init() {
		// fast references
		this.els = {
			el: window.find(".game-view"),
			content: window.find("content"),
			gameover: window.find(".view-game-over"),
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
			case "show-game-over":
				// stop potential shooting
				window.audio.stop("plasma");
				// update UI
				Self.els.content.attr({ class: `show-game-over` });
				// show score on "game over" view
				value = 2300; // +Self.els.score.html();
				Self.els.gameover.find("h4").html(value);

				if (value > APP.settings.hiscore) {
					Self.els.gameover.addClass("fireworks");
				}
				break;
			case "to-resume-game":
				Self.els.content.removeClass("show-pause");
				break;
			case "to-start-view":
				APP.dispatch({ type: "start-view-hiscore" });
				// smooth transition to start view
				Self.els.content.cssSequence("to-start-view", "transitionend", el => {
					// reset UI
					Self.els.gameover.removeClass("fireworks");
					// switch BG worker
					Bg.dispatch({ type: "set-active-mode", mode: "lines" });
					// reset content element
					el.removeClass("show-game-over to-start-view").data({ show: "start-view" });
				});
				break;
		}
	}
}
