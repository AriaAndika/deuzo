import { readFile,writeFile } from "fs/promises";

const inlineMap = {
	'*' :'b',
	'_' :'u',
	'/' :'i',
	'`' :'code',
	'~' :'sub',
	'^' :'sup',
};
const lineMap = {
	'?' : e => e,
	'#' : l => {
		const c = l.match(/#+/)[0].length;
		const id = l.match(/{\s*.+\s*}/) || '';
		const content = l.replace(/#+ /,'').replace(id,'');
		return `<h${c}${id ? ` id="${id[0].substring(1,id[0].length-1)}"`:''}>${content}</h${c}>`
	},
	'>' : l => {
		return `<code>${l.replace(/-+ /,'').substring(2)}</code><br>`
	},
	'-' : l => l == '---' ? `<hr>` : `${l}<br>`
};

/** @param {string} md */
function parseMd(md) {
	let out = md;
	out = inline(out);
	out = line(out);
	return out;
}

function inline(md) {
	let out = md;
	const stack = [];
	md.match(RegExp(`(${Object.keys(inlineMap).map(e=>`\\${e}\\S+?\\S*\\${e}`).join('|')})`,'g')).forEach(e=>{
		Object.entries(inlineMap).every( ([k,v]) => {
			if (e.startsWith(k)){
				stack.push([e, `<${v}>${e.substring(1,e.length-1)}</${v}>` ])
				return false;
			}
			return true;
		})
	})
	// link
	md.match(/!*\[.+?\]\(\S+?\)/g).forEach( e => {
		const src = e.match(/\(.+?\)/)[0];
		const alt = e.match(/\[.+?\]/)[0];
		stack.push([e, e.startsWith('!') ?
			`<img src="${src.substring(1,src.length-1)}" alt="${alt.substring(1,alt.length-1)}">` 
			: `<a href="${src.substring(1,src.length-1)}">${alt.substring(1,alt.length-1)}</a>`
		])
	})
	
	//! parsing
	stack.forEach( ([k,v])=> {
		out = out.replace(k,v);
	});
	return out
}

/** @param {string} md */
function line(md) {
	let out = [];
	md.split(`\n`).forEach( ln => {
		ln = ln.replace(/[\n\r]/g,'');
		Object.entries(lineMap).every( ([k,v]) => {
			if (ln.startsWith(k)){
				out.push(v(ln));
				return false;
			}
			return true;
		// }) ? out.push(ln==='' ? `<br>` : `<p>${ln}</p>` ) : undefined;
		}) ? out.push(`${ln}<br>`) : undefined;
		
	})
	
	return out.join('\n');
}
// parseMd(await readFile('src/md/index.md','utf-8'))
await writeFile('src/dist/index.html',parseMd(await readFile('src/md/index.md','utf-8')))