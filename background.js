var locations = [];
var locationLink = '';

var item = browser.storage.sync.get("data");
item.then((res) => {
	if (res.data && res.data["locations"] && res.data["locations"].length > 0) {
		for (var i = 0; i < res.data["locations"].length; i++) {
			var source = res.data["locations"][i][0];
			var target = res.data["locations"][i][1];
			var loop = res.data["locations"][i][2];

			// console.log(`${i} = ${source} / ${target} / ${loop}`);
			locations[source] = target;
			if (loop) {
				locations[target] = source;
			}
		}
		// console.log(locations);
	}
});


browser.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
	if (!changeInfo.url) {
		return;
	}

	// console.log(tabId);
	// console.log(changeInfo.url);
	getNextLocation();
});

browser.tabs.onActivated.addListener((activeInfo) => {
	// console.log(activeInfo.tabId);
	getNextLocation();
});

browser.pageAction.onClicked.addListener(() => {
	if (locationLink == '') {
		return;
	}

	browser.tabs.update({url: locationLink});
});

function getNextLocation() {
	var activeTab = browser.tabs.query({active: true, currentWindow: true});
	activeTab.then((tabs) => {
		var id = tabs[0].id;
		var url = tabs[0].url;
		var source = "";
		var target = "";

		browser.pageAction.hide(id);

		for (var key in locations) {
			source = key;
			target = locations[key];

			if (url.startsWith(source)) {
				locationLink = url.replace(source, target);
				// console.log(`matched: ${url} => ${locationLink}`);
				browser.pageAction.show(id);
				return
			}
		}
	})
}

