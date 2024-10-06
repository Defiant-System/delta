
// xwing.start

{
	init() {
		// fast references
		this.els = {
			content: window.find("content"),
			el: window.find(".start-view"),
		};
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
				el = Self.els.el.find(`.menu li[data-click="toggle-sound-fx"] b`);

				value = el.hasClass("off");
				el.toggleClass("off", value);
				el.html(value ? "On" : "Off");

				// toggle mute
				window.audio.mute = !value;
				// play sound fx
				window.audio.play("button");
				break;
			case "toggle-music":
				el = Self.els.el.find(`.menu li[data-click="toggle-music"] b`);

				value = el.hasClass("off");
				el.toggleClass("off", value);
				el.html(value ? "On" : "Off");

				// play sound fx
				window.audio.play("button");
				
				if (!Self.song) {
					let opt = {
						onend: e => {
							// turn "off" button
							// let el = Self.els.el.find(`.menu li[data-click="toggle-music"] b`),
							// 	value = el.hasClass("off");
							// el.toggleClass("off", value);
							// el.html(value ? "On" : "Off");
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
				// pause background worker
				Self.els.content.data({ show: "game-view" });
				// switch BG worker
				Bg.dispatch({ type: "set-active-mode", mode: "grid" });

				// start game
				if (Impact.game) {
					Impact.game.reset();
					Impact.game.setGame();
				} else {
					XType.startGame();
				}
				break;
		}
	}
}
