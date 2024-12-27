// Classes
import { Frame } from "./Frame.js";

// Utils
import { deserializeFrames, serializeFrames } from "../utils/frame.js";

export class Project {

	name = null;
	loaded = false;
	creationDate;

	/**
	 * @param {string} name 
	 * @param {Object} serializedData
	 */
	constructor (name, serializedData = {}) {
		
		this.name = name;
		this.frames = [];
		this.creationDate = Math.floor(Date.now() / 1000);

		if ("frames" in serializedData && serializedData.frames.length > 0)
			this.frames = serializedData.frames;
		if ("creationDate" in serializedData)
			this.creationDate = serializedData.creationDate
	}

	async load () {
		
		if (this.frames.length > 0)
			this.frames = await deserializeFrames(this.frames);
		else
			this.frames = [ new Frame() ];

		this.loaded = true;
	}

	async serialize () {
		return this.loaded
			? {
				frames: await serializeFrames(this.frames),
				creationDate: this.creationDate
			}
			: {
				frames: this.frames,
				creationDate: this.creationDate
			};
	}
}
