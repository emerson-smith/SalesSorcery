import { getXPathForElement, getElementByXPath } from "../utils/xpath";

// initialize variables
let textEditingEnabled = false;
let imageEditingEnabled = false;
let showEditsEnabled = false;

// HELPER FUNCTIONS
const createButton = (content, classes, onClick) => {
	const btn = document.createElement("div");
	btn.classList.add("SSbtn", ...classes);
	btn.innerHTML = content;
	btn.onclick = onClick;
	return btn;
};

const createButtonContainer = (element, buttons) => {
	const rect = element.getBoundingClientRect();
	const left = rect.left + window.pageXOffset;
	const bottom = rect.bottom + window.pageYOffset;

	const buttonContainer = document.createElement("div");
	buttonContainer.style.left = left + "px";
	buttonContainer.style.top = bottom + "px";
	buttonContainer.classList.add("SS-styles");

	buttons.forEach((button) => {
		buttonContainer.appendChild(button);
	});

	return buttonContainer;
};

const updateButtonContainerPosition = (buttonContainer, element) => {
	const rect = element.getBoundingClientRect();
	const left = rect.left + window.pageXOffset;
	const bottom = rect.bottom + window.pageYOffset;
	buttonContainer.style.left = left + "px";
	buttonContainer.style.top = bottom + "px";
};

const createCornerCircles = (element) => {
	const rect = element.getBoundingClientRect();
	const left = rect.left + window.pageXOffset;
	const right = rect.right + window.pageXOffset;
	const bottom = rect.bottom + window.pageYOffset;
	const top = rect.top + window.pageYOffset;

	const createCircle = (x, y) => {
		const circle = document.createElement("div");
		circle.style.position = "absolute";
		circle.style.left = x + "px";
		circle.style.top = y + "px";
		circle.style.width = "10px";
		circle.style.height = "10px";
		circle.style.borderRadius = "50%";
		circle.style.backgroundColor = "blue";
		circle.style.cursor = "pointer";
		circle.style.zIndex = "9999";
		return circle;
	};

	const topLeftCircle = createCircle(left - 5, top - 5);
	const topRightCircle = createCircle(right - 5, top - 5);
	const bottomLeftCircle = createCircle(left - 5, bottom - 5);
	const bottomRightCircle = createCircle(right - 5, bottom - 5);

	return [topLeftCircle, topRightCircle, bottomLeftCircle, bottomRightCircle];
};

const updateCornerCircles = (cornerCircles, element) => {
	const rect = element.getBoundingClientRect();
	const left = rect.left + window.pageXOffset;
	const right = rect.right + window.pageXOffset;
	const bottom = rect.bottom + window.pageYOffset;
	const top = rect.top + window.pageYOffset;
	cornerCircles[0].style.left = left - 5 + "px";
	cornerCircles[0].style.top = top - 5 + "px";
	cornerCircles[1].style.left = right - 5 + "px";
	cornerCircles[1].style.top = top - 5 + "px";
	cornerCircles[2].style.left = left - 5 + "px";
	cornerCircles[2].style.top = bottom - 5 + "px";
	cornerCircles[3].style.left = right - 5 + "px";
	cornerCircles[3].style.top = bottom - 5 + "px";
};

const createResizeHandler = (element, selectedCircle, cornerCircles, buttonContainer) => {
	return (event) => {
		event.stopPropagation();
		const rect = element.getBoundingClientRect();
		const startX = event.clientX;
		const startY = event.clientY;

		const onMouseMove = (event) => {
			const dx = event.clientX - startX;
			const dy = event.clientY - startY;
			const left = rect.left + window.pageXOffset;
			const top = rect.top + window.pageYOffset;

			if (selectedCircle === cornerCircles[0]) {
				element.style.width = rect.width - dx + "px";
				element.style.height = rect.height - dy + "px";
				element.style.left = left + dx + "px";
				element.style.top = top + dy + "px";
			} else if (selectedCircle === cornerCircles[1]) {
				element.style.width = rect.width + dx + "px";
				element.style.height = rect.height - dy + "px";
				element.style.top = top + dy + "px";
			} else if (selectedCircle === cornerCircles[2]) {
				element.style.width = rect.width - dx + "px";
				element.style.height = rect.height + dy + "px";
				element.style.left = left + dx + "px";
			} else if (selectedCircle === cornerCircles[3]) {
				element.style.width = rect.width + dx + "px";
				element.style.height = rect.height + dy + "px";
			}

			updateCornerCircles(cornerCircles, element);
			updateButtonContainerPosition(buttonContainer, element);
		};

		const onMouseUp = () => {
			document.removeEventListener("mousemove", onMouseMove);
			document.removeEventListener("mouseup", onMouseUp);
		};

		document.addEventListener("mousemove", onMouseMove);
		document.addEventListener("mouseup", onMouseUp);
	};
};

