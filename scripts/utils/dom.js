/**
 * @typedef {Object} IconOptions
 * @property {string} [tooltip]
 * @property {Array} [classes]
 */

/**
 * @param {string} iconName 
 * @param {IconOptions} [options] 
 * @returns {HTMLButtonElement}
 */
export function createIconButton (iconName, { tooltip, classes } = { tooltip: "", classes: [] }) {

	const button = document.createElement("button");
	button.classList.add("icon", ...(classes ?? []));

	const icon = document.createElement("img");
	icon.src = `./icons/${iconName}.svg`;
	icon.alt = tooltip;
	icon.title = tooltip;

	button.appendChild(icon);

	return button;
}
