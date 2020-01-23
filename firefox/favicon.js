"use strict";

function updateFavIcon(dataURI) {
	clearFavIcon();

	const link = document.createElement('link');
	link.type = 'image/x-icon';
	link.rel = 'shortcut icon';
	link.id = 'location-switcher-addon-icon';
	link.href = dataURI;

	document.getElementsByTagName('head')[0].appendChild(link);
}

function clearFavIcon() {
	const head = document.getElementsByTagName('head')[0];
	const links = document.querySelectorAll("link[rel*='icon']");
	for (const link of links) {
		head.removeChild(link);
	}
}

browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
	updateFavIcon(request.dataURI);
	// if (sender.url.startsWith(browser.extension.getURL(""))) {
	// 	const a = document.getElementById('location-switcher-addon-icon');
	// 	if (a === null || a === undefined) {
	// 	}
	// }
});