// Function to handle text editing
const editText = (event) => {
	if (!textEditingEnabled) return;
	if (event.target.tagName === "INPUT" || event.target.tagName === "TEXTAREA") return;

	const originalElement = event.target;
	const originalDisplayStyle = window.getComputedStyle(originalElement, "").display;

	const newElement = document.createElement(originalElement.tagName);
	newElement.setAttribute("contenteditable", "true");

	newElement.textContent = originalElement.textContent;
	for (let i = 0; i < originalElement.classList.length; i++) {
		newElement.classList.add(originalElement.classList[i]);
	}
	newElement.classList.add("SS-newElement");
	newElement.style.display = originalDisplayStyle;
	newElement.addEventListener("click", (event) => {
		event.preventDefault(); // Prevent the default behavior (e.g., switching focus)
		event.stopPropagation(); // Prevent the event from propagating to other elements
		event.stopImmediatePropagation(); // Prevent other event handlers on the same element from being called
	});

	originalElement.parentElement.insertBefore(newElement, originalElement);
	originalElement.style.display = "none";

	const saveBtnContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" class="SS-icon"><path d="M64 32C28.7 32 0 60.7 0 96V416c0 35.3 28.7 64 64 64H384c35.3 0 64-28.7 64-64V173.3c0-17-6.7-33.3-18.7-45.3L352 50.7C340 38.7 323.7 32 306.7 32H64zm0 96c0-17.7 14.3-32 32-32H288c17.7 0 32 14.3 32 32v64c0 17.7-14.3 32-32 32H96c-17.7 0-32-14.3-32-32V128zM224 288a64 64 0 1 1 0 128 64 64 0 1 1 0-128z"/></svg>`;
	const saveBtn = createButton(saveBtnContent, ["SSbtn-primary", "SSbtn-square", "SSbtn-sm"], () => {
		const newText = newElement.textContent;
		const originalContent = originalElement.textContent;
		originalElement.textContent = newText;
		getOutOfEditMode();

		// Save the changes to browser's local storage
		const xpath = getXPathForElement(originalElement);
		const data = {
			newContent: newText,
			url: window.location.href,
			xpath,
			type: "text",
		};
		saveElementToStorage(data, originalContent);
	});

	const resetBtnContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" class="SS-icon"><path d="M105.1 202.6c7.7-21.8 20.2-42.3 37.8-59.8c62.5-62.5 163.8-62.5 226.3 0L386.3 160H336c-17.7 0-32 14.3-32 32s14.3 32 32 32H463.5c0 0 0 0 0 0h.4c17.7 0 32-14.3 32-32V64c0-17.7-14.3-32-32-32s-32 14.3-32 32v51.2L414.4 97.6c-87.5-87.5-229.3-87.5-316.8 0C73.2 122 55.6 150.7 44.8 181.4c-5.9 16.7 2.9 34.9 19.5 40.8s34.9-2.9 40.8-19.5zM39 289.3c-5 1.5-9.8 4.2-13.7 8.2c-4 4-6.7 8.8-8.1 14c-.3 1.2-.6 2.5-.8 3.8c-.3 1.7-.4 3.4-.4 5.1V448c0 17.7 14.3 32 32 32s32-14.3 32-32V396.9l17.6 17.5 0 0c87.5 87.4 229.3 87.4 316.7 0c24.4-24.4 42.1-53.1 52.9-83.7c5.9-16.7-2.9-34.9-19.5-40.8s-34.9 2.9-40.8 19.5c-7.7 21.8-20.2 42.3-37.8 59.8c-62.5 62.5-163.8 62.5-226.3 0l-.1-.1L125.6 352H176c17.7 0 32-14.3 32-32s-14.3-32-32-32H48.4c-1.6 0-3.2 .1-4.8 .3s-3.1 .5-4.6 1z"/></svg>`;
	const resetBtn = createButton(resetBtnContent, ["SSbtn-primary", "SSbtn-square", "SSbtn-sm"], async () => {
		const xpath = getXPathForElement(originalElement);
		const url = window.location.href;
		const element = await findElementInStorage(url, xpath);
		if (element) {
			newElement.textContent = element.originalContent;
		} else {
			newElement.textContent = originalElement.textContent;
		}
	});

	const cancleBtnContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512" class="SS-icon"><path d="M342.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 210.7 86.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L146.7 256 41.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 301.3 297.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.3 256 342.6 150.6z"/></svg>`;
	const cancelBtn = createButton(cancleBtnContent, ["SSbtn-accent", "SSbtn-square", "SSbtn-sm"], () => {
		getOutOfEditMode();
	});

	const buttonContainer = createButtonContainer(newElement, [saveBtn, resetBtn, cancelBtn]);
	newElement.parentElement.insertBefore(buttonContainer, newElement.nextSibling);

	const getOutOfEditMode = () => {
		newElement.remove();
		buttonContainer.remove();
		originalElement.style.display = originalDisplayStyle;
	};

	newElement.focus();
};

