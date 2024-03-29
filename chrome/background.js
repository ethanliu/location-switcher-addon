"use strict";

var currentTabURL = "";
var userDefinedLocations = [];
var sourceLocation = "";
var destinationLocations = [];
var locationIcons = {};
var darkThemeEnabled = false;
var sortEnabled = false;
var forcePopupEnabled = false;

function getNextLocation() {
	chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
		var tabId = tabs[0].id;

		currentTabURL = tabs[0].url;
		sourceLocation = "";
		destinationLocations = [];

		// chrome.pageAction.hide(tabId);
		chrome.browserAction.setPopup({popup: ""});

		var icon = "";
		for (var source in locationIcons) {
			if (currentTabURL.startsWith(source)) {
				icon = locationIcons[source];
				break;
			}
		}

		if (icon == "") {
			icon = darkThemeEnabled ? "icons/dark/default.png" : "icons/light/default.png";
		}
		else {
			icon = darkThemeEnabled ? icon.replace("icons/light/", "icons/dark/") : icon;
		}

		chrome.browserAction.setIcon({
			tabId: tabId,
			path: icon
		});

		for (var source in userDefinedLocations) {
			if (currentTabURL.startsWith(source)) {
				// chrome.browserAction.show(tabId);
				chrome.browserAction.setPopup({popup: ""});
				sourceLocation = source;
				destinationLocations = userDefinedLocations[source];

				if (destinationLocations.length > 1 || forcePopupEnabled) {
					if (sortEnabled) {
						destinationLocations.sort();
					}
					chrome.browserAction.setPopup({tabId, popup: "popup/popup.html"});
					chrome.browserAction.setTitle({
						tabId: tabId,
						title: destinationLocations.length + " locations"
					});
				}
				else {
					destinationLocations = [currentTabURL.replace(sourceLocation, destinationLocations[0]).replace(/(https?:\/\/)|(\/)+/g, "$1$2")];
					chrome.browserAction.setPopup({tabId, popup: ""});
					// chrome.browserAction.hide(tabId);
					chrome.browserAction.setTitle({
						tabId: tabId,
						title: destinationLocations[0]
					});
				}
				chrome.browserAction.enable();
				return;
			}
		}

		chrome.browserAction.disable();
	});
}

function getUserPreference() {
	chrome.storage.sync.get(null, function(res) {
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
				let icon = res.data[i][3] || "icons/light/default.png";

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

			// chrome.extension.getBackgroundPage().console.log(locationIcons);
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

// Not all navigating tabs correspond to actual tabs in Chrome's UI, e.g., a tab that is being pre-rendered. Such tabs are not accessible via the tabs API nor can you request information about them via webNavigation.getFrame or webNavigation.getAllFrames. Once such a tab is swapped in, an onTabReplaced event is fired and they become accessible via these APIs.

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
	// console.log(`updated: ${tabId}`);
	// console.log(changeInfo);
	// console.log(tab);
	// chrome.browserAction.setPopup(tabId, {popup: ""});
	// browser.pageAction.hide(tabId);
	// console.log(changeInfo.status);
	// console.log(changeInfo.url);
	if (changeInfo.status && changeInfo.url) {
		getNextLocation();
	}
});

chrome.tabs.onActivated.addListener(function(tab) {
	// console.log("onActivated");
	getNextLocation();
});

chrome.browserAction.onClicked.addListener((tab, data) => {
	console.log('pageAction.onClicked');
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
		chrome.tabs.update({url: destinationLocations[0]});
	}
	else {
		chrome.tabs.query({currentWindow: true}, function(tabs) {
			let id = false;
			for (index in tabs) {
				if (tabs[index].url == destinationLocations[0]) {
					id = tabs[index].id
					break;
				}
			}
			if (!id) {
				chrome.tabs.create({
					active: true,
					url: destinationLocations[0]
				});
			}
			else {
				chrome.tabs.update(id, {
					active: true,
					// url: tab.url
				}, function() {
					chrome.tabs.reload(id, {
						bypassCache: true,
					});
				});
			}
		});
	}

});

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
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
