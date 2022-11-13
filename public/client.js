document.querySelectorAll('[ref]').forEach( e => {
	window[e.getAttribute('ref')] = e;
})