const editImage = (event) => {
	if (!imageEditingEnabled) return;
	if (event.target.tagName !== "IMG") return;
	event.preventDefault(); // Prevent the default behavior (e.g., switching focus)
	event.stopPropagation(); // Prevent the event from propagating to other elements
	event.stopImmediatePropagation(); // Prevent other event handlers on the same element from being called

	const originalImage = event.target;
	const originalDisplayStyle = window.getComputedStyle(originalImage, "").display;
	const originalContent = originalImage.src;

	const newImage = document.createElement(originalImage.tagName);
	for (let i = 0; i < originalImage.classList.length; i++) {
		newImage.classList.add(originalImage.classList[i]);
	}
	newImage.classList.add("SS-newElement-image");
	newImage.style.display = originalDisplayStyle;
	newImage.addEventListener("click", (event) => {
		event.preventDefault(); // Prevent the default behavior (e.g., switching focus)
		event.stopPropagation(); // Prevent the event from propagating to other elements
		event.stopImmediatePropagation(); // Prevent other event handlers on the same element from being called
	});
	newImage.src = originalImage.src;
	// add all style properties from original image to new image
	const computedStyles = window.getComputedStyle(originalImage);
	for (let i = 0; i < computedStyles.length; i++) {
		const property = computedStyles[i];
		newImage.style.setProperty(property, computedStyles.getPropertyValue(property), computedStyles.getPropertyPriority(property));
	}

	originalImage.parentElement.insertBefore(newImage, originalImage);
	originalImage.style.display = "none";

	// Create corner circles
	const cornerCircles = createCornerCircles(newImage);

	// Create "Change", "Save", and "Cancel" buttons
	const changeBtnContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" class="SS-icon"><path d="M0 96C0 60.7 28.7 32 64 32H448c35.3 0 64 28.7 64 64V416c0 35.3-28.7 64-64 64H64c-35.3 0-64-28.7-64-64V96zM323.8 202.5c-4.5-6.6-11.9-10.5-19.8-10.5s-15.4 3.9-19.8 10.5l-87 127.6L170.7 297c-4.6-5.7-11.5-9-18.7-9s-14.2 3.3-18.7 9l-64 80c-5.8 7.2-6.9 17.1-2.9 25.4s12.4 13.6 21.6 13.6h96 32H424c8.9 0 17.1-4.9 21.2-12.8s3.6-17.4-1.4-24.7l-120-176zM112 192a48 48 0 1 0 0-96 48 48 0 1 0 0 96z"/></svg>`;
	const changeBtn = createButton(changeBtnContent, ["SSbtn-secondary", "SSbtn-square", "SSbtn-sm"], () => {
		const imageInput = document.createElement("input");
		imageInput.type = "file";
		imageInput.accept = "image/*";
		imageInput.style.display = "none";

		imageInput.onchange = (event) => {
			const file = event.target.files[0];
			const reader = new FileReader();
			reader.onload = (event) => {
				newImage.src = event.target.result;
			};
			reader.readAsDataURL(file);
		};

		newImage.parentElement.appendChild(imageInput);
		imageInput.click();
		newImage.parentElement.removeChild(imageInput);
	});

	const saveBtnContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" class="SS-icon"><path d="M64 32C28.7 32 0 60.7 0 96V416c0 35.3 28.7 64 64 64H384c35.3 0 64-28.7 64-64V173.3c0-17-6.7-33.3-18.7-45.3L352 50.7C340 38.7 323.7 32 306.7 32H64zm0 96c0-17.7 14.3-32 32-32H288c17.7 0 32 14.3 32 32v64c0 17.7-14.3 32-32 32H96c-17.7 0-32-14.3-32-32V128zM224 288a64 64 0 1 1 0 128 64 64 0 1 1 0-128z"/></svg>`;
	const saveBtn = createButton(saveBtnContent, ["SSbtn-primary", "SSbtn-square", "SSbtn-sm"], () => {
		originalImage.src = newImage.src;
		originalImage.style.width = newImage.style.width;
		originalImage.style.height = newImage.style.height;
		getOutOfEditMode();

		// Save the changes to browser's local storage
		const xpath = getXPathForElement(originalImage);
		const data = {
			newContent: originalImage.src,
			width: originalImage.style.width,
			height: originalImage.style.height,
			url: window.location.href,
			xpath,
			type: "image",
		};
		saveElementToStorage(data, originalContent);
	});

	const cancleBtnContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512" class="SS-icon"><path d="M342.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 210.7 86.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L146.7 256 41.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 301.3 297.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.3 256 342.6 150.6z"/></svg>`;
	const cancelBtn = createButton(cancleBtnContent, ["SSbtn-accent", "SSbtn-square", "SSbtn-sm"], () => {
		getOutOfEditMode();
	});

	// Create button container and add the buttons to the DOM
	const buttonContainer = createButtonContainer(newImage, [changeBtn, saveBtn, cancelBtn]);
	document.body.appendChild(buttonContainer);
	const getOutOfEditMode = () => {
		cornerCircles.forEach((circle) => {
			circle.remove();
		});
		newImage.remove();
		buttonContainer.remove();
		originalImage.style.display = originalDisplayStyle;
	};

	// Add circles to the DOM
	cornerCircles.forEach((circle) => {
		document.body.appendChild(circle);
		circle.addEventListener("mousedown", createResizeHandler(newImage, circle, cornerCircles, buttonContainer));
	});
};

