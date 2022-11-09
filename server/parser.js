/** @param {string} html */
export function parseHTML(html,data) {
	
	const stack = []
	
	html.match( /{{\s*[\s\S]+?\s*}}/g )?.forEach( key => {
		stack.push([ key, data[key.substring(2,key.length-2).trim()] || '&ltundefined&gt' ]);
	})
	
	
	if (stack.length==0) return html;
	
	
	stack.forEach( ([k,v]) => {
		html = html.replace(k,v);
	})
	return html;
}