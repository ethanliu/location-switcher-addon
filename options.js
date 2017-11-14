function saveOptions() {
	var result = [];
	var form = document.forms["form"];
	var total = document.querySelectorAll(".content .row").length;

	for (var i = 0; i < total; i++) {
		var source = form.elements["source[]"][i].value.trim();
		var target = form.elements["target[]"][i].value.trim();
		var loop = form.elements["loop[]"][i].checked;

		if (source == "" || target == "") {
			continue;
		}

		var item = [source, target, loop];
		result.push(item);
	}

	if (result.length > 0) {
		// var json = {};
		// json["locations"] = result;
		browser.storage.sync.set({
			// data: json
			data: result
		});
	}
}

function onError(error) {
	console.log(error);
}

function restoreOptions() {
	var item = browser.storage.sync.get("data");
	item.then((res) => {
		if (res.data && res.data.length > 0) {
			for (var i = 0; i < res.data.length; i++) {
				insertOptionAfter(null, res.data[i]);
			}
		}
		else {
			insertOptionAfter();
		}
	}, onError);
}

function insertOptionAfter(node, data) {
	var template = document.querySelector(".template");
	var box = document.createElement('div');
	box.className = "row";
	// box.innerHTML = template.innerHTML;
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
