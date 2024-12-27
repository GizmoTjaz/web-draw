"use strict";

// Utils
import { projects, createProject, loadProjects, openProject, deleteProject } from "./utils/project.js";
import { deserializeFrame } from "./utils/frame.js";
import { loadFrameThumbnail } from "./utils/canvas.js";
import { createIconButton } from "./utils/dom.js";

// DOM
const
	/** @type {HTMLDivElement} */
	projectBrowserList = document.getElementById("project-browser-list"),
	/** @type {HTMLButtonElement} */
	projectBrowserCreateButton = document.getElementById("project-browser-create-button"),
	/** @type {HTMLButtonElement} */
	projectCreatorSubmitButton = document.getElementById("project-creator-submit"),
	/** @type {HTMLButtonElement} */
	projectCreatorCancelButton = document.getElementById("project-creator-cancel"),
	/** @type {HTMLDialogElement} */
	projectCreatorDialog = document.getElementById("project-creator-dialog"),
	/** @type {HTMLInputElement} */
	projectCreatorNameInput = document.getElementById("project-creator-name-input");

async function refreshProjectList () {

	while (projectBrowserList.firstChild) {
		projectBrowserList.removeChild(projectBrowserList.lastChild);
	}

	for await (const k of Object.keys(projects).sort((a, b) => projects[a].creationDate - projects[b].creationDate)) {

		const project = projects[k];

		const projectContainer = document.createElement("div");
		projectContainer.classList.add("project-container");
		projectContainer.id = `project-${k}`;

		const projectName = document.createElement("h1");
		projectName.classList.add("project-name");
		projectName.innerText = project.name;

		const projectThumbnailContainer = document.createElement("div");
		projectThumbnailContainer.classList.add("project-thumbnail");

		const projectThumbnail = document.createElement("canvas");
		projectThumbnail.width = 640;
		projectThumbnail.height = 480;

		if (project.frames.length > 0) {
			
			const thumbnail = await deserializeFrame(project.frames[0]);
			
			loadFrameThumbnail(projectThumbnail.getContext("2d"), thumbnail);
		}

		projectThumbnail.addEventListener("click", e => {
			openProject(e.currentTarget.parentElement.parentElement.id.split("project-")[1]);
		});
		
		const projectToolsContainer = document.createElement("div");
		projectToolsContainer.classList.add("project-tools-container");

		const projectDeleteButton = createIconButton("trash", { tooltip: "Delete project", classes: [ "destructive" ] });
		projectDeleteButton.classList.add("project-delete-button");

		projectDeleteButton.addEventListener("click", e => {
			deleteProject(e.currentTarget.parentElement.parentElement.id.split("project-")[1]);
			refreshProjectList();
		});

		projectToolsContainer.appendChild(projectDeleteButton);

		projectContainer.append(projectToolsContainer);
		projectContainer.appendChild(projectName);
		projectThumbnailContainer.appendChild(projectThumbnail);
		projectContainer.appendChild(projectThumbnailContainer);
		projectBrowserList.appendChild(projectContainer);
	}

}

document.addEventListener("DOMContentLoaded", () => {

	loadProjects();
	refreshProjectList();

	projectBrowserCreateButton.addEventListener("click", () => {
		projectCreatorDialog.showModal();
	});

	projectCreatorSubmitButton.addEventListener("click", () => {

		if (projectCreatorNameInput.value.length === 0)
			return;
		if (projectCreatorNameInput.value in projects)
			return;

		createProject(projectCreatorNameInput.value);
		
		projectCreatorDialog.close();
		refreshProjectList();
		projectCreatorNameInput.value = "";

	});

	projectCreatorCancelButton.addEventListener("click", () => {
		projectCreatorNameInput.value = "";
		projectCreatorDialog.close();
	});

});
