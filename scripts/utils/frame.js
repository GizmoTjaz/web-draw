// Classes
import { Frame } from "../classes/Frame.js";

const
	offCanvas = new OffscreenCanvas(640, 480),
	offCtx = offCanvas.getContext("2d");

/**
 * @param {Frame} frame 
 * @returns {Promise<string>}
 */
export function serializeFrame (frame) {
	return new Promise((res, rej) => {
		
		const reader = new FileReader();
		offCtx.putImageData(frame.image, 0, 0);

		offCanvas.convertToBlob().then(blob => {
			reader.readAsDataURL(blob);
			reader.onloadend = () => {
				res(reader.result.split(";base64,")[1]);
			};
		});
	});
}

/**
 * @param {Frame[]} frames 
 * @returns {Promise<string[]>}
 */
export function serializeFrames (frames) {
	return Promise.all(frames.map(frame => serializeFrame(frame)));
}

/**
 * @param {string} serializedBlob 
 * @returns {Blob}
 */
function serializedBlobToFrame (serializedBlob) {

	const a = new Uint8Array(atob(serializedBlob)
		.split("")
		.map(c => c.charCodeAt()));

	return new Blob([ a ]);
}

/**
 * @param {string} serializedFrame 
 * @returns {Promise<Frame>}
 */
export function deserializeFrame (serializedFrame) {
	return new Promise((res, rej) => {

		const image = new Image();

		image.onload = () => {
			
			const frame = new Frame();
			offCtx.clearRect(0, 0, offCanvas.width, offCanvas.height);
			offCtx.drawImage(image, 0, 0);
			frame.image = offCtx.getImageData(0, 0, offCanvas.width, offCanvas.height);

			res(frame);
		};

		image.src = URL.createObjectURL(serializedBlobToFrame(serializedFrame));
	});
}

/**
 * @param {string[]} frames 
 * @returns {Promise<Frame[]>}
 */
export function deserializeFrames (frames) {
	return Promise.all(frames.map(frame => deserializeFrame(frame)));
}

/**
 * @param {ImageData} imageData 
 * @returns {ImageData}
 */
export function duplicateImageData (imageData) {
	const newImageData = new ImageData(imageData.width, imageData.height);
	newImageData.data.set(new Uint8ClampedArray(imageData.data));
	return newImageData;
}
