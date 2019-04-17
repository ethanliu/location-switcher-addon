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
		if (newTab) {
			b.tabs.query({currentWindow: true}, function(tabs) {
				var id = false;
				for (index in tabs) {
					if (tabs[index].url == url) {
						id = tabs[index].id
						break;
					}
				}
				if (!id) {
					b.tabs.create({
						active: true,
						url: url
					}, function() {
						b.browserAction.setPopup({popup: ""});
					});
				}
				else {
					b.tabs.update(id, {
						active: true,
						url: e.target.href
					}, function() {
						b.browserAction.setPopup({popup: ""});
					});
				}
			});
		}
		else {
			// alert("xxxxxxxxxxxxxxxxxx");
			b.tabs.update({url: url}, function(tab) {
				// alert(tab);
				// alert(tab.id);
				// b.browserAction.disable(tab.id, function() {
				// 	setTimeout(function() {
				// 		b.browserAction.enable(tab.id);
				// 	}, 500);
				// });
				// b.browserAction.setPopup(tab.id, {popup: ""});
			});
		}
	}

	b.runtime.sendMessage({
		"action": "getTabLocations"
	}, function(response) {
		handleResponse(response);
	});

	// disable contextmenu
	// Firefox trigger click and show context menu at the same time

	d.addEventListener('contextmenu', function(e) {
		e.preventDefault();
		return false;
	});

	d.addEventListener("mouseup", function(e) {
		// console.log(`${e.button}`);
		// console.log(`${e.buttons}`);
		// console.log(`${e.ctrlKey}`);
		// console.log(`${e.altKey}`);
		// console.log(`${e.metaKey}`);
		// console.log(`${e.shiftKey}`);
		// console.log(`${e.target}`);
		// console.log(`${e.relatedtTarget}`);

		var newTab = false;

		// middle-click
		// cmd-click for macos
		// ctrl-click for windows

		if (e.button == 1 || (isMacOS && e.button == 0 && e.metaKey) || (!isMacOS && e.button == 0 && e.ctrlKey)) {
			newTab = true;
		}

		openURL(e.target.href, newTab);
		return false;
	});

	d.addEventListener("click", function(e) {
		e.preventDefault();
		// let newTab = (isMacOS) ? e.getModifierState("Meta") : e.getModifierState("Control");
		// openURL(e.target.href, false);
		return false;
	});


})(window, document, chrome);


