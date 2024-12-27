"use strict";

// Classes
import { FrameManager } from "./classes/FrameManager.js";

// Utils
import { getCurrentProject, saveProjects } from "./utils/project.js";

const
	/** @type {HTMLCanvasElement} */
	drawingCanvas = document.getElementById("drawing-canvas"),
	/** @type {HTMLCanvasElement} */
	refCanvas = document.getElementById("ref-canvas");

document.addEventListener("DOMContentLoaded", async () => {

	const project = getCurrentProject();

	if (!project) {
		location.href = "/";
		return;
	}

	await project.load();

	const frameManager = new FrameManager(project.frames, drawingCanvas, refCanvas);

	frameManager.onUpdate = (frames) => {
		project.frames = frames;
		saveProjects();
	};

});
