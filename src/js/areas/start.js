
// xwing.start

{
	init() {
		// fast references
		this.els = {
			content: window.find("content"),
			el: window.find(".start-view"),
		};
		
		XType.startGame();
	},
	dispatch(event) {
		let APP = xwing,
			Self = APP.start,
			value,
			el;
		// console.log(event);
		switch (event.type) {
			// custom events
			case "toggle-sound-fx":
				el = Self.els.content.find(`.menu li[data-click="toggle-sound-fx"] b`);

				value = el.hasClass("off");
				el.toggleClass("off", value);
				el.html(value ? "On" : "Off");

				// toggle mute
				window.audio.mute = !value;
				// play sound fx
				window.audio.play("button");
				break;
			case "toggle-music":
				el = Self.els.content.find(`.menu li[data-click="toggle-music"] b`);

				value = el.hasClass("off");
				el.toggleClass("off", value);
				el.html(value ? "On" : "Off");

				// play sound fx
				window.audio.play("button");
				
				if (!Self.song) {
					let opt = {
						volume: 1.5,
						onend: e => {
							// turn "off" button
							Self.els.content.find(`.menu li[data-click="toggle-music"] b`).addClass("off").html("Off");
							// reset reference
							delete Self.song;
						}
					};
					window.audio.play("song", opt).then(song => Self.song = song);
				} else {
					Self.song.stop();
					delete Self.song;
				}
				break;
			case "new-game":
				// show karaqu gamepad/joystick (at center bottom)
				karaqu.joystick({ theme: "dark", left: "stick", right: "stick" });
				
				// play sound fx
				window.audio.play("button");
				// switch BG worker
				Bg.dispatch({ type: "set-active-mode", mode: "grid" });

				// smooth transition to game view
				Self.els.content.cssSequence("to-game-view", "transitionend", el => {
					// pause background worker
					el.removeClass("to-game-view").data({ show: "game-view" });
					
						Impact.system.startRunLoop();
					// start game
					if (Impact.game) {
						Impact.game.reset();
						Impact.game.setGame(XType.MODE.GAME);
					}
				});
				break;
		}
	}
}
