const sendToContentScript = (messageObject) => {
	return new Promise((resolve, reject) => {
		chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
			chrome.tabs.sendMessage(tabs[0].id, messageObject, (response) => {
				if (response) {
					resolve(response);
				} else {
					reject("error");
				}
			});
		});
	});
};

const saveToStorage = (stateObject) => {
	return new Promise((resolve, reject) => {
		chrome.storage.sync.set(stateObject, () => {
			resolve();
		});
	});
};

const sendToBackgroundScript = (stateObject) => {
	return new Promise((resolve, reject) => {
		chrome.runtime.sendMessage(stateObject, () => {
			resolve();
		});
	});
};

export { sendToContentScript, saveToStorage, sendToBackgroundScript };
