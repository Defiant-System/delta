
let Bg = {
	init() {
		let worker = new Worker("~/js/bg-worker.js"),
			cvs = window.find("content canvas.bg"),
			width = +cvs.prop("offsetWidth"),
			height = +cvs.prop("offsetHeight");
		// reset canvas
		cvs.attr({ width, height });

		// save references to items
		this.cvs = cvs;
		this.worker = worker;

		// auto start bg
		this.dispatch({ type: "start" });
	},
	dispatch(event) {
		let Self = Bg,
			value;
		switch (event.type) {
			case "start":
				// transfer canvas control
				value = Self.cvs[0].transferControlToOffscreen();
				Self.worker.postMessage({ ...event, canvas: value }, [value]);
				break;
			case "pause":
				// if (!window.isFocused) 
				Self.worker.postMessage(event);
				break;
			case "resume":
				if (window.isFocused) Self.worker.postMessage(event);
				break;
			case "dispose":
				Self.worker.terminate();
				break;
		}
	}
};