const createOverlay = (event) => {
	// Create the overlay
	const overlay = document.createElement("div");
	overlay.style.position = "absolute";
	overlay.style.left = window.innerWidth / 2 + window.pageXOffset + "px";
	overlay.style.top = window.innerHeight / 2 + window.pageYOffset + "px";
	overlay.style.width = "300px";
	overlay.style.height = "300px";
	overlay.style.backgroundColor = "black";
	// overlay.style.backdropFilter = "blur(5px)";
	overlay.style.border = "1px solid #b3d4fc";
	overlay.style.zIndex = "9999";
	overlay.classList.add("SS-overlay");
	document.body.appendChild(overlay);

	// Create corner circles
	const cornerCircles = createCornerCircles(overlay);

	const saveBtnContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" class="SS-icon"><path d="M64 32C28.7 32 0 60.7 0 96V416c0 35.3 28.7 64 64 64H384c35.3 0 64-28.7 64-64V173.3c0-17-6.7-33.3-18.7-45.3L352 50.7C340 38.7 323.7 32 306.7 32H64zm0 96c0-17.7 14.3-32 32-32H288c17.7 0 32 14.3 32 32v64c0 17.7-14.3 32-32 32H96c-17.7 0-32-14.3-32-32V128zM224 288a64 64 0 1 1 0 128 64 64 0 1 1 0-128z"/></svg>`;
	const saveBtn = createButton(saveBtnContent, ["SSbtn-primary", "SSbtn-square", "SSbtn-sm"], () => {
		const rect = overlay.getBoundingClientRect();
		rect.x = rect.left + window.pageXOffset;
		rect.y = rect.top + window.pageYOffset;
		const data = {
			rect: JSON.stringify(rect),
			url: window.location.href,
			type: "overlay",
		};
		saveElementToStorage(data);
		getOutOfEditMode();
	});

	// make overlay white button
	const colorChangeBtnContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" class="SS-icon"><path d="M0 96C0 60.7 28.7 32 64 32H384c35.3 0 64 28.7 64 64V416c0 35.3-28.7 64-64 64H64c-35.3 0-64-28.7-64-64V96z"/></svg>`;
	const whiteChangeBtn = createButton("white", ["SSbtn-secondary", "SSbtn-xs"], () => {
		overlay.style.backgroundColor = "white";
	});
	const blackChangeBtn = createButton("black", ["SSbtn-secondary", "SSbtn-xs"], () => {
		overlay.style.backgroundColor = "black";
	});
	const blurChangeBtn = createButton("blur", ["SSbtn-secondary", "SSbtn-xs"], () => {
		overlay.style.backgroundColor = "transparent";
		overlay.style.backdropFilter = "blur(5px)";
	});

	const cancleBtnContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512" class="SS-icon"><path d="M342.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 210.7 86.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L146.7 256 41.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 301.3 297.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.3 256 342.6 150.6z"/></svg>`;
	const cancelBtn = createButton(cancleBtnContent, ["SSbtn-accent", "SSbtn-square", "SSbtn-sm"], () => {
		overlay.remove();
		getOutOfEditMode();
	});
	const buttonContainer = createButtonContainer(overlay, [saveBtn, cancelBtn, whiteChangeBtn, blackChangeBtn, blurChangeBtn]);

	const getOutOfEditMode = () => {
		cornerCircles.forEach((circle) => circle.remove());
		buttonContainer.remove();
		// remove mouse down event listener
		overlay.removeEventListener("mousedown", onOverlayMouseDown);
	};

	// Function to handle mouse down event on the overlay
	const onOverlayMouseDown = (event) => {
		const startX = event.clientX;
		const startY = event.clientY;
		const originalLeft = parseInt(overlay.style.left, 10);
		const originalTop = parseInt(overlay.style.top, 10);

		// Function to handle mouse move event
		const onOverlayMouseMove = (event) => {
			const dx = event.clientX - startX;
			const dy = event.clientY - startY;

			// Update the overlay position
			overlay.style.left = originalLeft + dx + "px";
			overlay.style.top = originalTop + dy + "px";
			updateCornerCircles(cornerCircles, overlay);
			updateButtonContainerPosition(buttonContainer, overlay);
		};

		// Function to handle mouse up event
		const onOverlayMouseUp = () => {
			// Remove event listeners
			document.removeEventListener("mousemove", onOverlayMouseMove);
			document.removeEventListener("mouseup", onOverlayMouseUp);
		};

		// Add event listeners
		document.addEventListener("mousemove", onOverlayMouseMove);
		document.addEventListener("mouseup", onOverlayMouseUp);
	};

	// Add mouse down event listener to the overlay
	overlay.addEventListener("mousedown", onOverlayMouseDown);

	// Create and add corner circles to the DOM
	cornerCircles.forEach((circle) => {
		document.body.appendChild(circle);
		circle.addEventListener("mousedown", createResizeHandler(overlay, circle, cornerCircles, buttonContainer));
	});

	// Add the "Save" and "Cancel" buttons to the DOM
	document.body.appendChild(buttonContainer);
};

