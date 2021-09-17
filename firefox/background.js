"use strict";

var currentTabURL = "";
var userDefinedLocations = [];
var sourceLocation = "";
var destinationLocations = [];
var locationIcons = {};
var darkThemeEnabled = false;
var sortEnabled = false;
var forcePopupEnabled = false;

const darkFillColor = "#b1b1b1";

function getNextLocation() {

	browser.tabs.query({active: true, currentWindow: true}).then((tabs) => {
		// const tab = tabs[0];
		const tabId = tabs[0].id;

		currentTabURL = tabs[0].url;
		sourceLocation = "";
		destinationLocations = [];
		browser.pageAction.hide(tabId);

		var icon = "icons/default.svg";
		var source = "";

		for (source in locationIcons) {
			if (currentTabURL.startsWith(source)) {
				icon = locationIcons[source];
				break;
			}
		}

		// legacy
		icon = icon.replace('icons/light/', 'icons/');
		icon = icon.replace('icons/dark/', 'icons/');

		for (source in userDefinedLocations) {
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
		// console.log("fallback");
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

			var svg = !darkMode ? request.response : request.response.replace(/#666666/g, darkFillColor);
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
				let disabled = res.data[i][4] ? true : false;
				if (disabled) {
					continue;
				}

				let source = res.data[i][0];
				let target = res.data[i][1];
				let loop = res.data[i][2] ? true : false;
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

		darkThemeEnabled = res.darkThemeEnabled ? true : false;
		sortEnabled = res.sortEnabled ? true : false;
		forcePopupEnabled = res.forcePopupEnabled ? true : false;
	});
}

// preferences

getUserPreference();

browser.tabs.onUpdated.addListener((tabId, changeInfo) => {
	// console.log("onUpdated");
	// browser.pageAction.hide(tabId);
	// console.log(tabId);
	// console.log(changeInfo);
	if (changeInfo.status && changeInfo.url) {
		getNextLocation();
	}
});

browser.tabs.onActivated.addListener(() => {
	getNextLocation();
});

// This event will not fire if the page action has a popup.
browser.pageAction.onClicked.addListener((tab, data) => {
	// console.log('pageAction.onClicked');
	// console.log(tab);
	// console.log(data);
	let openInNewTab = false;
	if (data.button == 1 && data.modifiers.length == 0) {
		// middle-click for all platform
		openInNewTab = true;
	}
	else if (data.button == 0 && data.modifiers.length == 1 && (data.modifiers.includes("Command") || data.modifiers.includes("Ctrl") || data.modifiers.includes("MacCtrl"))) {
		openInNewTab = true;
	}

	if (!openInNewTab) {
		browser.tabs.update({url: destinationLocations[0]});
	}
	else {
		browser.tabs.query({currentWindow: true}).then((tabs) => {
			let id = false;
			for (var index in tabs) {
				if (tabs[index].url == destinationLocations[0]) {
					id = tabs[index].id
					break;
				}
			}
			if (!id) {
				browser.tabs.create({
					active: true,
					url: destinationLocations[0]
				});
			}
			else {
				browser.tabs.update(id, {
					active: true,
					// url: tab.url
				}).then(() => {
					browser.tabs.reload(id, {
						bypassCache: true,
					});
				});
			}
		});
	}

});

browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
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

