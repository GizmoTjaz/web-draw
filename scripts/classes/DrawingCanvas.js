// Classes
import { Frame } from "./Frame.js";

// Utils
import { brushStroke, clearCanvas, loadFrame, selectBrush } from "../utils/canvas.js";

// DOM
const
	/** @type {HTMLInputElement} */
	brushWidthInput = document.getElementById("brush-width-input"),
	/** @type {HTMLInputElement} */
	brushPencilInput = document.getElementById("pencil-brush"),
	/** @type {HTMLInputElement} */
	brushEraserInput = document.getElementById("eraser-brush");

/**
 * @typedef {Object} Position2
 * @property {number} x
 * @property {number} y
*/

export class DrawingCanvas {
	
	/** @type {HTMLCanvasElement} */
	canvas;
	/** @type {CanvasRenderingContext2D} */
	ctx;

	/** @type {HTMLCanvasElement} */
	refCanvas;
	/** @type {CanvasRenderingContext2D} */
	refCtx;

	/** @type {Frame} */
	currentFrame;
	/** @type {Frame?} */
	refFrame;
	
	/** @type {Position2} */
	previousPosition;
	isDrawing = false;

	/** @type {Function} */
	onDrawUpdate = null;

	/**
	 * @param {HTMLCanvasElement} canvas 
	 * @param {HTMLCanvasElement} refCanvas
	 */
	constructor (canvas, refCanvas) {
		
		this.canvas = canvas;
		this.ctx = canvas.getContext("2d", { alpha: true });
		
		this.refCanvas = refCanvas;
		this.refCtx = refCanvas.getContext("2d", { alpha: true });

		this.currentFrame = new Frame();

		if (this.ctx === null) {
			alert("Failed to initialize CanvasRenderingContext2D");
			throw new Error("Failed to initialize CanvasRenderingContext2D");
		}

		this.previousPosition = { x: 0, y: 0 };

		this.canvas.addEventListener("mousedown", ({ offsetX: x, offsetY: y }) => {
			
			const normalizedPosition = this.normalizeBrushPosition({ x, y });

			this.previousPosition = normalizedPosition;
			this.brushStroke(normalizedPosition);

			this.isDrawing = true;
		});
	
		this.canvas.addEventListener("mouseup", () => {
			this.isDrawing = false;
			if (this.onDrawUpdate) this.onDrawUpdate();
		});
	
		this.canvas.addEventListener("mousemove", ({ offsetX: x, offsetY: y }) => {
			if (this.isDrawing) {
				this.brushStroke(this.normalizeBrushPosition({ x, y }));
			}
		});

		this.canvas.addEventListener("mouseleave", () => {
			this.isDrawing = false;
			if (this.onDrawUpdate) this.onDrawUpdate();
		});

		brushWidthInput.addEventListener("input", () => {

			const inputNumber = parseInt(brushWidthInput.value);

			if (!isNaN(inputNumber))
				this.ctx.lineWidth = inputNumber;
		});

		brushPencilInput.addEventListener("input", e => selectBrush(this.ctx, "pencil"));
		brushEraserInput.addEventListener("input", e => selectBrush(this.ctx, "eraser"));

		this.clear();
	}

	clear () {
		clearCanvas(this.ctx);
	}

	/**
	 * @param {Position2} position
	 */
	brushStroke ({ x, y }) {
		brushStroke(this.ctx, x, y, { prevX: this.previousPosition.x, prevY: this.previousPosition.y });
		this.previousPosition = { x, y };
		// this.currentFrame.history.push({ x, y });
	}

	/**
	 * @typedef {Object} LoadFrameOptions
	 * @property {Frame} frame 
	 * @property {Frame} [refFrame]
	 * @property {boolean} [isExporting]
	 */

	/**
	 * @param {LoadFrameOptions} options
	 */
	loadFrame ({ frame, refFrame, isExporting } = { isExporting: false}) {
		
		this.currentFrame = frame;
		this.refFrame = refFrame;

		clearCanvas(this.ctx);

		if (isExporting)
			loadFrame(this.ctx, frame, false);
		else
			loadFrame(this.ctx, frame);

		if (refFrame)
			loadFrame(this.refCtx, refFrame);
		else
			clearCanvas(this.refCtx);
	}

	/**
	 * @returns ImageData
	 */
	getCurrentImageData () {
		return this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
	}
	
	/**
	 * @param {Position2} position
	 */
	normalizeBrushPosition ({ x, y }) {
		return {
			x: (x / this.canvas.clientWidth) * this.canvas.width,
			y: (y / this.canvas.clientHeight) * this.canvas.height
		};
	}
}