document.body.addEventListener("dblclick", editText);
document.body.addEventListener("dblclick", editImage);

// Update applyChangesFromStorage function to include image and overlay changes
const applyChangesFromStorage = () => {
	// Apply changes from browser's local storage
	chrome.storage.local.get(["fakeItData"], (result) => {
		const fakeItData = result.fakeItData || [];
		console.log("applying changes from storage", fakeItData);

		for (let i = 0; i < fakeItData.length; i++) {
			const data = fakeItData[i];

			if (data.url === window.location.href) {
				const element = getElementByXPath(data.xpath);
				if (element) {
					if (data.type === "text") {
						// update storage with original text
						fakeItData[i].originalContent = element.textContent;
						// make the changes to page
						element.textContent = data.newContent;
					} else if (data.type === "image") {
						fakeItData[i].originalContent = element.src;
						element.src = data.newContent;
						element.style.width = data.width;
						element.style.height = data.height;
					}
				} else if (data.type === "overlay") {
					const rect = JSON.parse(data.rect);
					const overlay = document.createElement("div");
					overlay.style.position = "absolute";
					overlay.style.left = `${rect.x}px`;
					overlay.style.top = `${rect.y}px`;
					overlay.style.width = `${rect.width}px`;
					overlay.style.height = `${rect.height}px`;
					overlay.style.backgroundColor = "black";
					// overlay.style.backdropFilter = "blur(5px)";
					overlay.style.border = "1px solid #b3d4fc";
					overlay.style.zIndex = "9999";
					document.body.appendChild(overlay);
				}
			}
		}
	});
};

