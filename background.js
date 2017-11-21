var locations = [];
var locationLink = '';
var item = browser.storage.sync.get("data");

item.then((res) => {
	if (res.data && res.data.length > 0) {
		for (var i = 0; i < res.data.length; i++) {
			var source = res.data[i][0];
			var target = res.data[i][1];
			var loop = res.data[i][2];

			locations[source] = target;
			if (loop) {
				locations[target] = source;
			}
		}
	}
});

browser.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
	if (!changeInfo.url) {
		return;
	}
	getNextLocation();
});

browser.tabs.onActivated.addListener((activeInfo) => {
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
				browser.pageAction.show(id);
				return
			}
		}
	})
}

