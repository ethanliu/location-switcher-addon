"use strict";


var currentTabURL = "";
var userDefinedLocations = [];
var sourceLocation = "", destinationLocations = [], locationIcons = {};
var darkThemeEnabled = false, sortEnabled = false, forcePopupEnabled = false;

const darkFillColor = "#000055";

function getNextLocation() {

	browser.tabs.query({active: true, currentWindow: true}).then((tabs) => {
		// const tab = tabs[0];
		const tabId = tabs[0].id;

		currentTabURL = tabs[0].url;
		sourceLocation = "";
		destinationLocations = [];
		browser.pageAction.hide(tabId);

		var icon = "icons/default.svg";
		for (var source in locationIcons) {
			if (currentTabURL.startsWith(source)) {
				icon = locationIcons[source];
				break;
			}
		}

		// legacy
		icon = icon.replace('icons/light/', 'icons/');
		icon = icon.replace('icons/dark/', 'icons/');

		for (var source in userDefinedLocations) {
			if (currentTabURL.startsWith(source)) {
				browser.pageAction.show(tabId);
				sourceLocation = source;
				destinationLocations = userDefinedLocations[source];

				updateIcon(tabId, icon, darkThemeEnabled);

				if (destinationLocations.length > 1 || forcePopupEnabled) {
					if (sortEnabled) {
						destinationLocations.sort();
					}
					browser.pageAction.setPopup({tabId, popup: "popup/popup.html"});
					browser.pageAction.setTitle({
						tabId: tabId,
						title: destinationLocations.length + " locations"
					});
				}
				else {
					destinationLocations = [currentTabURL.replace(sourceLocation, destinationLocations[0]).replace(/(https?:\/\/)|(\/)+/g, "$1$2")];
					browser.pageAction.setPopup({tabId, popup: ""});
					// browser.pageAction.hide(tabId);
					browser.pageAction.setTitle({
						tabId: tabId,
						title: destinationLocations[0]
					});
				}
				return;
			}
		}

		// default icon fallback
		console.log("fallback");
		updateIcon(-1, icon, darkThemeEnabled);
		// browser.pageAction.setIcon({
		// 	tabId: tabId,
		// 	path: icon
		// });

	});
}

// async function getTheme() {
// 	const theme = await browser.theme.getCurrent();
// 	console.log(theme);
// 	if (theme.colors) {
// 		console.log(theme.colors);
// 		console.log(theme.colors.accentcolor);
// 		console.log(theme.colors.toolbar);
// 	}
// }


function b64EncodeUnicode(str) {
	// first we use encodeURIComponent to get percent-encoded UTF-8,
	// then we convert the percent encodings into raw bytes which
	// can be fed into btoa.
	return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g,
		function toSolidBytes(match, p1) {
			return String.fromCharCode('0x' + p1);
	}));
}

function updateIcon(tabId, iconPath, darkMode) {
	if (tabId == -1) {
		console.log('hide');
		return
	}

	const request = new XMLHttpRequest();
	request.onload = () => {
		if (request.responseType === "blob") {
			const reader = new FileReader();
			reader.onload = () => {
				// console.log("reader:");
				// console.log(reader.result);
			};
			reader.readAsDataURL(request.response);
		}
		else {
			// console.log("request:");

			// var svg = request.response;
			// if (darkThemeEnabled) {
			// 	const re = new RegExp(fillColor, 'gi');
			// 	svg = svg.replace(re, darkFillColor);
			// }

			var svg = !darkThemeEnabled ? request.response : request.response.replace(/#666666/g, darkFillColor);
			svg = "data:image/svg+xml;base64," + b64EncodeUnicode(svg);

			// pageAction icon

			const canvas = document.createElement('canvas');
			const ctx = canvas.getContext("2d");
			const img = new Image();
			img.onload = () => {
				ctx.drawImage(img, 0, 0, 19, 19);
				browser.pageAction.setIcon({
					tabId: tabId,
					imageData: ctx.getImageData(0, 0, 19, 19)
				});
			}
			img.src = svg;

			// tab icon
			// Note: browser.tabs.executeScript requre '<all_urls>' permission, seems "activeTab" is not enough?
			// fixme: mulltiple injection issue

			browser.tabs.sendMessage(tabId, {}).then(() => {
				// do nothing
			}, (error) => {
				// inject once per-tab
				browser.tabs.executeScript(tabId, {file: "/favicon.js"}).then(() => {
					browser.tabs.sendMessage(tabId, {dataURI: svg});
				});
			});

		}
	};
	request.open("GET", iconPath, true);
	// request.responseType = "blob";
	request.send();
}


function getUserPreference() {

	browser.storage.sync.get(null).then((res) => {
		if (res.data) {
			let total = res.data.length || 0;
			for (var i = 0; i < total; i++) {
				let disabled = res.data[i][4] || false;
				if (disabled) {
					continue;
				}

				let source = res.data[i][0];
				let target = res.data[i][1];
				let loop = res.data[i][2] || true;
				let icon = res.data[i][3] || "icons/default.svg";

				if (userDefinedLocations[source] === undefined) {
					userDefinedLocations[source] = [];
				}
				userDefinedLocations[source].push(target);

				if (loop) {
					if (userDefinedLocations[target] === undefined) {
						userDefinedLocations[target] = [];
					}
					userDefinedLocations[target].push(source);

					if (locationIcons[target] === undefined) {
						locationIcons[target] = icon;
					}
				}

				if (locationIcons[source] === undefined) {
					locationIcons[source] = icon;
				}
			}
			// console.log(userDefinedLocations);
			// console.log("ready");
		}

		darkThemeEnabled = res.darkThemeEnabled || false;
		sortEnabled = res.sortEnabled || false;
		forcePopupEnabled = res.forcePopupEnabled || false;
	});
}

// preferences

getUserPreference();

browser.tabs.onUpdated.addListener((tabId, changeInfo, tabInfo) => {
	// console.log("onUpdated");
	// browser.pageAction.hide(tabId);
	// console.log(changeInfo.status);
	// console.log(changeInfo.url);
	if (changeInfo.status && changeInfo.url) {
		getNextLocation();
	}
});

browser.tabs.onActivated.addListener(() => {
	getNextLocation();
});

browser.pageAction.onClicked.addListener(() => {
	browser.tabs.update({url: destinationLocations[0]});
});

browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
	console.log('xxx');
	if (request.action && request.action == "getTabLocations") {
		sendResponse({
			url: currentTabURL,
			source: sourceLocation,
			destinations: destinationLocations,
			icons: locationIcons,
			dark: darkThemeEnabled
		});
	}
});
