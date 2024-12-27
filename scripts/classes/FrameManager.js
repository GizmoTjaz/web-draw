// Classes
import { Frame } from "./Frame.js";
import { DrawingCanvas } from "./DrawingCanvas.js";

// Utils
import { loadFrameThumbnail } from "../utils/canvas.js";
import { duplicateImageData } from "../utils/frame.js";
import { createIconButton } from "../utils/dom.js";

const
	/** @type {HTMLDivElement} */
	frameList = document.getElementById("frame-list"),
	/** @type {HTMLButtonElement} */
	frameAddButton = document.getElementById("frame-list-add-button"),
	/** @type {HTMLButtonElement} */
	frameDeleteButton = document.getElementById("frame-list-delete-button"),
	/** @type {HTMLButtonElement} */
	framePlayButton = document.getElementById("frame-list-play-button"),
	/** @type {HTMLImageElement} */
	framePlayButtonIcon = document.querySelector("#frame-list-play-button img"),
	/** @type {HTMLButtonElement} */
	exportButton = document.getElementById("export-button"),
	exportScreen = document.getElementById("export-screen");

const
	/** @type {HTMLCanvasElement} */
	exportCanvas = document.getElementById("drawing-canvas"),
	exportCtx = exportCanvas.getContext("2d");

/**
 * @param {HTMLElement} e 
 * @returns number
 */
function getFrameIdFromElement (el) {
	return parseInt(el.id.slice("frame-".length));
}

export class FrameManager {
	
	/** @type {Frame[]} */
	frames;
	/** @type {DrawingCanvas} */
	canvas;
	/** @type {Frame} */
	currentFrame = null;
	currentFrameId = 0;

	isPlaying = false;
	isExporting = false;

	onUpdate;
	onStop;

	/**
	 * @param {Frame[]} frames 
	 * @param {HTMLCanvasElement} canvas 
	 * @param {HTMLCanvasElement} refCanvas
	 */
	constructor (frames, canvas, refCanvas) {

		this.canvas = new DrawingCanvas(canvas, refCanvas);

		(async () => {

			this.frames = frames;
			this.loadFrame(0);
			this.updateFrames();

			this.canvas.onDrawUpdate = (f) => {
				this.currentFrame.image = this.canvas.getCurrentImageData();
				this.updateFrameThumbnail(this.currentFrameId);
				this.saveFrames();
			};
	
			frameAddButton.addEventListener("click", () => {
				if (!this.isBusy()) this.addFrame()
			});
			
			frameDeleteButton.addEventListener("click", () => {

				if (this.isBusy())
					return;

				this.frames = [ new Frame() ];
				this.loadFrame(0);
				this.updateFrames();
				this.saveFrames();
			});

			framePlayButton.addEventListener("click", () => {
				
				if (this.isExporting)
					return;

				this.isPlaying = !this.isPlaying;
				framePlayButtonIcon.src = this.isPlaying ? "./icons/pause.svg" : "./icons/play.svg";
				framePlayButtonIcon.alt = this.isPlaying ? "Pause" : "Play";
				framePlayButtonIcon.title = this.isPlaying ? "Pause" : "Play";

				if (this.isPlaying) {
					this.play();
				} else {
					this.loadFrame(this.currentFrameId);
				}
			});

			exportButton.addEventListener("click", () => {
				this.export().catch(err => alert(err));
			});

		})();
	}

	isBusy () {
		return this.isPlaying || this.isExporting;
	}

	/**
	 * @param {number} id 
	 */
	loadFrame (id) {
		
		document.getElementById(`frame-${this.currentFrameId}`)?.classList?.remove("selected");
		
		this.currentFrameId = id;
		this.currentFrame = this.frames[id];
		
		document.getElementById(`frame-${this.currentFrameId}`)?.classList?.add("selected");

		this.canvas.loadFrame({
			frame: this.currentFrame,
			refFrame: id > 0 && !this.isPlaying
				? this.frames[id - 1]
				: undefined,
			isExporting: this.isExporting
		});
	}

	/**
	 * @param {Frame} frame 
	 * @param {number} index 
	 */
	insertFrame (frame, index) {

		if (this.isBusy())
			return;

		this.frames = [
			...this.frames.slice(0, index + 1),
			frame,
			...this.frames.slice(index + 1)
		];

		this.updateFrames();
		this.saveFrames();
	}

	addFrame (frame) {

		if (this.isBusy())
			return;

		this.insertFrame(new Frame(), this.currentFrameId);
		this.loadFrame(this.currentFrameId + 1);
	}

	saveFrames () {
		if (this.onUpdate && !this.isExporting)
			this.onUpdate(this.frames);
	}

	// async loadFrames () {
		
	// 	const blobs = JSON.parse(localStorage.getItem("frames") ?? "[]");
	// 	const frames = [];

	// 	for await (const blob of blobs) {
	// 		frames.push(await getFrameFromBlob(serializedBlobToFrame(blob)));
	// 	}

	// 	this.frames = frames.length > 0 ? frames : [ new Frame() ];
	// }

	// async saveFrames () {
		
	// 	const blobs = [];

	// 	for await (const frame of this.frames) {
	// 		blobs.push(await frameToSerializedBlob(frame));
	// 	}
		
