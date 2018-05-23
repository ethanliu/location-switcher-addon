var userDefinedLocations = [];
var sourceLocation = "", destinationLocations = [];
var currentTabURL = "";
var darkThemeEnabled = false, sortEnabled = false;

function getNextLocation() {
	browser.tabs.query({active: true, currentWindow: true}).then((tabs) => {
		var tabId = tabs[0].id;
		currentTabURL = tabs[0].url;
		sourceLocation = "";
		destinationLocations = [];
		browser.pageAction.hide(tabId);

		if (darkThemeEnabled) {
			browser.pageAction.setIcon({
				tabId: tabId,
				path: "icons/dark.svg"
			});
		}

		for (var source in userDefinedLocations) {
			if (currentTabURL.startsWith(source)) {
				browser.pageAction.show(tabId);
				sourceLocation = source;
				destinationLocations = userDefinedLocations[source];

				if (destinationLocations.length > 1) {
					if (sortEnabled) {
						destinationLocations.sort();
					}
					browser.pageAction.setPopup({tabId, popup: null});
				}
				else {
					destinationLocations = [currentTabURL.replace(sourceLocation, destinationLocations[0]).replace(/(https?:\/\/)|(\/)+/g, "$1$2")];
					browser.pageAction.setPopup({tabId, popup: ""});
				}
				return;
			}
		}
	});
}

// preferences

browser.storage.sync.get("darkThemeEnabled").then((res) => {
	darkThemeEnabled = res.darkThemeEnabled;
});

browser.storage.sync.get("sortEnabled").then((res) => {
	sortEnabled = res.sortEnabled;
});

browser.storage.sync.get("data").then((res) => {
	if (res.data && res.data.length > 0) {
		for (var i = 0; i < res.data.length; i++) {
			var source = res.data[i][0];
			var target = res.data[i][1];
			var loop = res.data[i][2];

			if (userDefinedLocations[source] === undefined) {
				userDefinedLocations[source] = [];
			}
			userDefinedLocations[source].push(target);

			if (loop) {
				if (userDefinedLocations[target] === undefined) {
					userDefinedLocations[target] = [];
				}
				userDefinedLocations[target].push(source);
			}
		}
		// console.log(userDefinedLocations);
		// console.log("ready");
	}
});

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
		sendResponse({url: currentTabURL, source: sourceLocation, destinations: destinationLocations});
	}
});
