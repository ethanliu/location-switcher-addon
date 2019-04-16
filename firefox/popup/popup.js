function handleResponse(response) {
	document.body.innerHTML = "";
	document.body.className = response.dark ? "dark" : "";
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


var isMacOS = (navigator.platform.toLowerCase().startsWith("mac")) ? true : false;
console.log(navigator.platform);
console.log(isMacOS);

browser.runtime.sendMessage({
	"action": "getTabLocations"
}).then(handleResponse, handleError);


// confuse behavior with click

document.addEventListener('contextmenu', function(e) {
	e.preventDefault();
	return false;
});

document.addEventListener("click", function(e) {
	e.preventDefault();
	let newTab = (isMacOS) ? e.getModifierState("Meta") : e.getModifierState("Control");

	if (newTab) {
		browser.tabs.query({currentWindow: true}).then((tabs) => {
			var id = false;
			for (index in tabs) {
				if (tabs[index].url == e.target.href) {
					id = tabs[index].id
					break;
				}
			}
			if (!id) {
				browser.tabs.create({
					url: e.target.href,
					active: true
				}).then({}, handleError);
			}
			else {
				browser.tabs.update(id, {
					active: true,
					url: e.target.href
				}).then({
					//hide
				}, handleError);
			}
		});
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
	// e.preventDefault();
});

