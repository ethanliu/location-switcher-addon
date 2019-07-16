(function(w, d, b, f) {
	const defaultIconPath = "icons/light/default.svg";
	var targetImage, targetInput;

	function Route(from, to, iconPath, looped, disabled) {
		this.source = from || "";
		this.destination = to || "";
		this.iconPath = iconPath || defaultIconPath;
		this.looped = looped || false;
		this.disabled = disabled || false;

		this.valid = function() {
			return (this.source === "" && this.destination === "") ? false : true;
		}

		this.flatten = function() {
			return [this.source, this.destination, this.looped, this.iconPath, this.disabled];
		}
	}

	function handleError(error) {
		console.log(error);
	}

	function load() {
		b.storage.sync.get(null).then((res) => {
			if (res.data) {
				let total = res.data.length || 0;
				for (var i = 0; i < total; i++) {
					insertOptionAfter(null, res.data[i]);
				}
			}
			insertOptionAfter();
			f.elements["dark_theme"].checked = res.darkThemeEnabled || false;
			f.elements["sort"].checked = res.sortEnabled || false;
			f.elements["force_popup"].checked = res.forcePopupEnabled || false;
		}, handleError);
	}

	function save() {
		let darkThemeEnabled = f.elements["dark_theme"].checked;
		let sortEnabled = f.elements["sort"].checked;
		let forcePopupEnabled = f.elements["force_popup"].checked;
		let data = collect(f.elements);

		b.storage.sync.set({
			"data": data,
			"darkThemeEnabled": darkThemeEnabled,
			"sortEnabled": sortEnabled,
			"forcePopupEnabled": forcePopupEnabled
		});
		b.runtime.reload();
		// prevent v68 cleanup the content?!
		alert("Saved and reloaded.");
	}

	function collect(e) {
		var data = [];
		var total = e["source[]"].length || 1;
		for (var i = 0; i < total; i++) {
			let source = (e["source[]"][i] || e["source[]"]).value.trim();
			let target = (e["target[]"][i] || e["target[]"]).value.trim();
			let icon = (e["icon[]"][i] || e["icon[]"]).value.trim();
			let loop = (e["loop[]"][i] || e["loop[]"]).checked || false;
			let disabled = (e["disabled[]"][i] || e["disabled[]"]).checked || false;
			let route = new Route(source, target, icon, loop, disabled);
			if (route.valid()) {
				data.push(route.flatten());
			}
		}
		return data;
	}

	function insertOptionAfter(node, data) {
		const template = Sanitizer.createSafeHTML(d.querySelector(".template").innerHTML);
		var box = d.createElement('div');
		box.className = "row";
		// box.setAttribute("draggable", true);
		box.insertAdjacentHTML('beforeend', Sanitizer.unwrapSafeHTML(template));

		if (data) {
			let route = new Route(data[0], data[1], data[3], data[2], data[4]);
			box.querySelector("input[name='source[]']").value = route.source;
			box.querySelector("input[name='target[]']").value = route.destination;
			box.querySelector("input[name='icon[]']").value = route.iconPath;
			box.querySelector("input[name='loop[]']").checked = route.looped;
			box.querySelector("input[name='disabled[]']").checked = route.disabled;

			if (route.iconPath.startsWith("<?xml") || route.iconPath.startsWith("<svg")) {
				box.querySelector(".icon").src = "data:image/svg+xml;base64," + b64EncodeUnicode(route.iconPath);
			}
			else {
				box.querySelector(".icon").src = route.iconPath;
			}
			box.querySelector(".icon").data = route.iconPath;
		}
		// console.log(box);

		if (node) {
			node.parentNode.insertBefore(box, node.nextSibling);
		}
		else {
			d.querySelector(".content").appendChild(box);
		}
	}

	function showIconModal(display) {
		let modal = d.getElementById("modal");
		modal.style.display = display ? "block" : "none";

		if (targetImage.src.startsWith("data:image/svg+xml;base64,")) {
			let value = b64DecodeUnicode(targetImage.src.replace("data:image/svg+xml;base64,", ""));
			d.querySelector("[name='custom']").value = value;
		}
		// else if (!targetImage.src.startsWith("icons/") || !targetImage.src.startsWith("moz-extension://")) {
		else if (targetImage.src.startsWith("http")) {
			d.querySelector("[name='custom']").value = targetImage.src;
		}
		else {
			d.querySelector("[name='custom']").value = "";
		}

	}

	function b64EncodeUnicode(str) {
		// first we use encodeURIComponent to get percent-encoded UTF-8,
		// then we convert the percent encodings into raw bytes which
		// can be fed into btoa.
		return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g,
			function toSolidBytes(match, p1) {
				return String.fromCharCode('0x' + p1);
		}));
	}

	function b64DecodeUnicode(str) {
		// Going backwards: from bytestream, to percent-encoding, to original string.
		return decodeURIComponent(atob(str).split('').map(function(c) {
			return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
		}).join(''));
	}

	// main

	d.addEventListener("DOMContentLoaded", load);
	d.querySelector("form").addEventListener("submit", save);

	d.addEventListener("click", function(e) {
		if (e.target.className == "add-button") {
			insertOptionAfter(e.target.parentNode.parentNode);
		}
		else if (e.target.className == "del-button") {
			e.target.parentNode.parentNode.remove();
			// setTimeout(function() {
				if (d.querySelectorAll(".content .row").length <= 0) {
					insertOptionAfter();
				}
			// }, 100);
		}
		else if (e.target.classList.contains("icon-button")) {
			targetImage = e.target;
			targetInput = e.target.nextElementSibling;
			showIconModal(true);
		}
		else if (e.target.className == "icon") {
			targetImage.src = e.target.attributes.src.value;
			targetInput.value = e.target.attributes.src.value;
			showIconModal(false);
		}
		else if (e.target.className == "custom-icon-button") {
			//https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Working_with_files
			var value = d.querySelector("[name='custom']").value;
			if (value === "") {
				targetImage.src = defaultIconPath;
			}
			else if (value.startsWith("<?xml") || value.startsWith("<svg")) {
				targetImage.src = "data:image/svg+xml;base64," + b64EncodeUnicode(value);
			}
			else {
				targetImage.src = value;
			}
			targetInput.value = value;
			showIconModal(false);
		}
		// e.preventDefault();
	});


})(window, document, browser, document.forms["form"]);
