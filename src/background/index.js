// Store the initial state during installation
chrome.runtime.onInstalled.addListener(() => {
	chrome.storage.sync.set({
		textEditingEnabled: true,
		imageEditingEnabled: true,
		showEditsEnabled: true,
	});
});

// Listen for messages from popup and send to all content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
	const stateKeys = ["textEditingEnabled", "imageEditingEnabled", "showEditsEnabled"];
	stateKeys.forEach((key) => {
		if (request[key] !== undefined) {
			chrome.storage.sync.set({ [key]: request[key] });
			chrome.tabs.query({}, (tabs) => {
				tabs.forEach((tab) => chrome.tabs.sendMessage(tab.id, request));
			});
		}
	});
});
