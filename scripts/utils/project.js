// Classes
import { Project } from "../classes/Project.js";

/* @type {Project[]} */
export const projects = {};

export function loadProjects () {

	const storedProjects = JSON.parse(localStorage.getItem("projects") ?? "{}");
	
	for (const k in storedProjects) {
		projects[k] = new Project(k, storedProjects[k]);
	}
}

export async function saveProjects () {

	const serializedProjects = {};

	for await (const k of Object.keys(projects)) {
		serializedProjects[k] = await projects[k].serialize();
	}

	localStorage.setItem("projects", JSON.stringify(serializedProjects));
}

/**
 * @param {string} name 
 */
export function createProject (name) {

	if (!name)
		throw new Error("Missing project name");
	
	projects[name] = new Project(name);
	
	saveProjects();
}

/**
 * @param {string} id 
 */
export function openProject (id) {

	if (!id)
		throw new Error("Missing project ID");

	localStorage.setItem("currentProjectId", id);
	location.href = "/editor";
}

/**
 * @returns {Project | null}
 */
export function getCurrentProject () {

	const currentProjectId = localStorage.getItem("currentProjectId");

	return currentProjectId
		? projects[currentProjectId]
		: null;
}

/**
 * @param {string} id 
 */
export function deleteProject (id) {

	if (!id)
		throw new Error("Missing project ID");

	delete projects[id];
	saveProjects();
}

loadProjects();
