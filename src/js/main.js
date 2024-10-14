
@import "./modules/utils.js"

@import "./impact/impact.js"
@import "./impact/image.js"
//@*import "./impact/font.js" // to be removed
//@*import "./impact/sound.js" // to be removed
@import "./impact/loader.js"
@import "./impact/timer.js"
@import "./impact/system.js"
@import "./impact/input.js"
@import "./impact/animation.js"
@import "./impact/entity.js"
@import "./impact/map.js"
@import "./impact/collision-map.js"
//@*import "./impact/background-map.js" // to be removed
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
//@*import "./plugins/analog-stick.js" // to be removed

//@*import "./game/menus.js" // to be removed
@import "./game/main.js"

@import "./modules/bg.js"
@import "./modules/test.js"



// default settings
const defaultSettings = {
	hiscore: 0,
};


const xwing = {
	init() {
		// fast references
		this.content = window.find("content");

		// init objects
		Bg.init();

		// apply settings
		this.dispatch({ type: "init-settings" });

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
				// save settings
				window.settings.setItem("settings", Self.settings);
				// stop impact game loop
				Impact.system.stopRunLoop();
				XType.paused = true;
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
					case "w":
					case "up": Impact.input.pressed("up"); break;
					case "s":
					case "down": Impact.input.pressed("down"); break;
					case "a":
					case "left": Impact.input.pressed("left"); break;
					case "d":
					case "right": Impact.input.pressed("right"); break;
					case "p":
						Self.dispatch({ type: "toggle-pause" });
						break;
				}
				break;
			case "window.keyup":
				switch (event.char) {
					case "w":
					case "up": Impact.input.released("up"); break;
					case "s":
					case "down": Impact.input.released("down"); break;
					case "a":
					case "left": Impact.input.released("left"); break;
					case "d":
					case "right": Impact.input.released("right"); break;
				}
				break;
			case "gamepad.stick":
				// ship control
				if (event.stick === "left") {
					// reset input
					Impact.input.released("up");
					Impact.input.released("down");
					Impact.input.released("left");
					Impact.input.released("right");

					if (event.value[0] !== 0) {
						if (event.value[0] > 0) Impact.input.pressed("right");
						else Impact.input.pressed("left");
					}
					if (event.value[1] !== 0) {
						if (event.value[1] > 0) Impact.input.pressed("down");
						else Impact.input.pressed("up");
					}
				} else if (event.stick === "right") {
					// hair cross controll using joystick
					Impact.input.mouse.x = Impact.game.crosshair.pos.x + (3 * event.value[0]);
					Impact.input.mouse.y = Impact.game.crosshair.pos.y + (3 * event.value[1]);
				}
				break;
			case "gamepad.down":
				// start shooting
				Impact.input.pressed("shoot");
				break;
			case "gamepad.up":
				// stop shooting
				Impact.input.released("shoot");
				break;
			// custom events
			case "open-help":
				karaqu.shell("fs -u '~/help/index.md'");
				break;
			case "init-settings":
				// get settings, if any
				Self.settings = window.settings.getItem("settings") || defaultSettings;
				// show hiscore, if non-zero
				Self.dispatch({ type: "start-view-hiscore" });
				break;
			case "start-view-hiscore":
				if (Self.settings.hiscore > 0) {
					let hiScore = Self.content.find(".start-view .hiscore").removeClass("hidden");
					hiScore.find("b").html(Self.settings.hiscore);
				}
				break;
			case "toggle-pause":
				// stop potential shooting
				window.audio.stop("plasma");
				// play sound fx
				window.audio.play("button");

				if (Self.content.data("show") !== "game-view" || Impact.game.mode !== XType.MODE.GAME) return;

				if (XType.paused) {
					// show karaqu gamepad/joystick
					karaqu.joystick({ theme: "dark", left: "stick", right: "stick" });

					Impact.system.startRunLoop();
					XType.paused = false;
					// hide pause view
					Self.content.removeClass("show-pause");
					// resume background worker
					Bg.dispatch({ type: "resume" });
				} else {
					// hide karaqu gamepad/joystick
					karaqu.joystick();

					Impact.system.stopRunLoop();
					XType.paused = true;
					// show pause view
					Self.content.addClass("show-pause");
					// pause background worker
					Bg.dispatch({ type: "pause" });
				}
				break;
			case "show-view-start":
				Self.content.data({ show: "start-view" });
				break;
			case "show-view-game":
				Self.content.data({ show: "game-view" });
				break;
			case "show-view-pause":
			case "show-view-game-over":
				Self.content.attr({ class: `show-${event.type.slice(10)}` });
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
