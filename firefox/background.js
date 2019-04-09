var userDefinedLocations = [];
var sourceLocation = "", destinationLocations = [], locationIcons = [];
var currentTabURL = "";
var darkThemeEnabled = false, sortEnabled = false;

function getNextLocation() {
	browser.tabs.query({active: true, currentWindow: true}).then((tabs) => {
		var tabId = tabs[0].id;
		currentTabURL = tabs[0].url;
		sourceLocation = "";
		destinationLocations = [];
		browser.pageAction.hide(tabId);

		var icon = "";
		for (var source in locationIcons) {
			if (currentTabURL.startsWith(source)) {
				icon = locationIcons[source];
				break;
			}
		}

		if (icon == "") {
			icon = darkThemeEnabled ? "icons/dark/default.svg" : "icons/light/default.svg";
		}
		else {
			icon = darkThemeEnabled ? icon.replace("icons/light/", "icons/dark/") : icon;
		}

		browser.pageAction.setIcon({
			tabId: tabId,
			path: icon
		});

		for (var source in userDefinedLocations) {
			if (currentTabURL.startsWith(source)) {
				browser.pageAction.show(tabId);
				sourceLocation = source;
				destinationLocations = userDefinedLocations[source];

				if (destinationLocations.length > 1) {
					if (sortEnabled) {
						destinationLocations.sort();
					}
					browser.pageAction.setPopup({tabId, popup: "popup/popup.html"});
				}
				else {
					destinationLocations = [currentTabURL.replace(sourceLocation, destinationLocations[0]).replace(/(https?:\/\/)|(\/)+/g, "$1$2")];
					browser.pageAction.setPopup({tabId, popup: ""});
					// browser.pageAction.hide(tabId);
				}
				return;
			}
		}
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

function getUserPreference() {

	// getTheme();

	browser.storage.sync.get(null).then((res) => {
		if (res.data && res.data.length > 0) {
			for (var i = 0; i < res.data.length; i++) {
				let source = res.data[i][0];
				let target = res.data[i][1];
				let loop = res.data[i][2];
				let icon = res.data[i][3] || "icons/light/default.svg";

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
	// console.log("onActivated");
	getNextLocation();
});

browser.pageAction.onClicked.addListener(() => {
	browser.tabs.update({url: destinationLocations[0]});
});

browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
	if (request.action && request.action == "getTabLocations") {
		sendResponse({url: currentTabURL, source: sourceLocation, destinations: destinationLocations, icons: locationIcons});
	}
});
