
// xwing.game

{
	init() {
		// fast references
		this.els = {
			el: window.find(".game-view"),
			content: window.find("content"),
			canvas: window.find(".game-view canvas.game"),
			goodWork: window.find(".game-view .good-work"),
			gameover: window.find(".view-game-over"),
			lives: window.find(".hud .lives"),
			score: window.find(".hud .score"),
		};
		// good work ranks
		this.encourage = [
				"Good Work",
				"Fantastic",
				"Imaginative",
				"Incredible",
				"Unreal",
				"Extravagant",
				"Tremendous",
				"Sensational",
				"Well Done",
				"Best Ever",
				"You Rock",
			];
		this.ranks = [
				"Private",
				"Gunner",
				"Trooper",
				"Specialist",
				"Corporal",
				"Sergeant",
				"Cadet",
				"Lieutenant",
				"Captain",
				"Major",
				"Colonel",
				"General",
				"Marshal",
			];
		// start game engine
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
				// hide karaqu gamepad/joystick
				karaqu.joystick();

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
			case "show-good-work":
				// encourage
				value = Self.encourage[Math.random() * Self.encourage.length | 0];
				Self.els.goodWork.find("h3").html(value);
				// rank
				value = Math.min(Impact.game.level.level-1, Self.ranks.length-1);
				Self.els.goodWork.find("h4").html(Self.ranks[value]);
				// animation
				Self.els.goodWork.cssSequence("show", "animationend", el => el.removeClass("show"));
				break;
			case "toggle-sound-fx":
			case "toggle-music":
				// play sound fx
				window.audio.play("button");
				// proxy event
				APP.start.dispatch(event);
				break;
			case "go-to-start":
				// play sound fx
				window.audio.play("button");
				// smooth transition to start view
				Self.els.content.cssSequence("pause-to-start-view", "transitionend", el => {
					// resume background worker
					Bg.dispatch({ type: "resume" });
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
				// play sound fx
				window.audio.play("button");
				// update hiscore
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
