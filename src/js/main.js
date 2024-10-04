
@import "./modules/utils.js"

@import "./impact/impact.js"
@import "./impact/image.js"
@import "./impact/font.js" // to be removed
@import "./impact/sound.js" // to be removed
@import "./impact/loader.js"
@import "./impact/timer.js"
@import "./impact/system.js"
@import "./impact/input.js" // to be removed
@import "./impact/animation.js"
@import "./impact/entity.js"
@import "./impact/map.js"
@import "./impact/collision-map.js"
@import "./impact/background-map.js" // to be removed
@import "./impact/game.js"

@import "./game/entities/particle.js"
@import "./game/entities/crosshair.js"
@import "./game/entities/player.js"
@import "./game/entities/enemy.js"
@import "./game/entities/enemy-bullet.js"
@import "./game/entities/enemy-heart.js"
@import "./game/entities/enemy-missilebox.js"
@import "./game/entities/enemy-plasmabox.js"
@import "./game/entities/enemy-arm.js"

@import "./plugins/impact-splash-loader.js"
@import "./plugins/analog-stick.js" // to be removed

@import "./game/menus.js" // to be removed
@import "./game/main.js"

@import "./modules/bg.js"
@import "./modules/test.js"




const xwing = {
	init() {
		// fast references
		this.content = window.find("content");

		// init objects
		Bg.init();

		// init all sub-objects
		Object.keys(this)
			.filter(i => typeof this[i].init === "function")
			.map(i => this[i].init(this));

		// DEV-ONLY-START
		Test.init(this);
		// DEV-ONLY-END
	},
	dispatch(event) {
		let Self = xwing,
			value,
			el;
		// console.log(event.type);
		switch (event.type) {
			// system events
			case "window.init":
				break;
			case "window.close":
				// kill bg canvas worker
				Bg.dispatch({ type: "dispose" });
				break;
			case "window.focus":
				// resume background worker
				Bg.dispatch({ type: "resume" });
				break;
			case "window.blur":
				// pause background worker
				Bg.dispatch({ type: "pause" });
				break;
			case "window.keydown":
				switch (event.char) {
					// case "w":
					// case "up": Impact.input.presses["up"] = true; break;
					// case "s":
					// case "down": Impact.input.presses["down"] = true; break;
					// case "a":
					// case "left": Impact.input.presses["left"] = true; break;
					// case "d":
					// case "right": Impact.input.presses["right"] = true; break;
					case "p": Self.dispatch({ type: "toggle-pause" }); break;
				}
				break;
			case "window.keyup":
				switch (event.char) {
					// case "w":
					// case "up": Impact.input.presses["up"] = false; break;
					// case "s":
					// case "down": Impact.input.presses["down"] = false; break;
					// case "a":
					// case "left": Impact.input.presses["left"] = false; break;
					// case "d":
					// case "right": Impact.input.presses["right"] = false; break;
				}
				break;
			// custom events
			case "open-help":
				karaqu.shell("fs -u '~/help/index.md'");
				break;
			case "toggle-pause":
				// stop potential shooting
				window.audio.stop("plasma");

				if (XType.paused) {
					Impact.system.startRunLoop();
					XType.paused = false;
					// resume background worker
					Bg.dispatch({ type: "resume" });
				} else {
					Impact.system.stopRunLoop();
					XType.paused = true;
					// pause background worker
					Bg.dispatch({ type: "pause" });
				}
				break;
			case "start-view":
				// resume background worker
				Bg.dispatch({ type: "resume" });

				Self.content.data({ show: "start-view" });
				break;
			default:
				el = event.el;
				if (!el && event.origin) el = event.origin.el;
				if (el) {
					let pEl = el.parents(`?div[data-area]`);
					if (pEl.length) {
						let name = pEl.data("area");
						return Self[name].dispatch(event);
					}
				}
		}
	},
	start: @import "./areas/start.js",
	game: @import "./areas/game.js",
};

window.exports = xwing;
