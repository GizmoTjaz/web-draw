// Utils
import { duplicateImageData } from "./frame.js";

/**
 * @param {CanvasRenderingContext2D} ctx 
 */
export function clearCanvas (ctx) {

	if (!ctx)
		throw new Error("Missing canvas context");

	ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

	selectBrush(ctx, "pencil");
	ctx.lineCap = "round";
	ctx.lineWidth = 5;
}

/**
 * @typedef {Object} BrushStrokeOptions
 * @property {number} prevX
 * @property {number} prevY
 */

/**
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} x
 * @param {number} y
 * @param {BrushStrokeOptions} [options]
 */
export function brushStroke (ctx, x, y, options) {

	if (!ctx)
		throw new Error("Missing canvas context");

	ctx.beginPath();

	if (options)
		ctx.moveTo(options.prevX, options.prevY);
	else
		ctx.moveTo(x, y);

	ctx.lineTo(x, y);

	ctx.stroke();
	ctx.closePath();
}

/**
 * @param {CanvasRenderingContext2D} ctx
 * @param {Frame} frame 
 * @param {Frame} [refFrame] 
 */
export function loadFrame (ctx, frame, transparent = true) {
	
	if (!ctx)
		throw new Error("Missing canvas context");
	if (!frame)
		throw new Error("Missing frame");

	clearCanvas(ctx);

	if (frame.image) {
		if (transparent) {
			ctx.putImageData(frame.image, 0, 0);
		} else {

			const dupe = duplicateImageData(frame.image);

			for (let i = 0; i < dupe.data.length; i += 4) {
				if (dupe.data[i] === 0 && dupe.data[i + 1] === 0 && dupe.data[i + 2] === 0 && dupe.data[i + 3] === 0) {
					dupe.data[i + 0] = 255;
					dupe.data[i + 1] = 255;
					dupe.data[i + 2] = 255;
					dupe.data[i + 3] = 255;
				}
			}

			ctx.putImageData(dupe, 0, 0);
		}
	} else if (!transparent) {
		ctx.fillStyle = "#FFF";
		ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
	}
}

/**
 * @param {CanvasRenderingContext2D} ctx
 * @param {Frame} frame 
 */
export function loadFrameThumbnail (ctx, frame) {
	
	if (!ctx)
		throw new Error("Missing canvas context");
	if (!frame)
		throw new Error("Missing frame");

	clearCanvas(ctx);

	if (!frame.image) {
		loadFrame(ctx, frame);
		frame.image = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);
	}

	ctx.putImageData(frame.image, 0, 0);
}

/**
 * @param {CanvasRenderingContext2D} ctx 
 * @param {string} brush 
 */
export function selectBrush (ctx, brush) {
	switch (brush) {
		case "pencil":
			ctx.strokeStyle = "#000";
			ctx.fillStyle = "#000";
			break;
		case "eraser":
			ctx.strokeStyle = "#FFF";
			ctx.fillStyle = "#FFF";
			break;
		default:
	}
}