	// 	localStorage.setItem("frames", JSON.stringify(blobs));
	// }

	/**
	 * @param {number} id 
	 */
	deleteFrame (id) {
		
		if (this.isBusy())
			return;

		this.frames = this.frames.filter((_, i) => i !== id);

		if (this.frames.length === 0)
			this.frames = [ new Frame() ];
		
		if (this.currentFrameId === id)
			this.loadFrame(Math.min(id, this.frames.length - 1));
		else if (this.currentFrameId > id)
			this.loadFrame(this.currentFrameId - 1);
		else
			this.loadFrame(this.currentFrameId);

		this.updateFrames();
		this.saveFrames();
	}

	/**
	 * @param {number} id 
	 */
	duplicateFrame (id) {

		if (this.isBusy())
			return;

		const targetFrame = this.frames[id];

		const duplicateFrame = new Frame();
		duplicateFrame.image = duplicateImageData(targetFrame.image);

		this.insertFrame(duplicateFrame, id);
	}

	/**
	 * @param {number} id 
	 */
	updateFrameThumbnail (id) {

		const frameElement = document.querySelector(`#frame-${id} .mini-frame-canvas`);

		if (frameElement) {
			loadFrameThumbnail(frameElement.getContext("2d"), this.frames[id]);
		}
	}

	updateFrames () {

		if (this.isBusy())
			return;
		
		while (frameList.firstChild) {
			frameList.removeChild(frameList.lastChild);
		}

		for (let i = 0; i < this.frames.length; i++) {

			const frame = this.frames[i];

			const frameContainer = document.createElement("div");
			frameContainer.id = `frame-${i}`;
			frameContainer.classList.add("mini-frame-container");

			if (this.currentFrameId === i)
				frameContainer.classList.add("selected");
			
			const frameCanvas = document.createElement("canvas");
			frameCanvas.classList.add("mini-frame-canvas");
			frameCanvas.width = 640;
			frameCanvas.height = 480
			
			frameCanvas.addEventListener("click", e => this.loadFrame(getFrameIdFromElement(e.currentTarget.parentElement)));
			
			loadFrameThumbnail(frameCanvas.getContext("2d", { alpha: true }), frame);

			const frameControls = document.createElement("div");
			frameControls.classList.add("mini-frame-controls");

			const deleteFrameButton = createIconButton("trash", { tooltip: "Delete frame", classes: [ "destructive" ] });
			deleteFrameButton.classList.add("mini-frame-delete-button");
			deleteFrameButton.addEventListener("click", e => this.deleteFrame(getFrameIdFromElement(e.currentTarget.parentElement.parentElement)));
			
			const duplicateFrameButton = createIconButton("duplicate", { tooltip: "Duplicate frame" });
			duplicateFrameButton.classList.add("mini-frame-duplicate-button");
			duplicateFrameButton.addEventListener("click", e => this.duplicateFrame(getFrameIdFromElement(e.currentTarget.parentElement.parentElement)));
			
			frameControls.appendChild(deleteFrameButton);
			frameControls.appendChild(duplicateFrameButton);
			frameContainer.appendChild(frameControls);

			frameContainer.appendChild(frameCanvas);
			frameList.appendChild(frameContainer);
		}
	}

	renderPlaybackFrame (loop = true) {

		if (!this.isBusy())
			return;

		const nextFrameId = this.currentFrameId + 1;

		if (nextFrameId >= this.frames.length && !loop) {
			this.isPlaying = false;
			if (this.onStop) this.onStop();
			return;
		}		

		this.loadFrame(nextFrameId % this.frames.length);

		if (this.isPlaying) {
			setTimeout(() => {
				requestAnimationFrame(this.renderPlaybackFrame.bind(this, loop));
			}, 1000 / 23.999);
		}
	}

	play (loop = true) {
		
		if (this.frames.length === 0)
			return;

		this.isPlaying = true;
		// this.loadFrame(0);
		requestAnimationFrame(this.renderPlaybackFrame.bind(this, loop));
	}

	stop () {

		if (this.frames.length === 0)
			return;

		cancelAnimationFrame(this.renderPlaybackFrame());
		this.isPlaying = false;
		this.loadFrame(0);
	}

	export () {
		return new Promise((res, rej) => {

			if (this.isExporting) {
				rej("Already busy exporting.");
				return;
			}

			if (this.frames.length === 0) {
				rej("No frames to export.");
				return;
			}

			if (this.isPlaying) {
				rej("Already busy playing.");
				return;
			}

			this.isExporting = true;
			exportScreen.classList.add("active");

			const
				recorder = new MediaRecorder(exportCanvas.captureStream(23.999)),
				chunks = [];
			
			recorder.ondataavailable = e => {
				if (e.data.size > 0) {
					chunks.push(e.data);
				}
			};
			
			recorder.onstop = () => {
				
				const videoUrl = URL.createObjectURL(new Blob(chunks));

				window.open(videoUrl, "_blank").focus();
				this.isExporting = false;
				exportScreen.classList.remove("active");
			};

			this.onStop = () => {
				recorder.stop();
			};

			this.loadFrame(0);
			recorder.start();
			this.play(false);
		});
	}
}
