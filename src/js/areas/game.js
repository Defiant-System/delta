
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

		XType.startGame();
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
				value = +Self.els.score.cssProp("--total");
				Self.els.gameover.find("h4").html(value);

				if (value > APP.settings.hiscore) {
					// update settings hiscore
					APP.settings.hiscore = value;
					// show fireworks
					Self.els.gameover.addClass("fireworks");
					// auto go to start view
					setTimeout(() => {
						if (Self.els.content.hasClass("show-game-over")) {
							Self.dispatch({ type: "to-start-view" });
						}
					}, 5e3);
				}
				break;
			case "toggle-sound-fx":
			case "toggle-music":
				APP.start.dispatch(event);
				break;
			case "toggle-pause":
				APP.start.dispatch(event);
				break;
			case "go-to-start":
				// smooth transition to start view
				Self.els.content.cssSequence("pause-to-start-view", "transitionend", el => {
					// switch BG worker
					Bg.dispatch({ type: "set-active-mode", mode: "lines" });
					// reset content element
					el.removeClass("show-pause pause-to-start-view").data({ show: "start-view" });
					// impact specific calls
					Impact.system.startRunLoop();
					XType.paused = false;
					Impact.game.setGame(XType.MODE.GAME_OVER);
				});
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