// Function to find an element in storage
const findElementInStorage = (url, xpath) => {
	return new Promise((resolve) => {
		chrome.storage.local.get(["fakeItData"], (result) => {
			const fakeItData = result.fakeItData || [];
			//   console.log('finding element in storage', fakeItData)

			for (let i = 0; i < fakeItData.length; i++) {
				if (fakeItData[i].url === url && fakeItData[i].xpath === xpath) {
					//   console.log('found element in storage', fakeItData[i])
					resolve(fakeItData[i]);
				}
			}
			resolve(null);
		});
	});
};

// Function to save element to storage, if it doesn't exist. Otherwise, update the element in storage
const saveElementToStorage = async (data, originalContent) => {
	const { url, xpath } = data;
	const element = await findElementInStorage(url, xpath);
	if (element) {
		// Update the element in storage
		chrome.storage.local.get(["fakeItData"], (result) => {
			let fakeItData = result.fakeItData || [];
			for (let i = 0; i < fakeItData.length; i++) {
				if (fakeItData[i].url === url && fakeItData[i].xpath === xpath) {
					fakeItData[i] = data;
				}
			}
			chrome.storage.local.set({ fakeItData }, () => {
				console.log("Data updated");
			});
		});
	} else {
		// push New Element to storage
		chrome.storage.local.get(["fakeItData"], (result) => {
			let fakeItData = result.fakeItData || [];
			data.originalContent = originalContent;
			fakeItData.push(data);
			chrome.storage.local.set({ fakeItData }, () => {
				console.log("Data saved");
			});
		});
	}
};

// function to clear storage
const clearStorage = () => {
	chrome.storage.local.clear(() => {
		console.log("Storage cleared");
	});
};
// clearStorage()

// get the initial state from storage
chrome.storage.sync.get(["textEditingEnabled", "imageEditingEnabled", "showEditsEnabled"], (result) => {
	textEditingEnabled = result.textEditingEnabled;
	imageEditingEnabled = result.imageEditingEnabled;
	showEditsEnabled = result.showEditsEnabled;
});

// listen for messages
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
	if (request.textEditingEnabled !== undefined) {
		textEditingEnabled = request.textEditingEnabled;
	}
	if (request.imageEditingEnabled !== undefined) {
		imageEditingEnabled = request.imageEditingEnabled;
	}
	if (request.showEditsEnabled !== undefined) {
		showEditsEnabled = request.showEditsEnabled;
	}
	if (request.command === "clearStorage") {
		clearStorage();
		sendResponse({ message: "Storage cleared" });
	}
	if (request.command === "createOverlay") {
		createOverlay();
		sendResponse({ message: "Overlay created" });
	}
});

