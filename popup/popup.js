function handleResponse(response) {
	document.body.innerHTML = "";
	let url = response.url;
	let source = response.source;
	let desitinations = response.destinations;

	for (var i = 0, loop = desitinations.length; i < loop; i++) {
		var href = document.createElement("a");
		href.setAttribute("href", url.replace(source, desitinations[i]).replace(/(https?:\/\/)|(\/)+/g, "$1$2"));
		href.appendChild(document.createTextNode(desitinations[i]));
		document.body.appendChild(href);
	}
}

function handleError(error) {
	console.log(error);
}

browser.runtime.sendMessage({
	action: 'getTabLocations'
}).then(handleResponse, handleError);

document.addEventListener("click", (e) => {
	browser.tabs.update({url: e.target.href});
	e.preventDefault();
});

