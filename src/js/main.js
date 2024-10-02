
@import "./modules/utils.js"

@import "./impact/image.js"
@import "./impact/font.js"
@import "./impact/sound.js"
@import "./impact/loader.js"
@import "./impact/timer.js"
@import "./impact/system.js"
@import "./impact/input.js"
@import "./impact/impact.js"
@import "./impact/animation.js"
@import "./impact/entity.js"
@import "./impact/map.js"
@import "./impact/collision-map.js"
@import "./impact/background-map.js"
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

@import "./game/plugins/impact-splash-loader.js"
@import "./game/plugins/analog-stick.js"

@import "./game/menus.js"
@import "./game/main.js"

@import "./modules/test.js"


const xwing = {
	init() {
		// fast references
		this.content = window.find("content");

		// DEV-ONLY-START
		Test.init(this);
		// DEV-ONLY-END
	},
	dispatch(event) {
		switch (event.type) {
			// system events
			case "window.init":
				break;
			// custom events
			case "open-help":
				karaqu.shell("fs -u '~/help/index.md'");
				break;
		}
	}
};

window.exports = xwing;
