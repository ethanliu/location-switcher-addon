function handleResponse(response) {
	document.body.innerHTML = "";
	let url = response.url;
	let source = response.source;
	let desitinations = response.destinations;

	var ul = document.createElement("ul");

	for (var i = 0, loop = desitinations.length; i < loop; i++) {
		var li = document.createElement("li");

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
			// href.prepend(img);
			li.appendChild(img)
		}

		li.appendChild(href)
		ul.appendChild(li)

		// document.body.appendChild(href);
	}

	document.body.appendChild(ul);
}

function handleError(error) {
	alert(error);
}

browser.runtime.sendMessage({
	"action": "getTabLocations"
}).then(handleResponse, handleError);

document.addEventListener("click", (e) => {
	let cmd = e.getModifierState("Meta");
	if (cmd) {
		browser.tabs.create({
			url: e.target.href,
			active: true
		}).then({}, handleError);
	}
	else {
		browser.tabs.update({url: e.target.href}).then({
			//hide
		}, handleError);
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

