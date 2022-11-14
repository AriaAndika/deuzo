// @ts-check

/**
 * @param {string} html
 * @param {{ [x: string]: any; }} data
 */
export function parseHTML(html,data) {
	const stack = []
	const regHead = `{{\\s*for\\s+?\\w+?\\s+?as\\s+\\w+?\\s*?}}`;
	const regEnd = `{{\\s*endfor\\s*}}`

	// console.log(  html.match(RegExp(`${regHead}[\\s\\S]+?${regEnd}`,'g') ))
	
	
	// for
	html.match( RegExp(`${regHead}[\\s\\S]+?${regEnd}`,'g') )?.forEach( loop => {
		let out = '';
		
		const loopHead = loop.match(	RegExp(regHead))?.[0] || undefined;
		let [,loopTarget,,loopId] = loopHead?.substring(2,loopHead.length-2).trim().split(' ') || '';
		let inner = loop.replace( RegExp(`(${regHead}|${regEnd})`,'g') ,'');
		
		const placeholder = [...inner.match( RegExp(`{{\\s*?${loopId}\\S*?\\s*?}}`,'g') ) || ''];
		
		// if array
		if (typeof data[loopTarget][0] != 'object' ){
			for (let dataItr = 0; dataItr < data[loopTarget].length; dataItr++) {
				out += inner.replace(RegExp(placeholder[0],'g'),data[loopTarget][dataItr]);
			}
			stack.push([loop,out]);
			return;
		}
		
		const parsing = (dataItr,placehldItr) => 
		Function('idx', `return idx${placeholder[placehldItr].substring(2, placeholder[placehldItr].length - 2).trim().replace(loopId, '')}`)(data[loopTarget][dataItr])
		
		for (let dataItr = 0; dataItr < data[loopTarget].length; dataItr++) {
			let o = inner;
			for (let plchdrItr = 0; plchdrItr < placeholder.length; plchdrItr++) {
				o = o.replace(placeholder[plchdrItr], parsing(dataItr,plchdrItr) );
			}
			out += o;
		}
		stack.push([loop,out]);
	})
	
	// variables
	html.match( /{{\s*[\s\S]+?\s*}}/g )?.forEach( key => {
		stack.push([ key, data[key.substring(2,key.length-2).trim()] || '&ltundefined&gt' ]);
	})
	
	
	if (stack.length==0) return html;
	stack.forEach( ([k,v]) => { html = html.replace(k,v); })
	
	return html;
}