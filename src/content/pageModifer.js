class PageModifier {
	constructor(textEditingEnabled, imageEditingEnabled, showEditsEnabled) {
		this.textEditingEnabled = textEditingEnabled || false;
		this.imageEditingEnabled = imageEditingEnabled || false;
		this.showEditsEnabled = showEditsEnabled || false;

		this.originalElement = null;
		this.newElement = null;
		this.elementType = null;

		document.body.addEventListener("dblclick", this.doubleClickHandler.bind(this));
	}

	doubleClickHandler = (event) => {
		// disqualifiers
		if (event.target.tagName === "INPUT" || event.target.tagName === "TEXTAREA") return;

		// send event to the right handler
		if (event.target.classList.contains("SS-overlay")) {
			this.editOverlayHandler(event);
		} else if (event.target.tagName === "IMG") {
			this.editImageHandler(event);
		} else if (event.target.textContent.trim() !== "") {
			this.editTextHandler(event);
		}
	};

	editTextHandler = (event) => {
		if (!this.textEditingEnabled) return;

		const originalDisplayStyle = window.getComputedStyle(this.originalElement, "").display;

		this.originalElement = event.target;
		this.elementType = "text";
		this.newElement = this.duplicateElement();

		// Add newElement to DOM
		this.originalElement.parentElement.insertBefore(this.newElement, this.originalElement);
		this.originalElement.style.display = "none";

		// Create Text Editing Buttons
		const saveBtn = createButton("Save", ["SSbtn-primary", "SSbtn-xs"], () => {
			const newText = newElement.textContent;
			const originalContent = originalElement.textContent;
			originalElement.textContent = newText;
			getOutOfEditMode();

			const xpath = getXPathForElement(originalElement);
			const data = {
				newContent: newText,
				url: window.location.href,
				xpath,
				type: "text",
			};
			saveElementToStorage(data, originalContent);
		});

		const resetBtn = createButton("Reset", ["SSbtn-primary", "SSbtn-xs"], async () => {
			const xpath = getXPathForElement(originalElement);
			const url = window.location.href;
			const element = await findElementInStorage(url, xpath);
			if (element) {
				newElement.textContent = element.originalContent;
			} else {
				newElement.textContent = originalElement.textContent;
			}
		});

		const cancelBtn = createButton("Cancel", ["SSbtn-primary", "SSbtn-xs"], () => {
			getOutOfEditMode();
		});
		// put buttons into container and insert
		const buttonContainer = createButtonContainer(this.newElement, [saveBtn, resetBtn, cancelBtn]);
		this.newElement.parentElement.insertBefore(buttonContainer, this.newElement.nextSibling);

		const getOutOfEditMode = () => {
			this.newElement.remove();
			buttonContainer.remove();
			this.originalElement.style.display = originalDisplayStyle;
		};
		// focus on new
		this.newElement.focus();
	};

	editImageHandler = (event) => {};

	editOverlayHandler = (event) => {};

	createOverlayHandler = () => {};

	// HELPER FUNCTIONS
	duplicateElement = () => {
		const newElement = document.createElement(this.originalElement.tagName);

		// Type specific changes
		if (elementType === "text") {
			newElement.setAttribute("contenteditable", "true");
			newElement.textContent = this.originalElement.textContent;
			newElement.classList.add("SS-textEdit");
		} else if (elementType === "image") {
			newElement.src = this.originalElement.src;
		}

		// Add Classes
		newElement.classList.add("SS-newElement");
		for (let i = 0; i < this.originalElement.classList.length; i++) {
			newElement.classList.add(this.originalElement.classList[i]);
		}
		// Add CSS
		const computedStyles = window.getComputedStyle(this.originalElement);
		for (let i = 0; i < computedStyles.length; i++) {
			const property = computedStyles[i];
			newElement.style.setProperty(property, computedStyles.getPropertyValue(property), computedStyles.getPropertyPriority(property));
		}
		// Display element properly
		newElement.style.display = window.getComputedStyle(this.originalElement, "").display;
		// Prevent behavior from website
		newElement.addEventListener("click", (event) => {
			event.preventDefault();
			event.stopPropagation();
			event.stopImmediatePropagation();
		});

		// Return new element
		return newElement;
	};

	createButton = (text, classes, onClick) => {
		const btn = document.createElement("div");
		btn.classList.add("SSbtn", ...classes);
		btn.textContent = text;
		btn.onclick = onClick;
		return btn;
	};

	createButtonContainer = (element, buttons) => {
		const rect = element.getBoundingClientRect();
		const left = rect.left + window.pageXOffset;
		const bottom = rect.bottom + window.pageYOffset;

		const buttonContainer = document.createElement("div");
		buttonContainer.classList.add("SS-btnContainer");
		buttonContainer.style.left = left + "px";
		buttonContainer.style.top = bottom + "px";

		buttons.forEach((button) => {
			buttonContainer.appendChild(button);
		});

		return buttonContainer;
	};

	updateButtonContainerPosition = (buttonContainer, element) => {
		const rect = element.getBoundingClientRect();
		const left = rect.left + window.pageXOffset;
		const bottom = rect.bottom + window.pageYOffset;
		buttonContainer.style.left = left + "px";
		buttonContainer.style.top = bottom + "px";
	};

	createCornerCircles = (element) => {
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

	updateCornerCircles = (cornerCircles, element) => {
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

	createResizeHandler = (element, selectedCircle, cornerCircles, buttonContainer) => {
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
}
