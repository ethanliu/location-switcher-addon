(function(w, d, b, f) {
	const defaultIconPath = "icons/default.svg";
	var targetImage, targetInput;

	function Route(from, to, iconPath, looped, disabled) {
		this.source = from || "";
		this.destination = to || "";
		this.iconPath = iconPath || defaultIconPath;
		this.looped = looped || false;
		this.disabled = disabled || false;

		// legacy
		this.iconPath = this.iconPath.replace('icons/light/', 'icons/');
		this.iconPath = this.iconPath.replace('icons/dark/', 'icons/');

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
		// getCurrentThemeInfo();

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

	function createTemplate() {
		const elements = [];

		const _img = d.createElement('img');
		_img.src = "icons/default.svg";
		_img.classList = "icon icon-button";
		elements.push(_img);

		const _source = d.createElement('input');
		_source.type = "url";
		_source.name = "source[]";
		_source.value = "";
		_source.placeholder = "http://";
		elements.push(_source);

		const _target = d.createElement('input');
		_target.type = "url";
		_target.name = "target[]";
		_target.value = "";
		_target.placeholder = "http://";
		elements.push(_target);

		const _loop = d.createElement('input');
		_loop.type = "checkbox";
		_loop.name = "loop[]";
		_loop.value = 1;
		_loop.checked = true;
		elements.push(_loop);

		const _disabled = d.createElement('input');
		_disabled.type = "checkbox";
		_disabled.name = "disabled[]";
		_disabled.value = 1;
		_disabled.checked = false;
		elements.push(_disabled);

		const box = d.createElement('div');
		box.className = "row";

		for (let e of elements) {
			const wrap = d.createElement('div');
			wrap.appendChild(e);
			box.appendChild(wrap);
		}

		const _icon = d.createElement('input');
		_icon.type = "hidden";
		_icon.name = "icon[]";
		_icon.value = "";

		const _addButton = d.createElement('button');
		_addButton.type = "button";
		_addButton.className = "add-button";
		_addButton.innerText = "+";

		const _delButton = d.createElement('button');
		_delButton.type = "button";
		_delButton.className = "del-button";
		_delButton.innerText = "-";

		const wrap = d.createElement('div');
		wrap.appendChild(_addButton);
		wrap.appendChild(_delButton);
		wrap.appendChild(_icon);

		box.appendChild(wrap);

		return box;
	}

	function insertOptionAfter(node, data) {
		// const template = Sanitizer.createSafeHTML(d.querySelector(".template").innerHTML);
		// var box = d.createElement('div');
		// box.className = "row";
		// box.setAttribute("draggable", true);
		// box.insertAdjacentHTML('beforeend', Sanitizer.unwrapSafeHTML(template));
		const box = createTemplate();

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
		// else if (targetImage.src.startsWith("http")) {
		// 	d.querySelector("[name='custom']").value = targetImage.src;
		// }
		// else {
		// 	d.querySelector("[name='custom']").value = "";
		// }
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

	// function hexToRgb(hex) {
	// 	const v = parseInt(hex.replace('#', ''), 16);
	// 	const rgb = {
	// 		r: (v >> 16) & 255,
	// 		g: (v >> 8) & 255,
	// 		b: v & 255,
	// 	};
	// 	console.log(hex, rgb);
	// 	return rgb;
	// }
	//
	// function isDark(hex) {
	// 	const rgb = hexToRgb(hex);
	// 	const brightness = (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;
	// 	console.log(brightness);
	// 	return brightness < 128 ? true : false;
	// }

	// theme test

	// function getStyle(themeInfo) {
	// 	console.log(themeInfo);
	// 	if (themeInfo.colors) {
	// 		console.log("accent color : " +  themeInfo.colors.frame);
	// 		// console.log("toolbar : " + themeInfo.colors.toolbar);
	// 		const dark = isDark(themeInfo.colors.frame);
	// 		if (dark) {
	// 			document.getElementsByTagName('body')[0].classList.add('dark');
	// 			// document.documentElement.style.setProperty('--background-color', themeInfo.colors.frame);
	// 			// document.documentElement.style.setProperty('--foreground-color', '#ffffff');
	// 		}
	// 		else {
	// 			document.getElementsByTagName('body')[0].classList.remove('dark');
	// 		}
	// 	}
	// 	else {
	// 		if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
	// 			// document.getElementsByTagName('body')[0].classList.add('dark');
	// 		}
	// 		else {
	// 			// document.getElementsByTagName('body')[0].classList.remove('dark');
	// 		}
	// 	}
	// }
	//
	// async function getCurrentThemeInfo() {
	// 	var themeInfo = await browser.theme.getCurrent();
	// 	getStyle(themeInfo);
	// }


	// main

	d.addEventListener("DOMContentLoaded", load);
	d.querySelector("form").addEventListener("submit", save);

	d.addEventListener("click", (e) => {
		// console.log(e.target);
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
			// targetInput = e.target.nextElementSibling;
			targetInput = e.target.parentElement.parentElement.querySelector("[name='icon[]']");
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
		// else if (e.target.className == 'theme-button') {
		// 	//document.getElementsByTagName('body')[0].classList.toggle('dark');
		// 	if (e.target.checked) {
		// 		document.getElementsByTagName('body')[0].classList.add('dark');
		// 	}
		// 	else {
		// 		document.getElementsByTagName('body')[0].classList.remove('dark');
		// 	}
		// }
		// e.preventDefault();
	});

	d.getElementById("export-button").addEventListener("click", () => {
		b.storage.sync.get(null).then((res) => {
			var json = [];

			if (res.data && res.data.length > 0) {
				for (const item of res.data) {
					let route = new Route(item[0], item[1], item[3], item[2], item[4]);
					if (route.valid()) {
						json.push(route);
					}
				}
			}
			else {
				json.push(new Route("http://localhost/sub", "https://sub.example.com", "", true, false));
				json.push(new Route("http://localhost", "https://example.com", "", true, false));
			}

			const filename = 'location-switcher-addon.json';
			const blob = new Blob([JSON.stringify(json, null, 4)], {type: 'application/json'});
			const url = URL.createObjectURL(blob);

			const a = d.createElement('a');
			a.href = url;
			a.download = filename;
			a.click();

			URL.revokeObjectURL(url);
		});
	});

	d.addEventListener("DOMContentLoaded", () => {
		d.getElementById("import-button").addEventListener("change", e => {
			console.log('[import]', e);

			const file = e.target.files[0] || null;
			if (!file || !file.type.match('application/json')) {
				console.log("invalid file format");
				return;
			}

			const reader = new FileReader();
			reader.onload = () => {
				try {
					const json = JSON.parse(reader.result);
					d.querySelector(".content").innerHTML = "";
					for (const item of json) {
						let route = new Route(item.source, item.destination, item.iconPath, item.looped, item.disabled);
						if (route.valid()) {
							insertOptionAfter(null, route.flatten());
						}
					}
					insertOptionAfter();
				}
				catch (error) {
					alert(error);
				}
			};
			reader.readAsText(file);
		});
	});



})(window, document, browser, document.forms["form"]);
