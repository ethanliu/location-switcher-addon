"use strict";

(function(w, d, b) {
	const isMacOS = (w.navigator.platform.toLowerCase().startsWith("mac")) ? true : false;

	function handleResponse(response) {
		d.body.innerHTML = "";
		d.body.className = response.dark ? "dark" : "";

		let url = response.url;
		let source = response.source;
		let desitinations = response.destinations;

		var ul = d.createElement("ul");

		for (var i = 0, loop = desitinations.length; i < loop; i++) {
			var li = d.createElement("li");

			var href = d.createElement("a");
			href.setAttribute("href", url.replace(source, desitinations[i]).replace(/(https?:\/\/)|(\/)+/g, "$1$2"));
			href.appendChild(d.createTextNode(desitinations[i]));

			var icon = response.icons[desitinations[i]];
			if (icon !== undefined) {
				var img = d.createElement("img");
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

			// d.body.appendChild(href);
		}

		d.body.appendChild(ul);
	}

	function handleError(error) {
		alert(error);
	}

	function openURL(url, newTab) {
		// console.log(`newTab: ${newTab}, ${url}`);

		if (newTab) {
			b.tabs.query({currentWindow: true}).then((tabs) => {
				var id = false;
				for (var index in tabs) {
					if (tabs[index].url == url) {
						id = tabs[index].id
						break;
					}
				}
				if (!id) {
					b.tabs.create({
						active: true,
						url: url
					}).then({}, handleError);
				}
				else {
					b.tabs.update(id, {
						active: true,
						url: url
					}).then({
						//hide
					}, handleError);
				}
			});
		}
		else {
			b.tabs.update({url: url}).then({
				//hide
			}, handleError);
		}

		// if (e.target.href.startsWith("file://")) {
		// 	console.log(e.target.href);
		// 	var result = b.tabs.executeScript({
		// 		code: `console.log('${e.target.href}');location.href = '${e.target.href}'; console.log('done');`
		// 	});
		// 	result.then({}, handleError);
		// }
		// else {
			// var result = b.tabs.update({url: e.target.href});
			// result.then({}, handleError);
		// }
		// e.preventDefault();

	}


	// console.log(navigator.platform);
	// console.log(isMacOS);

	b.runtime.sendMessage({
		"action": "getTabLocations"
	}).then(handleResponse, handleError);


	// disable contextmenu
	// Firefox trigger click and show context menu at the same time

	d.addEventListener('contextmenu', function(e) {
		e.preventDefault();
		return false;
	});

	d.addEventListener("mouseup", function(e) {
		e.preventDefault();

		// cmd-click for macos
		// ctrl-click for windows
		const middleButton = (e.button == 1) ? true : false;
		if (middleButton) {
			// middle-click, always open in new tab by browser, ignore it to prevent open duplicate tab
			return true;
		}

		const ctrlKey = (isMacOS) ? e.metaKey : e.ctrlKey;
		const leftButton = (e.button == 0) ? true : false;
		const newTab = (ctrlKey && leftButton) ? true : false;

		openURL(e.target.href, newTab);
		return false;
	});

	d.addEventListener("click", function(e) {
		e.preventDefault();
		return false;
	});


})(window, document, browser);


