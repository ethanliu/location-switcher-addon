function saveOptions() {
	var data = [];
	let form = document.forms["form"];
	let total = document.querySelectorAll(".content .row").length;
	let darkThemeEnabled = form.elements["darktheme"].checked;
	let sortEnabled = form.elements["sort"].checked;

	if (total === 1) {
		let source = form.elements["source[]"].value.trim();
		let target = form.elements["target[]"].value.trim();
		let loop = form.elements["loop[]"].checked;
		var icon = form.elements["icon[]"].value.trim();

		if (source !== "" && target !== "") {
			let item = [source, target, loop, icon];
			data.push(item);
		}
	}
	else {
		for (var i = 0; i < total; i++) {
			let source = form.elements["source[]"][i].value.trim();
			let target = form.elements["target[]"][i].value.trim();
			let loop = form.elements["loop[]"][i].checked;
			var icon = form.elements["icon[]"][i].value.trim();

			if (source == "" || target == "") {
				alert("continue");
				continue;
			}

			let item = [source, target, loop, icon];
			data.push(item);
		}
	}

	browser.storage.sync.set({
		"data": data,
		"darkThemeEnabled": darkThemeEnabled,
		"sortEnabled": sortEnabled
	});
	browser.runtime.reload();
}

function handleError(error) {
	// console.log(error);
	alert(error);
}

function restoreOptions() {
	browser.storage.sync.get(null).then((res) => {
		if (res.data && res.data.length > 0) {
			for (var i = 0; i < res.data.length; i++) {
				insertOptionAfter(null, res.data[i]);
			}
		}
		else {
			insertOptionAfter();
		}
		document.forms["form"].elements["darktheme"].checked = res.darkThemeEnabled || false;
		document.forms["form"].elements["sort"].checked = res.sortEnabled || false;
	}, handleError);
}

function insertOptionAfter(node, data) {
	var template = document.querySelector(".template");
	var box = document.createElement('div');
	box.className = "row";
	box.insertAdjacentHTML('beforeend', template.innerHTML);

	if (data) {
		box.querySelector("input[name='source[]']").value = data[0];
		box.querySelector("input[name='target[]']").value = data[1];
		box.querySelector("input[name='loop[]']").checked = data[2];

		let icon = data[3] || "icons/light/default.svg";
		box.querySelector("input[name='icon[]']").value = icon;
		if (icon.startsWith("<?xml") || icon.startsWith("<svg")) {
			box.querySelector(".icon").src = "data:image/svg+xml;base64," + b64EncodeUnicode(icon);
		}
		else {
			box.querySelector(".icon").src = icon;
		}
		// box.querySelector(".icon").data = icon;
	}

	if (node) {
		node.parentNode.insertBefore(box, node.nextSibling);
	}
	else {
		document.querySelector(".content").appendChild(box);
	}
}

function showIconModal(display) {
	let modal = document.getElementById("modal");
	modal.style.display = display ? "block" : "none";

	if (targetImage.src.startsWith("data:image/svg+xml;base64,")) {
		let value = b64DecodeUnicode(targetImage.src.replace("data:image/svg+xml;base64,", ""));
		document.querySelector("[name='custom']").value = value;
	}
	// else if (!targetImage.src.startsWith("icons/") || !targetImage.src.startsWith("moz-extension://")) {
	else if (targetImage.src.startsWith("http")) {
		document.querySelector("[name='custom']").value = targetImage.src;
	}
	else {
		document.querySelector("[name='custom']").value = "";
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

// showIconModal(true);
var targetImage, targetInput;
document.addEventListener("DOMContentLoaded", restoreOptions);
document.querySelector("form").addEventListener("submit", saveOptions);

document.querySelector("body").addEventListener("click", function(e) {
	if (e.target.className == "add-button") {
		insertOptionAfter(e.target.parentNode.parentNode);
	}
	else if (e.target.className == "del-button") {
		// if (document.querySelectorAll(".content .row").length <= 1) {
		// 	return;
		// }
		e.target.parentNode.parentNode.remove();
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
		var value = document.querySelector("[name='custom']").value;
		if (value === "") {
			value = "icons/light/default.svg";
			targetImage.src = value;
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
