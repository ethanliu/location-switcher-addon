function handleResponse(response) {
	document.body.innerHTML = "";
	let url = response.url;
	let source = response.source;
	let desitinations = response.destinations;

	for (var i = 0, loop = desitinations.length; i < loop; i++) {
		var href = document.createElement("a");
		href.setAttribute("href", url.replace(source, desitinations[i]).replace(/(https?:\/\/)|(\/)+/g, "$1$2"));
		href.appendChild(document.createTextNode(desitinations[i]));

		var icon = response.icons[desitinations[i]];
		if (icon !== undefined) {
			var img = document.createElement("img");
			if (icon.startsWith("http")) {
				img.src = icon;
			}
			else {
				img.src = "../" + icon;
			}
			href.prepend(img);
		}

		document.body.appendChild(href);
	}
}

function handleError(error) {
	alert(error);
}

if (window.browser) {
	browser.runtime.sendMessage({
		"action": "getTabLocations"
	}).then(handleResponse, handleError);
}
else {
	chrome.runtime.sendMessage({"action": "getTabLocations"}, function(response) {
		handleResponse(response);
	});
}


document.addEventListener("click", (e) => {
	if (window.browser) {
		browser.tabs.update({url: e.target.href}).then({
			//hide
		}, handleError);
	}
	else {
		chrome.tabs.update({url: e.target.href}, function() {
			// fired bug: chrome.pageAction.hide()
			// chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
			// 	var tabId = tabs[0].id;
			// 	chrome.pageAction.hide(tabId);
			// });
		});
	}
	// if (e.target.href.startsWith("file://")) {
	// 	console.log(e.target.href);
	// 	var result = browser.tabs.executeScript({
	// 		code: `console.log('${e.target.href}');location.href = '${e.target.href}'; console.log('done');`
	// 	});
	// 	result.then({}, handleError);
	// }
	// else {
		// var result = browser.tabs.update({url: e.target.href});
		// result.then({}, handleError);
	// }
	e.preventDefault();
});

