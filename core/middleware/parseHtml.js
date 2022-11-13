

/** @param {string} html */
export function parseHTML(html,data) {
	const stack = []
	
	// for
	
	html.match( /{{\s*for \w+?\s*?}}[\s\S]+{{\s*endfor\s*}}/g ).forEach( elem => {
		let out = '';
		let inner = elem.replace(/({{\s*for \w+?\s*?}}|{{\s*endfor\s*}})/g,'');
		let varname = elem.match(/{{\s*for \w+?\s*?}}/)[0].replace(/({{|}}|for)/g,'').trim();
		let key = data[varname];
		
		if (!key) return;
		
		for (let i = 0; i < key.length; i++) {
			out += inner.replace(/{{}}/g,key[i]);
		}
		
		stack.push([elem,out]);
	})
	
	// variables
	html.match( /{{\s*[\s\S]+?\s*}}/g )?.forEach( key => {
		stack.push([ key, data[key.substring(2,key.length-2).trim()] || '&ltundefined&gt' ]);
	})
	
	
	if (stack.length==0) return html;
	stack.forEach( ([k,v]) => { html = html.replace(k,v); })
	
	return html;
}


