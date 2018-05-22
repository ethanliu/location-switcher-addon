function saveOptions() {
	var data = [];
	let form = document.forms["form"];
	let total = document.querySelectorAll(".content .row").length;
	let darkThemeEnabled = form.elements["darktheme"].checked;
	let sortEnabled = form.elements["sort"].checked;

	for (var i = 0; i < total; i++) {
		let source = form.elements["source[]"][i].value.trim();
		let target = form.elements["target[]"][i].value.trim();
		let loop = form.elements["loop[]"][i].checked;

		if (source == "" || target == "") {
			continue;
		}

		let item = [source, target, loop];
		data.push(item);
	}

	browser.storage.sync.set({
		data: data,
		darkThemeEnabled: darkThemeEnabled,
		sortEnabled: sortEnabled
	});

	browser.runtime.reload();
}

function handleError(error) {
	console.log(error);
}

function restoreOptions() {
	browser.storage.sync.get("data").then((res) => {
		if (res.data && res.data.length > 0) {
			for (var i = 0; i < res.data.length; i++) {
				insertOptionAfter(null, res.data[i]);
			}
		}
		else {
			insertOptionAfter();
		}
	}, handleError);

	browser.storage.sync.get("darkThemeEnabled").then((res) => {
		if (res.darkThemeEnabled) {
			document.forms["form"].elements["darktheme"].checked = true;
		}
	}, handleError);

	browser.storage.sync.get("sortEnabled").then((res) => {
		if (res.sortEnabled) {
			document.forms["form"].elements["sort"].checked = true;
		}
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
	}

	if (node) {
		node.parentNode.insertBefore(box, node.nextSibling);
	}
	else {
		document.querySelector(".content").appendChild(box);
	}
}

document.addEventListener("DOMContentLoaded", restoreOptions);
document.querySelector("form").addEventListener("submit", saveOptions);

document.querySelector("body").addEventListener("click", function(e) {
	if (e.target.className == "add-button") {
		insertOptionAfter(e.target.parentNode.parentNode);
	}
	else if (e.target.className == "del-button") {
		if (document.querySelectorAll(".content .row").length <= 1) {
			return;
		}
		e.target.parentNode.parentNode.remove();
	}
	// e.preventDefault();
});