if (!showEditsEnabled) applyChangesFromStorage();
// use observer to apply changes from storage after waiting 500ms, but reset the timer on every mutation
let timer;
let runOnce = false;
const observer = new MutationObserver((mutations) => {
	if (!showEditsEnabled) return;
	if (runOnce) return;
	clearTimeout(timer);
	timer = setTimeout(() => {
		console.log("run now");
		applyChangesFromStorage();
		runOnce = true;
	}, 800);
});
observer.observe(document.body, {
	childList: true,
	subtree: true,
});

// OLD
// using iframe
// const editText = (event) => {
//   if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') return

//   const originalElement = event.target
//   const originalDisplayStyle = window.getComputedStyle(originalElement, '').display

//   const iframe = document.createElement('iframe')
//   iframe.style.width = '100%'
//   iframe.style.height = originalElement.offsetHeight + 'px'
//   iframe.style.border = '1px solid #ccc'
//   iframe.srcdoc =
//     '<!DOCTYPE html><html><head><style>body { white-space: pre-wrap; }</style></head><body></body></html>'

//   const saveBtn = document.createElement('button')
//   saveBtn.textContent = 'Save'
//   saveBtn.style.display = 'inline-block'
//   saveBtn.style.marginTop = '5px'
//   saveBtn.style.marginLeft = '10px'
//   saveBtn.onclick = () => {
//     const newText = iframe.contentWindow.document.body.textContent
//     originalElement.textContent = newText
//     originalElement.style.display = originalDisplayStyle
//     iframe.remove()
//     saveBtn.remove()
//     resetBtn.remove()
//     cancelBtn.remove()
//   }

//   const resetBtn = document.createElement('button')
//   resetBtn.textContent = 'Reset'
//   resetBtn.style.display = 'inline-block'
//   resetBtn.style.marginTop = '5px'
//   resetBtn.style.marginLeft = '5px'
//   resetBtn.onclick = () => {
//     iframe.contentWindow.document.body.textContent = originalElement.textContent
//   }

//   const cancelBtn = document.createElement('button')
//   cancelBtn.textContent = 'Cancel'
//   cancelBtn.style.display = 'inline-block'
//   cancelBtn.style.marginTop = '5px'
//   cancelBtn.style.marginLeft = '5px'
//   cancelBtn.onclick = () => {
//     originalElement.style.display = originalDisplayStyle
//     iframe.remove()
//     saveBtn.remove()
//     resetBtn.remove()
//     cancelBtn.remove()
//   }

//   originalElement.parentElement.insertBefore(iframe, originalElement)
//   originalElement.style.display = 'none'
//   iframe.parentElement.insertBefore(saveBtn, iframe.nextSibling)
//   iframe.parentElement.insertBefore(resetBtn, saveBtn.nextSibling)
//   iframe.parentElement.insertBefore(cancelBtn, resetBtn.nextSibling)

//   iframe.onload = () => {
//     console.log('iframe loaded')
//     iframe.contentWindow.document.designMode = 'on'
//     const style = iframe.contentWindow.document.createElement('style')
//     style.innerHTML = 'body { white-space: pre-wrap; }'
//     iframe.contentWindow.document.head.appendChild(style)
//     iframe.contentWindow.document.body.textContent = originalElement.textContent
//     // Copy computed styles from originalElement to iframe body
//     const computedStyles = window.getComputedStyle(originalElement)
//     for (let i = 0; i < computedStyles.length; i++) {
//       const property = computedStyles[i]
//       console.log(property, computedStyles.getPropertyValue(property))
//     //   iframe.contentWindow.document.body.style.setProperty(
//     //     property,
//     //     computedStyles.getPropertyValue(property),
//     //     computedStyles.getPropertyPriority(property),
//     //   )
//     }
//   }
// }
